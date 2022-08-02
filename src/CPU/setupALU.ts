import { SINGLE_REGISTERS } from "../constants"
import { WriteFuncSignature as WFS, GeneralFuncSignature as GFS } from '../types'
import { ALU } from "./ALU"

type GeneratedArgFuncSignature = [number, WFS]

declare module './ALU' {
  interface ALU { //dynamically created
    RLC(arg0: number, arg1: (arg: number) => void): void; RRC(arg0: number, arg1: (arg: number) => void): void; RLCA(): void; RRCA(): void, SBC(arg: number): void, ADC(arg: number): void
    ADDrA(arg: number): void; ADDrHL(arg: number): void; ADDrSP(arg: number): void; ADDrB(arg: number): void, ADDpHL(arg: number): void
    ADCrB(arg: number): void, ADCrC(arg: number): void, ADCrD(arg: number): void, ADCrE(arg: number): void, ADCrH(arg: number): void, ADCrL(arg: number): void, ADCrA(arg: number): void, ADCpHL(arg: number): void
    BITrB(arg: number): void, BITrC(arg: number): void, BITrD(arg: number): void, BITrE(arg: number): void, BITrH(arg: number): void, BITrL(arg: number): void, BITrA(arg: number): void, BITpHL(arg: number): void
    RLCrB(): void, RLCrC(): void, RLCrD(): void, RLCrE(): void, RLCrH(): void, RLCrL(): void, RLCrA(): void, RLCpHL(): void
    RLrB(): void, RLrC(): void, RLrD(): void, RLrE(): void, RLrH(): void, RLrL(): void, RLrA(): void, RLpHL(): void
    RRrB(): void, RRrC(): void, RRrD(): void, RRrE(): void, RRrH(): void, RRrL(): void, RRrA(): void, RRpHL(): void
    SLArB(): void, SLArC(): void, SLArD(): void, SLArE(): void, SLArH(): void, SLArL(): void, SLArA(): void, SLApHL(): void
    SRLrB(): void, SRLrC(): void, SRLrD(): void, SRLrE(): void, SRLrH(): void, SRLrL(): void, SRLrA(): void, SRLpHL(): void
    SRArB(): void, SRArC(): void, SRArD(): void, SRArE(): void, SRArH(): void, SRArL(): void, SRArA(): void, SRApHL(): void
    RRCrB(): void, RRCrC(): void, RRCrD(): void, RRCrE(): void, RRCrH(): void, RRCrL(): void, RRCrA(): void, RRCpHL(): void
    RESrB(arg: number): void, RESrC(arg: number): void, RESrD(arg: number): void, RESrE(arg: number): void, RESrH(arg: number): void, RESrL(arg: number): void, RESrA(arg: number): void, RESpHL(arg: number): void
    SETrB(arg: number): void, SETrC(arg: number): void, SETrD(arg: number): void, SETrE(arg: number): void, SETrH(arg: number): void, SETrL(arg: number): void, SETrA(arg: number): void, SETpHL(arg: number): void
    SWAPrB(): void, SWAPrC(): void, SWAPrD(): void, SWAPrE(): void, SWAPrH(): void, SWAPrL(): void, SWAPrA(): void, SWAPpHL(): void
  }
}

function generateFuncArgs(c: ALU, register: string): GeneratedArgFuncSignature {
  const SETTER_FUNC = c[`set${register}`] as WFS
  const VALUE = Number(c[`${register}`])
  return [VALUE, SETTER_FUNC]
}

const CARRY_OPTIONS = ['C', '']
const DIRECTIONS = ['L', 'R']
const HL_REGISTERS = ['rHL', 'pHL']
const CLASS_METHOD_CALLERS = ['BIT', 'SET', 'RES']
const AUGMENTED_OPCODES = [...CLASS_METHOD_CALLERS, 'SWAP', 'SRL', 'ADD']
const AUGMENTED_REGISTERS = [...SINGLE_REGISTERS, ...HL_REGISTERS].filter(reg => reg !== 'F')

export default function setup(c: ALU) {
  const { constructor: { prototype: p } } = c

  p.RLC = (value: number, write: WFS) => (c.RL(value, write, true))
  p.RRC = (value: number, write: WFS) => (c.RR(value, write, true))
  p.ADC = (value: number) => (c.ADD(c.A, value, c.setA, true))
  p.SBC = (value: number) => (c.SUB(value, true))
  p.RLCA = () => (c.RLA(true))
  p.RRCA = () => (c.RRA(true))
  addShiftOpcodeMethods(c)

  AUGMENTED_REGISTERS.forEach((register) => {
    const dynamicArgs = () => generateFuncArgs(c, register)

    AUGMENTED_OPCODES.forEach(opcode => {
      const readMode = HL_REGISTERS.includes(register) ? '' : 'r'
      const instruction = opcode + readMode + register
      const caller = opcode === 'BIT' ? c : CLASS_METHOD_CALLERS.includes(String(opcode)) ? ALU : c as any // TODO set proper type
      const parentFunction = caller[opcode]

      p[instruction] = (...args: Array<number>) => parentFunction(...args, ...dynamicArgs())
    })
  })
}

function addShiftOpcodeMethods(c: ALU) {
  AUGMENTED_REGISTERS.forEach((register) => {
    const { constructor: { prototype: p } } = c
    const readMode = HL_REGISTERS.includes(register) ? '' : 'r'
    const SHIFT_RIGHT_FUNC_NAME = `SRL${readMode + register}`
    const dynamicArgs = () => generateFuncArgs(c, register)

    p[SHIFT_RIGHT_FUNC_NAME] = () => c.SRL(...dynamicArgs())

    DIRECTIONS.forEach(direction => {
      const SHIFT_A_FUNC_NAME = `S${direction}A${readMode + register}`
      const CHILD_FUNC = c[`S${direction}A`] as GFS

      p[SHIFT_A_FUNC_NAME] = () => CHILD_FUNC(...dynamicArgs())

      CARRY_OPTIONS.forEach((carry) => {
        const FUNC_NAME = `R${direction + carry + readMode + register}`
        const PARENT_FUNC = c[`R${direction + carry}`] as GFS

        p[FUNC_NAME] = () => PARENT_FUNC(...dynamicArgs())
      })
    })
  })
}