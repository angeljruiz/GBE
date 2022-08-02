import { DIV_ADDR, DIV_FREQ, IE_ADDR, IF_ADDR, INTERRUPTS, LCDC_ADDR, LCDC_BITS, MASK, MISC_REGISTERS, STAT_ADDR, STAT_BITS, TIMER_FREQUENCIES } from '../constants'
import setup from "./setupALU"
import Registers from './Registers';
import Memory from './Memory';

export class ALU extends Registers {
  decoder: Array<() => void> = []
  cb: Array<() => void> = []
  halted: boolean = false
  interrupts: 0 | 1 | 2 = 0
  memory: Memory = new Memory(this)
  cycles: number = TIMER_FREQUENCIES[0]

  pHL: number
  DIVTimer: number
  DIV: number
  TAC: number
  TMA: number
  TIMA: number

  static addMiscRegisters(caller: ALU) {
    const setValue = (addr: number, data: number, position: number) => data & 1 ? ALU.SET(position, caller.memory.read8(addr)) : ALU.RES(position, caller.memory.read8(addr))

    Object.defineProperty(caller, 'pHL', {
      get: () => caller.memory.read8(caller.HL),
      set: (value: number) => caller.memory.write8(caller.HL, value)
    })

    Object.defineProperty(caller, 'interruptsEnabled', {
      get: () => caller.interrupts === 2 ? true : false,
      set: (value: boolean) => value ? caller.interrupts = 1 : caller.interrupts = 0
    })

    Object.keys(INTERRUPTS).forEach((interrupt, index) => {
      const setInterrupt = (addr: number, data: number) => caller.memory.write8(addr, setValue(addr, data, index))
      const getInterrupt = (addr: number) => ((caller.memory.read8(addr) & (1 << index)) >> index) & 1

      Object.defineProperty(caller, `ie${interrupt}`, {
        get: () => getInterrupt(IE_ADDR),
        set: (data: number) => setInterrupt(IE_ADDR, data)
      })
      Object.defineProperty(caller, `if${interrupt}`, {
        get: () => getInterrupt(IF_ADDR),
        set: (data: number) => setInterrupt(IF_ADDR, data)
      })
    })

    LCDC_BITS.forEach((control, index) => {
      const setControl = (data: number) => caller.memory.write8(LCDC_ADDR, setValue(LCDC_ADDR, data, index))
      const getControl = (): number => ((caller.memory.read8(LCDC_ADDR) & (1 << index)) >> index) & 1

      Object.defineProperty(caller, `lcdc${control}`, {
        get: getControl,
        set: setControl
      })
    })

    STAT_BITS.forEach((status, index) => {
      const setControl = (data: number) => {
        let value = ALU.RES(index + 1, caller.memory.read8(STAT_ADDR))
        if (status === 'Mode') value = ALU.RES(0, value)
        data &= status === 'Mode' ? 3 : 1

        caller.memory.write8(STAT_ADDR, value + (data << (status === 'Mode' ? 0 : (index + 1))))
      }
      const getControl = (): number => {
        const shift = status === 'Mode' ? index : index + 1
        return (caller.memory.read8(STAT_ADDR) & (status === 'Mode' ? 3 : (1 << shift))) >> shift
      }

      Object.defineProperty(caller, `stat${status}`, {
        get: getControl,
        set: setControl
      })
    })
    MISC_REGISTERS.forEach(register => {
      Object.defineProperty(caller, register.name, {
        get: () => caller.memory.read8(register.address),
        set: (value: number) => register.zero ? caller.memory.write8(register.address, 0) : caller.memory.write8(register.address, value % (register.max ? register.max : MASK.byte))
      })
    })
  }

  constructor() {
    super()

    ALU.addMiscRegisters(this)
    setup(this)
  }

  handleInterrupts = () => {
    if (!this.interruptsEnabled) return

    Object.keys(INTERRUPTS).forEach((interrupt: keyof typeof INTERRUPTS) => {
      let ieInterrupt = this[`ie${interrupt}`],
        ifInterrupt = this[`if${interrupt}`]

      if (ieInterrupt && ifInterrupt) {
        this.interruptsEnabled = false
        this[`if${interrupt}`] = 0;

        this.SP -= 2
        this.memory.write16(this.SP, this.PC)
        this.PC = INTERRUPTS[interrupt]
      }
    })
  }

  setpHL = (value: number) => this.memory.write8(this.HL, value)
  DI = () => this.interrupts = 0
  EI = () => this.interrupts = 1
  STOP = () => (this.halted = true, this.DIV = 0)
  HALT = () => this.halted = true
  DAA = () => {
    let correction = 0

    if (this.flagH || (!this.flagN && (this.A & 0xF) > 9)) correction |= 0x6
    if (this.flagC || (!this.flagN && this.A > 0x99)) {
      correction |= 0x60
      this.flagC = 1
    }

    this.A += this.flagN ? -correction : correction
    this.setZeroFlag(this.A)
    this.flagH = 0
  }

  SCF = () => {
    this.flagN = 0
    this.flagH = 0
    this.flagC = 1
  }

