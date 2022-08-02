import { ZMask, CMask, MASK } from '../src/constants'
import { ALU } from '../src/CPU/ALU'
import '../src/CPU/setupALU'

let c: ALU
const startingSP = 0xFFFC

function setAllFlags(a: ALU) {
  c.flagZ = 1
  c.flagN = 1
  c.flagH = 1
  c.flagC = 1
}

describe.skip('ALU opcodes', () => {
  beforeEach(() => { c = new ALU(); c.SP = startingSP; setAllFlags(c); });

  it('CP', () => {
    c.flagC = 0
    c.A = 1

    c.CP(3)

    expect(c.flagC).toBe(1)
  })

  it('DEC', () => {
    c.B = 1
    c.flagZ = 0
    c.flagN = 0

    c.decB()

    expect(c.B).toBe(0)
    expect(c.flagZ).toBe(1)
    expect(c.flagN).toBe(1)
  })

  it('JP', () => {
    c.JP(0xFFFE)

    expect(c.PC).toBe(0xFFFE)

    c.JP(0x223)

    expect(c.PC).toBe(0x223)
  })

  it('JP with false Z condition', () => {
    c.flagZ = 0
    c.JP(0xFEFF, ZMask)

    expect(c.PC).toBe(0)
  })

  it('JP with Z condition', () => {
    c.JP(0xFEFF, ZMask)

    expect(c.PC).toBe(0xFEFF)
  })

  it('JP with NZ condition', () => {
    c.flagZ = 0
    c.JP(0xFEFF, ZMask, true)

    expect(c.PC).toBe(0xFEFF)
  })

  it('JP with false NZ condition', () => {
    c.JP(0xFEFF, ZMask, true)

    expect(c.PC).toBe(0)
  })

  it('JR postive', () => {
    c.memory.write8(c.PC, 0x1B)

    c.JR()

    expect(c.PC).toBe(0x1C)
  })

  it('JR negative', () => {
    c.PC = 0x1B
    c.memory.write8(c.PC, 0xE5)

    c.JR()

    expect(c.PC).toBe(1)
  })

  it('CALL', () => {
    c.SP = 5
    c.PC = 20
    c.memory.write16(c.PC, 0xFFFA)

    c.CALL()

    expect(c.PC).toBe(0xFFFA)
    expect(c.SP).toBe(3)
  })

  it('CALL with C condition', () => {
    c.SP = 5
    c.PC = 20
    c.memory.all[c.PC] = 249
    c.memory.all[c.PC + 1] = 255

    c.CALL(CMask)

    expect(c.PC).toBe(0xFFF9)
    expect(c.SP).toBe(3)
  })

  it('CALL with not C condition', () => {
    c.SP = 5
    c.PC = 20
    c.memory.all[c.PC] = 249
    c.memory.all[c.PC + 1] = 255
    c.flagC = 0

    c.CALL(CMask)

    expect(c.PC).toBe(22)
    expect(c.SP).toBe(5)
  })

  it('RET', () => {
    c.memory.write16(c.SP, 0xA0A1)

    c.RET()

    expect(c.PC).toBe(0xA0A1)
    expect(c.SP).toBe(startingSP + 2)
  })

  it('RST', () => {
    c.PC = 0xCDFA

    c.RST(0x08)

    expect(c.PC).toBe(0x08)
    expect(c.memory.read16(c.SP)).toBe(0xCDFA)
    expect(c.SP).toBe(startingSP - 2)
  })

  it('POP', () => {
    c.memory.write16(c.SP, 0xCCFA)

    c.POP(c.setBC)

    expect(c.BC).toBe(0xCCFA)
    expect(c.SP).toBe(startingSP + 2)
  })

  it('PUSH', () => {
    c.DE = 0xDCEA

    c.PUSH(c.DE)

    expect(c.memory.read16(c.SP)).toBe(0xDCEA)
    expect(c.SP).toBe(startingSP - 2)
  })

  it('AND', () => {
    c.A = 5
    c.B = 12
    c.flagH = 0

    c.AND(c.B)

    expect(c.A).toBe(4)
    expect(c.flagZ).toBe(0)
    expect(c.flagN).toBe(0)
    expect(c.flagH).toBe(1)
    expect(c.flagC).toBe(0)
  })

  it('AND with zero', () => {
    c.A = 1

    c.AND(2)

    expect(c.A).toBe(0)
    expect(c.flagZ).toBe(1)
    expect(c.flagN).toBe(0)
    expect(c.flagH).toBe(1)
    expect(c.flagC).toBe(0)
  })

  it('OR', () => {
    c.A = 2
    c.B = 1

    c.OR(c.B)

    expect(c.A).toBe(3)
    expect(c.flagZ).toBe(0)
    expect(c.flagN).toBe(0)
    expect(c.flagH).toBe(0)
    expect(c.flagC).toBe(0)
  })

  it('ADD with half carry', () => {
    c.A = 15
    c.B = 1
    const result = c.A + c.B

    c.ADDrA(c.B)

    expect(c.A).toBe(result & MASK.byte)
    expect(c.flagZ).toBe(0)
    expect(c.flagN).toBe(0)
    expect(c.flagH).toBe(1)
    expect(c.flagC).toBe(0)
  })

  it('ADD with carry', () => {
    c.A = 247
    c.B = 128
    const result = c.A + c.B

    c.ADDrA(c.B)

    expect(c.A).toBe(result & MASK.byte)
    expect(c.flagZ).toBe(0)
    expect(c.flagN).toBe(0)
    expect(c.flagH).toBe(0)
    expect(c.flagC).toBe(1)
  })

  it('ADD with zero', () => {
    c.A = 128
    c.B = 128
    const result = c.A + c.B

    c.ADDrA(c.B)

    expect(c.A).toBe(result & MASK.byte)
    expect(c.flagZ).toBe(1)
    expect(c.flagN).toBe(0)
    expect(c.flagH).toBe(0)
    expect(c.flagC).toBe(1)
  })

  it('ADC with half carry', () => {
    c.A = 15
    c.B = 1
    const result = c.A + c.B + c.flagC

    c.ADC(c.B)

    expect(c.A).toBe(result & MASK.byte)
    expect(c.flagZ).toBe(0)
    expect(c.flagN).toBe(0)
    expect(c.flagH).toBe(1)
    expect(c.flagC).toBe(0)
  })

  it('ADC with carry', () => {
    c.A = 247
    c.B = 128
    c.flagC = 1
    const result = c.A + c.B + c.flagC

    c.ADC(c.B)

    expect(c.A).toBe(result & MASK.byte)
    expect(c.flagZ).toBe(0)
    expect(c.flagN).toBe(0)
    expect(c.flagH).toBe(0)
    expect(c.flagC).toBe(1)
  })

  it('ADC with zero', () => {
    c.A = 128
    c.B = 127
    const result = c.A + c.B + c.flagC

    c.ADC(c.B)

    expect(c.A).toBe(result & MASK.byte)
    expect(c.flagZ).toBe(1)
    expect(c.flagN).toBe(0)
    expect(c.flagH).toBe(1)
    expect(c.flagC).toBe(1)
  })

  it('SUB', () => {
    c.A = 128
    c.B = 128
    const result = c.A - c.B

    c.SUB(c.B)

    expect(c.A).toBe(result & MASK.byte)
    expect(c.flagZ).toBe(1)
    expect(c.flagN).toBe(1)
    expect(c.flagH).toBe(0)
    expect(c.flagC).toBe(0)
  })

  it('RLCA', () => {
    c.A = 0xCB
    c.flagC = 0

    c.RLCA()

    expect(c.flagC).toBe(1)
    expect(c.A).toBe(0x97)
  })

  it('RLA', () => {
    c.A = 0xCB
    c.flagC = 0

    c.RLA()

    expect(c.flagC).toBe(1)
    expect(c.A).toBe(0x96)
  })

  it('RLA with carry', () => {
    c.A = 0xCB

    c.RLA()

    expect(c.flagC).toBe(1)
    expect(c.A).toBe(0x97)
  })

  it('RRCA', () => {
    c.A = 0xCB
    c.flagC = 0

    c.RRCA()

    expect(c.flagC).toBe(1)
    expect(c.A).toBe(0xE5)
  })

  it('RRA', () => {
    c.A = 0xCB
    c.flagC = 0

    c.RRA()

    expect(c.flagC).toBe(1)
    expect(c.A).toBe(0x65)
  })


  it('RRA with carry', () => {
    c.A = 0xCB

    c.RRA()

    expect(c.flagC).toBe(1)
    expect(c.A).toBe(0xE5)
  })

  it('RLC', () => {
    c.B = 0xCB
    c.flagC = 0

    c.RLCrB()

    expect(c.flagC).toBe(1)
    expect(c.B).toBe(0x97)
  })

  it('RLC with 0 MSB', () => {
    c.B = 0x4B

    c.RLCrB()

    expect(c.flagC).toBe(0)
    expect(c.B).toBe(0x96)
  })

  it('RL', () => {
    c.B = 0xCB
    c.flagC = 0

    c.RLrB()

    expect(c.flagC).toBe(1)
    expect(c.B).toBe(0x96)
  })

  it('RL with carry', () => {
    c.B = 0xCB

    c.RLrB()

    expect(c.flagC).toBe(1)
    expect(c.B).toBe(0x97)
  })

  it('RRC', () => {
    c.B = 0xCB
    c.flagC = 0

    c.RRCrB()

    expect(c.flagC).toBe(1)
    expect(c.B).toBe(0xE5)
  })

  it('RRC with 0 LSB', () => {
    c.B = 0x4A

    c.RRCrB()

    expect(c.flagC).toBe(0)
    expect(c.B).toBe(0x25)
  })

  it('RR', () => {
    c.B = 0xCB
    c.flagC = 0

    c.RRrB()

    expect(c.flagC).toBe(1)
    expect(c.B).toBe(0x65)
  })

  it('RR with carry', () => {
    c.B = 0xCB

    c.RRrB()

    expect(c.flagC).toBe(1)
    expect(c.B).toBe(0xE5)
  })

  it('SLA', () => {
    c.E = 0xA9
    c.flagC = 0

    c.SLArE()

    expect(c.flagC).toBe(1)
    expect(c.E).toBe(0x52)
  })

  it('SLA with 0 MSB', () => {
    c.E = 0x29

    c.SLArE()

    expect(c.flagC).toBe(0)
    expect(c.E).toBe(0x52)
  })

  it('SRA', () => {
    c.E = 0xA9
    c.flagC = 0

    c.SRArE()

    expect(c.flagC).toBe(1)
    expect(c.E).toBe(0xD4)
  })

  it('SRA with 0 MSB', () => {
    c.E = 0x28

    c.SRArE()

    expect(c.flagC).toBe(0)
    expect(c.E).toBe(0x14)
  })

  it('SRL', () => {
    c.E = 0xA9
    c.flagC = 0

    c.SRLrE()

    expect(c.flagC).toBe(1)
    expect(c.E).toBe(0x54)
  })

  it('SRL with 0 LSB', () => {
    c.E = 0x28

    c.SRLrE()

    expect(c.flagC).toBe(0)
    expect(c.E).toBe(0x14)
  })

  it('BIT', () => {
    c.BITrB(MASK.bit2)

    expect(c.flagZ).toBe(1)

    c.BITrB(MASK.bit2)
    expect(c.flagZ).toBe(1)
  })

  it('CP', () => {
    c.A = 0x27

    c.CP(0x3)

    expect(c.flagH).toBe(0)
    expect(c.flagC).toBe(0)
  })

  it('SWAP', () => {
    c.A = 0xBC

    c.SWAP(c.A, c.setA)

    expect(c.A).toBe(0xCB)
  })
})