import { ALU } from './ALU'
import Memory from './Memory'
import ppu from './PPU'
import setupDecoders from './decoder'
import { DIV_ADDR, MASK, MAX_CYCLES, TIMER_FREQUENCIES } from '../constants'
import { formatState } from '../utils'

export default class CPU extends ALU {
  PPU: ppu = new ppu()

  constructor() {
    super()
    setupDecoders(this)

    this.memory.write8(DIV_ADDR, 0x18)
    this.TAC = 0xF8
    this.IF = 0xE1
    this.OBP0 = 0xFF
    this.OBP1 = 0xFF
  }

  read8 = (addr: number): number => {
    if (addr >= 0x8000 && addr < 0xA000) return this.PPU.VRAM[addr - 0x8000]
    if (addr >= 0xFE00 && addr < 0xFEA0) return this.PPU.OAM[addr - 0xFE00]
    if (addr >= 0x100 && addr <= 0x14D && this.isInBIOS) return Memory.BIOS[addr - 0x100]

    return Memory.read8(this.memory.all, addr)
  }

  write8 = (addr: number, data: number) => {
    if (addr >= 0x8000 && addr < 0xA000) { this.PPU.VRAM[addr - 0x8000] = data; return }
    if (addr >= 0xFE00 && addr < 0xFEA0) { this.PPU.OAM[addr - 0xFE00] = data; return }

    Memory.write8(this.memory.all, addr, data)
  }

  updateDivider = () => {
    this.memory.all[DIV_ADDR] = this.DIV++
  }

  updateTimer = () => {
    this.updateDivider()
    if (!(this.TAC & MASK.bit2)) return

    this.cycles -= this.lCycles

    if (this.cycles <= 0) {
      this.cycles = TIMER_FREQUENCIES[this.TAC & 3]

      if (this.TIMA === 255) {
        this.TIMA = this.TMA
        this.ifTimer = 1
        this.handleInterrupts()
      } else this.TIMA++
    }
  }

  step = (CB = false) => {
    let cycles = 0

    // while (cycles < MAX_CYCLES) {
    CPU.step(this, CB)

    cycles += this.lCycles
    this.updateTimer()
    // }
  }

  execute = async () => {
    do {
      this.step()
    } while (!this.halted && this.PC !== 0)
  }

  static step(caller: CPU, CB: boolean = false) {
    caller.lCycles = 0

    const opcode = caller.memory.get8()
    const func = CB ? caller.cb[opcode] : caller.decoder[opcode]

    func()
    if (caller.interrupts === 1) {
      caller.interrupts = 2
      caller.handleInterrupts()
    }
  }
}