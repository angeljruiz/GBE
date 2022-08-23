import { ALU } from './ALU'
import Memory from './Memory'
import ppu from './PPU'
import setupDecoders from './decoder'
import {CLOCK_SPEED, DIV_ADDR, DIV_FREQ, MASK, MAX_CYCLES, TIMER_FREQUENCIES} from '../constants'

export default class CPU extends ALU {
  PPU: ppu = new ppu()

  constructor() {
    super()
    setupDecoders(this)

    // this.memory.write8(DIV_ADDR, 0x18)
    // this.TAC = 0xF8
    // this.IF = 0xE1
    // this.OBP0 = 0xFF
    // this.OBP1 = 0xFF
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

  updateDIV = () => {
    this.DIVCounter += this.lCycles

    if (this.DIVCounter >= CLOCK_SPEED / DIV_FREQ) {
      this.DIVCounter = 0
      this.memory.all[DIV_ADDR] = (this.memory.all[DIV_ADDR] + 1) & 0xFF
    }
  }

  updateTimer = () => {
    if (!(this.TAC & MASK.bit2)) return

    this.cycles -= this.lCycles

    if (this.cycles <= 0) {
      this.cycles = CLOCK_SPEED / TIMER_FREQUENCIES[this.TAC & 3]

      this.TIMA += 1

      if (this.TIMA === 0) {
        this.TIMA = this.TMA
        this.ifTimer = true
      }
    }
  }

  step = (CB = false) => {
    if (this.halted) {
      this.NOP()
    } else {
      CPU.step(this, CB)
    }
    this.updateDIV()
    this.updateTimer()
    this.handleInterrupts()
  }

  execute = async () => {
    do {
      this.step()
    } while (this.PC !== 0 && this.PC !== this.stop)
  }

  static step(caller: CPU, CB: boolean = false) {
    caller.lCycles = 0

    const opcode = caller.memory.get8()
    const func = CB ? caller.cb[opcode] : caller.decoder[opcode]

    func()
  }
}