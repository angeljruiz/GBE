import { CPUTypes } from "../types"
import { REGISTERS, COMBINED_REGISTERS, FLAGS, MASK } from "../constants"

export default interface Registers { // dynamically generated
  A: number, setA(arg: number): number, incA(): number, decA(): number
  B: number, setB(arg: number): number, incB(): number, decB(): number
  C: number, setC(arg: number): number, incC(): number, decC(): number
  D: number, setD(arg: number): number, incD(): number, decD(): number
  E: number, setE(arg: number): number, incE(): number, decE(): number
  F: number, setF(arg: number): number, incF(): number, decF(): number
  H: number, setH(arg: number): number, incH(): number, decH(): number
  L: number, setL(arg: number): number, incL(): number, decL(): number
  PC: number, setPC(arg: number): number, incPC(): number, decPC(): number
  SP: number, setSP(arg: number): number, incSP(): number, decSP(): number
  AF: number, setAF(arg: number): number, incAF(): number, decAF(): number
  BC: number, setBC(arg: number): number, incBC(): number, decBC(): number
  DE: number, setDE(arg: number): number, incDE(): number, decDE(): number
  HL: number, setHL(arg: number): number, incHL(): number, decHL(): number
  flagC: number
}

export default class Registers {
  pc: number
  sp: number
  a: number
  b: number
  c: number
  d: number
  e: number
  f: number
  h: number
  l: number
  lCycles: number
  [key: string]: CPUTypes

  static SET(bit: number, register: number, write?: (arg: number) => void) { const result = register | (1 << bit); if (write) write(result); return result }
  static RES(bit: number, register: number, write?: (arg: number) => void) { const result = register & ~(register & (1 << bit)); if (write) write(result); return result }

  static convertSignedNumber(value: number) { return (value & MASK.bit7) ? -((~value + 1) & MASK.byte) : value }

  checkCarry = (valueA: number, valueB: number, carry: boolean = false, negation: boolean = false, add16: boolean = false): { H: number, C: number } => {
    let result = negation ? valueA - valueB - (carry ? this.flagC : 0) : valueA + valueB + (carry ? this.flagC : 0)
    return {
      H: ((valueA ^ valueB ^ (carry ? this.flagC : 0) ^ result) >> (add16 ? 12 : 4)),
      C: ((valueA ^ valueB ^ (carry ? this.flagC : 0) ^ result) >> (add16 ? 16 : 8))
    }
  }
  setZeroFlag = (value: number) => { this.flagZ = value ? 0 : 1 }
  setCarryFlags = (valueA: number, valueB: number, carry = false, negation: boolean = false, add16: boolean = false) => {
    const carryFlags = this.checkCarry(valueA, valueB, carry, negation, add16)
    this.flagH = carryFlags.H
    this.flagC = carryFlags.C
  }
  matchFlag = (mask: number, negate: boolean): boolean => {
    const result: boolean = Boolean(this.F & mask)
    return negate ? !result : result
  }
  resetFlags = (value: number = 1) => { this.setZeroFlag(value); this.flagN = 0; this.flagH = 0; this.flagC = 0 }

  constructor() {
    REGISTERS.forEach((register: string) => {
      if (register === 'pHL') return
      else if (register === 'rHL') register = 'HL'

      const VALUE_LOWERCASE = register.toLowerCase()
      const setRegister = (value: number): number => {
        if (register.length === 2) {
          if (register !== 'HL' && !COMBINED_REGISTERS.includes(register)) return this[VALUE_LOWERCASE] = value & MASK.word
          this[register[0]] = (value >> 8) & MASK.byte
          this[register[1]] = value & MASK.byte
          return value & MASK.word
        } else return this[VALUE_LOWERCASE] = register === 'F' ? value & 0xF0 : value & MASK.byte
      }
      const generateIncOrDecFunction = (register: string, dec: boolean = false): number => {
        const value = Number(this[register])
        const carryFlag = this.flagC
        const newValue = (value + (dec ? -1 : 1)) & (register.length === 2 ? MASK.word : MASK.byte)
        if (register !== 'SP' && register !== 'HL' && !COMBINED_REGISTERS.includes(register)) {
          this.setZeroFlag(newValue)
          this.flagN = dec ? 1 : 0
          this.setCarryFlags(value, 1, false, dec)
          this.flagC = carryFlag
        }
        return setRegister(newValue)
      }

      Object.defineProperty(this, register, {
        get: () => {
          if (register === 'HL' || COMBINED_REGISTERS.includes(register)) return (Number(this[register[0]]) << 8) + Number(this[register[1]])
          else return this[VALUE_LOWERCASE]
        },
        set: setRegister
      })
      Registers.prototype[`set${register}`] = setRegister
      Registers.prototype[`inc${register}`] = () => generateIncOrDecFunction(register)
      Registers.prototype[`dec${register}`] = () => generateIncOrDecFunction(register, true)
    })

    for (let flag in FLAGS) {
      const mask = FLAGS[flag]

      Object.defineProperty(this, `flag${flag}`, {
        get: () => ((this.F & (1 << mask)) >> mask),
        set: (value: number) => { (value & 1) ? Registers.SET(mask, this.F, this.setF) : Registers.RES(mask, this.F, this.setF) }
      })
    }
  }
}
