import CPU from '../CPU'
import { FormattedState } from '../types'

export function formatState(c: CPU): FormattedState {
  return {
    // PC: c.PC.toString(16),
    // SP: c.SP.toString(16),
    instruction: {
      opcode: c.memory.read8(c.PC).toString(16),
      // nextOpcode: c.memory.read8(c.PC + 1).toString(16),
      instruction: String(c.decoder[c.memory.all[c.PC]]),
      // nextInstruction: String(c.decoder[c.memory.all[c.PC + 1]]),
      // CBInstruction: String(c.cb[c.memory.read8(c.PC + 1)]),
      get8: c.memory.read8(c.PC + 1).toString(16),
      get16: c.memory.read16(c.PC + 1).toString(16),
      pointer: c.memory.read8(c.memory.read16(c.PC + 1)).toString(16)
    },
    cycles: c.cycles.toString(16),
    lCycles: c.lCycles.toString(16),
    // AF: {
    //   AF: c.AF.toString(16),
    //   A: c.A.toString(16),
    //   F: c.F.toString(16),
    // },
    // BC: {
    //   BC: c.BC.toString(16),
    //   B: c.B.toString(16),
    //   C: c.C.toString(16),
    // },
    // DE: {
    //   DE: c.DE.toString(16),
    //   D: c.D.toString(16),
    //   E: c.E.toString(16),
    // },
    // HL: {
    //   HL: c.HL.toString(16),
    //   H: c.H.toString(16),
    //   L: c.L.toString(16),
    // },
    // HLMemoryValues: {
    //   pHLd: c.memory.read8(c.HL - 1).toString(16),
    //   pHL: c.pHL.toString(16),
    //   pHLi: c.memory.read8(c.HL + 1).toString(16),
    // },
    // SPMemoryValues: {
    //   pSPd: c.memory.read16(c.SP - 2).toString(16),
    //   pSP: c.memory.read16(c.SP).toString(16),
    //   pSPi: c.memory.read16(c.SP + 2).toString(16),
    // }
  }
}

export function format8bits(value: number): string { return value.toString(16).padStart(2, '0').toUpperCase() }
export function format16bits(value: number): string { return value.toString(16).padStart(4, '0').toUpperCase() }