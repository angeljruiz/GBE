import CPU from '../src/CPU'

const c = new CPU()

describe.skip('Memory', () => {
  beforeEach(() => c.PC = 0)

  it('reads 8 bits', () => {
    c.memory.all[0xFFCC] = 0xAC

    expect(c.read8(0xFFCC)).toBe(0xAC)
  })

  it('reads 8 bits from VRAM', () => {
    c.PPU.VRAM[0x8232 - 0x8000] = 0xAC

    expect(c.read8(0x8232)).toBe(0xAC)
  })

  it('writes 8 bits from VRAM', () => {
    c.write8(0x9ABB, 0xEE)

    expect(c.PPU.VRAM[0x9ABB - 0x8000]).toBe(0xEE)
  })

  it('writes 8 bits', () => {
    c.write8(0xCCDC, 0xEE)

    expect(c.read8(0xCCDC)).toBe(0xEE)
  })

  it('gets 8 bits', () => {
    c.PC = 0xDDFE
    c.write8(c.PC, 0xF0)

    expect(c.memory.get8()).toBe(0xF0)
  })

  it('writes 16 bits', () => {
    c.memory.write16(0xCADC, 0xEEA3)

    expect(c.memory.read16(0xCADC)).toBe(0xEEA3)
  })

  it('reads 16 bits', () => {
    c.memory.all[0xDFDC] = 0xACDC

    expect(c.memory.read16(0xDFDC)).toBe(0xACDC)
  })

  it('gets 16 bits', () => {
    c.PC = 0x0DF2
    c.memory.write16(c.PC, 0xF0D0)

    expect(c.memory.get16()).toBe(0xF0D0)
  })
})