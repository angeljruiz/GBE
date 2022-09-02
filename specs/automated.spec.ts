const fs = require('fs')
import CPU from '../src/CPU'
import { format16bits, format8bits, formatState } from '../src/utils'

const firstTestLog = fs.readFileSync('ROMs/EpicLog02.txt').toString().split('\n')
const bootROM = fs.readFileSync(`ROMs/02-interrupts.gb`)

let c = new CPU()
let i = 0
let previousOp: number

for (let opcode of bootROM) {
  c.write8(c.PC++, opcode);
}

c.reset()
c.PC = 0x101

afterAll(() => {
  console.log(i)
  console.log(c.TIMA)
})

it('reads the log file', () => {
  for (let log of firstTestLog) {
    let opcode: number
    const setOp = () => opcode = c.read8(c.PC)

    // if (i >= 150000) console.log(formatState(c), log, i)
    // if (i >= 152000) console.log(formatState(c), log, i)
    // console.log(formatState(c), log, i)

    setOp()
    if (previousOp && format8bits(previousOp).match(/[C|D|E|F][7|F]/)) {
      c.step()
      setOp()
      while (!format8bits(opcode).match(/[C|D][0|8|9]/)) { c.step(); setOp() }
      c.step()
    }

    expect(`A: ${format8bits(c.A)} F: ${format8bits(c.F)} B: ${format8bits(c.B)} C: ${format8bits(c.C)} D: ${format8bits(c.D)} E: ${format8bits(c.E)} H: ${format8bits(c.H)} L: ${format8bits(c.L)} SP: ${format16bits(c.SP)} PC: 00:${format16bits(c.PC)} (${format8bits(c.read8(c.PC))} ${format8bits(c.read8(c.PC + 1))} ${format8bits(c.read8(c.PC + 2))} ${format8bits(c.read8(c.PC + 3))})`)
      .toBe(log)
    c.step()
    previousOp = opcode
    i++
    // console.log({ cycles: c.cycles, TIMA: c.TIMA, lCycles: c.lCycles, DIV: c.DIV })
  }
})

