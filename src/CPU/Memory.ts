import { MASK, BIOS, IF_ADDR, IE_ADDR } from '../constants'
import { ALU } from './ALU'

export default class Memory {
  static BIOS: Array<number> = BIOS
  all: Array<number> = new Array(2 ** 16).fill(0)
  pHL: number
  cpu: ALU
  stop: number

  constructor(registers: ALU) {
    this.cpu = registers
  }

  static read8(memory: Array<number>, addr: number): number {
    addr &= MASK.word
    if (addr === 0xFF44) return 0x90
    if (addr >= 0xE000 && addr < 0xFE00) addr -= 0x2000
    return memory[addr]
  }

  static write8(memory: Array<number>, addr: number, data: number) {
    addr &= MASK.word
    if (addr === 0xFF02) console.log(String.fromCharCode(Memory.read8(memory, 0xFF01)))
    if (addr >= 0xE000 && addr < 0xFE00) addr -= 0x2000
    memory[addr] = data & MASK.byte
  }

  read8 = (addr: number): number => Memory.read8(this.all, addr)
  read16 = (addr: number): number => this.read8(addr) + (this.read8(addr + 1) << 8)
  write8 = (addr: number, data: number) => {
    Memory.write8(this.all, addr, data)
    if (addr === IE_ADDR || addr === IF_ADDR) this.cpu.handleInterrupts()
  }
  write16 = (addr: number, data: number) => {
    this.write8(addr, data & MASK.byte)
    this.write8(addr + 1, (data & 0xFF00) >> 8)
  }
  get8 = (): number => this.read8(this.cpu.PC++)
  get16 = (): number => this.get8() + (this.get8() << 8)

  loadROM = (file: File) => {
    const reader = new FileReader()
    reader.readAsBinaryString(file)
    reader.onload = ({ target: { result: binString } }) => {
      (binString as string).split('').forEach((value: string, index: number) => {
        const opcode = value.charCodeAt(0)
        this.write8(index, opcode)
        this.stop = index + 1
      })
    }
  }
}