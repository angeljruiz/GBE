import { MASK } from '../src/constants'
import CPU from "../src/CPU"
import * as fs from 'fs'

const c = new CPU()
let previousValue: number
let carryFlag: number

const bootROM = fs.readFileSync(`ROMs/dmg_boot.gb`)

for (let opcode of bootROM) {
  c.write8(c.PC++, opcode);
}

c.PC = 0

function before() {
  c.step()
}

describe.skip('Boot sequence', () => {
  beforeEach(before)

  it('Sets SP', () => {
    expect(c.PC).toBe(3)
    expect(c.SP).toBe(0xFFFE)
  })

  it('Sets A to 0', () => {
    expect(c.A).toBe(0)
  })

  it('Sets HL to 0x9FFF', () => {
    expect(c.HL).toBe(0x9FFF)

    previousValue = c.HL
  })

  it('Sets (HL-) to A 0x2000 cycles * 3 opcodes many times', () => {
    expect(c.HL).toBe(previousValue - 1)
    expect(c.read8(c.HL + 1)).toBe(0)

    c.HL = 0x7FFF
  })

  it('Sets the Z flag', () => {
    expect(c.flagZ).toBe(1)
    c.step()
  })

  it('Sets HL to 0xFF26', () => {
    expect(c.HL).toBe(0xFF26)
  })

  it('Sets C to 0x11', () => {
    expect(c.C).toBe(0x11)
  })

  it('Sets A to 0x80', () => {
    expect(c.A).toBe(0x80)
  })

  it('Sets (HL-) to A', () => {
    expect(c.read8(c.HL + 1)).toBe(c.A)
  })

  it('Sets (C) to A', () => {
    expect(c.read8(0xFF00 + c.C)).toBe(c.A)

    previousValue = c.C
  })

  it('Incs C', () => {
    expect(c.C).toBe(previousValue + 1)
  })

  it('Sets A to 0xF3', () => {
    expect(c.A).toBe(0xF3)
  })

  it('Sets (C) to A', () => {
    expect(c.read8(0xFF00 + c.C)).toBe(c.A)

  })

  it('Sets (HL-) to A', () => {
    expect(c.read8(c.HL + 1)).toBe(c.A)
  })

  it('Sets A to 0x77', () => {
    expect(c.A).toBe(0x77)
  })

  it('Sets (HL) to A', () => {
    expect(c.pHL).toBe(c.A)
  })

  it('Sets A to 0xFC', () => {
    expect(c.A).toBe(0xFC)
  })

  it('sets (47) to A', () => {
    expect(c.read8(0xFF47)).toBe(c.A)
  })

  it('Sets DE to 0x104', () => {
    expect(c.DE).toBe(0x104)
  })

  it('Sets HL to 0x8010', () => {
    expect(c.HL).toBe(0x8010)
  })

  it('Sets A to (DE)', () => {
    expect(c.A).toBe(c.read8(c.DE))

    previousValue = c.SP
  })

  it('CALLS 0x95', () => {
    expect(c.SP).toBe(previousValue - 2)
    expect(c.PC).toBe(0x95)
  })

  it('Sets C to A', () => {
    expect(c.C).toBe(c.A)
  })

  it('Sets B to 0x4', () => {
    expect(c.B).toBe(0x4)

    previousValue = c.SP
  })

  it('Pushes BC', () => {
    expect(c.SP).toBe(previousValue - 2)
    expect(c.memory.read16(c.SP)).toBe(c.BC)

    previousValue = c.C
  })

  it('RL C', () => {
    expect(c.C).toBe(((previousValue << 1) & MASK.byte))

    previousValue = c.A
  })

  it('RLA', () => {
    expect(c.A).toBe(((previousValue << 1) & MASK.byte) + c.flagC)

    previousValue = c.SP
  })

  it('POP BC', () => {
    expect(c.SP).toBe(previousValue + 2)
    expect(c.BC).toBe(c.memory.read16(c.SP - 2))

    previousValue = c.C
  })

  it('RL C', () => {
    expect(c.C).toBe(((previousValue << 1) & MASK.byte) + c.flagC)

    previousValue = c.A
  })

  it('RLA', () => {
    expect(c.A).toBe(((previousValue << 1) & MASK.byte) + c.flagC)

    previousValue = c.B
  })

  it('Decs B', () => {
    expect(c.B).toBe(previousValue - 1)
  })

  it('Jumps and repeats 3 times', () => {
    for (let i = 0; i < 3; i++) {
      expect(c.PC).toBe(0x98)
      previousValue = c.SP

      c.step()

      expect(c.SP).toBe(previousValue - 2)
      expect(c.memory.read16(c.SP)).toBe(c.BC)

      previousValue = c.C
      carryFlag = c.flagC

      c.step()

      expect(c.C).toBe(((previousValue << 1) & MASK.byte) + carryFlag)
      previousValue = c.A
      carryFlag = c.flagC

      c.step()

      expect(c.A).toBe(((previousValue << 1) & MASK.byte) + carryFlag)
      previousValue = c.SP

      c.step()

      expect(c.SP).toBe(previousValue + 2)
      expect(c.BC).toBe(c.memory.read16(c.SP - 2))

      previousValue = c.C
      carryFlag = c.flagC

      c.step()

      expect(c.C).toBe(((previousValue << 1) & MASK.byte) + carryFlag)
      previousValue = c.A
      carryFlag = c.flagC

      c.step()

      expect(c.A).toBe(((previousValue << 1) & MASK.byte) + carryFlag)
      previousValue = c.B

      c.step()

      expect(c.B).toBe(previousValue - 1)

      c.step()
      previousValue = c.A
    }
  })

  it('Sets (HL+) to A', () => {
    expect(previousValue).toBe(c.A)

    previousValue = c.HL
  })

  it('Incs HL', () => {
    expect(c.HL).toBe(previousValue + 1)

    previousValue = c.HL
  })

  it('Sets (HL+) to A', () => {
    expect(previousValue).toBe(c.HL - 1)

    previousValue = c.HL
  })

  it('Incs HL', () => {
    expect(c.HL).toBe(previousValue + 1)

    previousValue = c.SP
  })

  it('RET', () => {
    expect(c.PC).toBe(0x2B)
    expect(c.SP).toBe(previousValue + 2)

    previousValue = c.SP
  })

  it('CALLS 0x96', () => {
    expect(c.PC).toBe(0x96)
    expect(c.SP).toBe(previousValue - 2)
    for (let i = 0; i < 38; i++) {
      c.step()
    }
    previousValue = c.DE
  })

  it('Incs DE', () => {
    expect(c.DE).toBe(previousValue + 1)
  })

  it('Sets E to A', () => {
    expect(c.E).toBe(c.A)
  })

  it('CP 0x34', () => {
    expect(c.flagZ).toBe(0)
    expect(c.flagN).toBe(1)
    expect(c.flagH).toBe(0)
    expect(c.flagC).toBe(1)
  })

  it('JR', () => {
    for (let i = 0; i < 38; i++) {
      c.step()
    }
  })
})


previousValue = c.DE