  JP = (value: number, mask: number = 0, negate: boolean = false) => {
    this.lCycles = 12
    if (mask && !this.matchFlag(mask, negate)) return

    this.lCycles = 16
    this.PC = value
  }
  JR = (mask: number = 0, negate: boolean = false) => {
    this.lCycles = 8
    if (mask && !this.matchFlag(mask, negate)) return this.PC += 1

    const value = this.memory.get8()
    this.lCycles = 12
    this.PC += ALU.convertSignedNumber(value)
  }
  CALL = (mask: number = 0, negate: boolean = false) => {
    if (mask && !this.matchFlag(mask, negate)) return this.PC += 2

    this.SP -= 2
    this.memory.write16(this.SP, this.PC + 2)
    this.PC = this.memory.get16()
  }
  RET = (mask: number = 0, negate: boolean = false) => {
    this.lCycles = mask === 0 ? 16 : 8
    if (mask && !this.matchFlag(mask, negate)) return

    this.lCycles = 20
    this.PC = this.memory.read16(this.SP)
    this.SP += 2
  }
  RETI = () => { this.EI(); this.RET(); }
  RST = (value: number) => {
    this.SP -= 2
    this.memory.write16(this.SP, this.PC)
    this.PC = value & 0xF
  }
  POP = (write: (value: number) => void) => { write(this.memory.read16(this.SP)); this.SP += 2 }
  PUSH = (value: number) => {
    this.SP -= 2
    this.memory.write16(this.SP, value)
  }

  AND = (value: number) => { this.A &= value; this.resetFlags(this.A); this.flagH = 1 }
  OR = (value: number) => { this.A |= value; this.resetFlags(this.A) }
  XOR = (value: number) => { this.A ^= value; this.resetFlags(this.A) }

  ADD = (valueB: number, valueA: number, write: (arg: number) => void, carry: boolean = false, add16: boolean = false) => {
    const result = valueA + valueB + (carry ? this.flagC : 0)

    if (write === this.setSP) this.flagZ = 0
    else if (write !== this.setHL) this.setZeroFlag(result & MASK.byte)
    this.flagN = 0
    this.setCarryFlags(valueA, valueB, carry, false, add16)

    write(result & MASK.word)
  }
  SUB = (value: number, carry: boolean = false) => {
    const result = this.A - value - (carry ? this.flagC : 0)
    this.setZeroFlag(result & MASK.byte)
    this.flagN = 1
    this.setCarryFlags(this.A, value, carry, true)
    this.setA(result & MASK.word)
  }

  RLA = (carry: boolean = false) => {
    const c = this.flagC
    this.resetFlags(1)
    this.flagC = (this.A & MASK.bit7) >> 7
    this.A = ((this.A << 1) & MASK.word) + (carry ? (this.A & MASK.bit7) >> 7 : c)
  }
  RRA = (carry: boolean = false) => {
    const c = this.flagC
    this.resetFlags(1)
    this.flagC = this.A & MASK.bit0
    this.A = (this.A >> 1) + (carry ? (this.A & MASK.bit0) << 7 : c << 7)
  }

  RL = (value: number, write: (arg: number) => void, carry: boolean = false) => {
    const result = (((value << 1) & MASK.word) + (carry ? ((value & MASK.bit7) >> 7) : this.flagC)) & MASK.byte
    this.resetFlags(result)
    this.flagC = (value & MASK.bit7) >> 7
    write(result)
  }
  RR = (value: number, write: (arg: number) => void, carry: boolean = false) => {
    const result = (value >> 1) + (carry ? ((value & 1) << 7) : this.flagC << 7) & MASK.byte
    this.resetFlags(result)
    this.flagC = value & 1
    write(result)
  }
  SLA = (value: number, write: (arg: number) => void) => {
    const MSB = value & MASK.bit7
    value <<= 1
    value &= MASK.byte
    this.resetFlags(value)
    this.flagC = MSB >> 7
    write(value)
  }
  SRA = (value: number, write: (arg: number) => void) => {
    const MSB = value & MASK.bit7
    const LSB = value & MASK.bit0
    value = (value >> 1) | MSB
    this.resetFlags(value)
    this.flagC = LSB
    write(value)
  }
  SRL = (value: number, write: (arg: number) => void) => {
    const result = value >> 1
    this.resetFlags(result)
    this.flagC = value & 1
    write(result)
  }

  SWAP = (value: number, write: (arg: number) => void) => {
    const top = (value & 0xF0) >> 4
    const bottom = ((value & 0x0F) << 4)
    const result = bottom + top
    this.resetFlags(result)
    write(result)
  }

  CP = (value: number) => {
    const result = (this.A - value) & MASK.byte
    this.setZeroFlag(result)
    this.flagN = 1
    this.setCarryFlags(this.A, value, false, true)
  }
  CPL = () => {
    this.A = 255 - this.A
    this.flagN = 1
    this.flagH = 1
  }
  CCF = () => {
    this.flagN = 0
    this.flagH = 0
    this.flagC = 1 - this.flagC
  }
  BIT = (shift: number, register: number) => {
    const result = Number(!((register & (1 << shift)) >> shift))
    this.flagZ = result
    this.flagN = 0
    this.flagH = 1
  }

  LDHLpSPe = () => {
    const secondVal = ALU.convertSignedNumber(this.memory.get8())

    this.HL = this.SP + secondVal
    this.resetFlags()
    this.setCarryFlags(this.SP, secondVal)
  }
}