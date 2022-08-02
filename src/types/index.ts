import PPU from '../CPU/PPU'
import Memory from '../CPU/Memory'

export type EmptyFuncSignature = () => void
export type WriteFuncSignature = (arg: number) => number
export type GeneralFuncSignature = (arg0: number, arg1: WriteFuncSignature) => void

export type CPUTypes = number |
  GeneralFuncSignature |
  ((arg0: number, arg1: number, arg2: (arg: number) => void) => void) |
  ((arg0: number, arg1: boolean) => void) |
  ((arg: boolean) => void) |
  ((arg0: number, arg1: number, arg2: boolean) => void) |
  ((arg0: EmptyFuncSignature, arg1: number, arg2: number) => void) |
  Array<() => void> |
  Array<number> |
  ((arg: File) => void) |
  boolean |
  string |
  PPU |
  Memory

export type FormattedState = {
  PC?: string,
  SP?: string,
  instruction?: {
    opcode?: string,
    nextOpcode?: string,
    instruction?: string,
    nextInstruction?: string,
    CBInstruction?: string,
    get8?: string,
    get16?: string,
    pointer?: string
  }
  cycles?: string
  lCycles?: string
  AF?: {
    AF?: string,
    A?: string,
    F?: string,
  }
  BC?: {
    BC?: string,
    B?: string,
    C?: string,
  }
  DE?: {
    DE?: string,
    D?: string,
    E?: string,
  }
  HL?: {
    HL?: string,
    H?: string,
    L?: string,
  }
  HLMemoryValues?: {
    pHLd?: string,
    pHL?: string,
    pHLi?: string,
  }
  SPMemoryValues?: {
    pSPd?: string,
    pSP?: string,
    pSPi?: string,
  }
}