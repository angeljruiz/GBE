import { ALU } from './ALU'
import ppu from './PPU'
import setupDecoders from './decoder'
import { CLOCK_SPEED, DIV_FREQ, MASK, TIMER_FREQUENCIES } from '../constants'
import { formatState } from "../utils";

export default class CPU extends ALU {
  PPU: ppu = new ppu()

  constructor() {
    super()
    setupDecoders(this)
  }

  updateTimer = () => {
    this.DIVCounter -= this.lCycles

    while (this.DIVCounter <= 0) {
      this.DIVCounter += CLOCK_SPEED / DIV_FREQ
      this.DIV++
    }

    if (!(this.TAC & MASK.bit2)) return

    this.cycles -= this.lCycles

    while (this.cycles <= 0) {
      this.cycles += CLOCK_SPEED / TIMER_FREQUENCIES[this.TAC & 3]

      this.TIMA += 1

      if (this.TIMA === 0) {
        this.TIMA = this.TMA
        this.ifTimer = true
      }
    }
  }

  step = (CB = false) => {
    this.handleInterrupts()

    const opcode = this.halted ? 0 : this.get8()
    const instruction = CB && !this.halted ? this.cb[opcode] : this.decoder[opcode]

    // console.log(instruction)
    // console.log(formatState(this))

    instruction()

    this.updateTimer()
  }

  execute = () => {
    while (!this.stopped) {
      this.step()
    }
  }
}