import { MASK } from '../src/constants';
import Registers from '../src/CPU/Registers'

function setupRegisters() {
  r = new Registers()
}

let r: Registers;

describe.skip("Single registers", () => {
  beforeEach(setupRegisters);


  it('sets A via operator', () => {
    r.A = 55

    expect(r.A).toBe(55)
  })

  it('sets B via setter', () => {
    r.setB(255)

    expect(r.B).toBe(255)
  })

  it('sets F via operator', () => {
    r.F = 55

    expect(r.F).toBe(48)
  })

  it('sets F via setter', () => {
    r.setF(255)

    expect(r.F).toBe(240)
  })


  it('incs D', () => {
    r.D = 5
    r.incD()

    expect(r.D).toBe(6)
  })


  it('decs E', () => {
    r.E = 5
    r.decE()

    expect(r.E).toBe(4)
  })

  it('F is masked to 8 bytes', () => {
    r.F = MASK.byte + 1
    expect(r.F).toBe(0)

    r.F = MASK.byte + 2
    expect(r.F).toBe(0)
  })
})

describe.skip("Combined registers", () => {
  beforeEach(setupRegisters);


  it('sets AF via operator', () => {
    r.AF = 1221
    expect(r.AF).toBe(1216)
    expect(r.A).toBe(4)
    expect(r.F).toBe(192)
  })

  it('sets BC via setter', () => {
    r.setBC(1221)

    expect(r.BC).toBe(1221)
    expect(r.B).toBe(4)
    expect(r.C).toBe(197)
  })


  it('incs DE', () => {
    r.DE = 5
    r.incDE()

    expect(r.DE).toBe(6)
  })


  it('decs HL', () => {
    r.HL = 5
    r.decHL()

    expect(r.HL).toBe(4)
  })

  it('sets HL via operator', () => {
    r.HL = 0xFF0A

    expect(r.HL).toBe(0xFF0A)
  })

  it('sets HL via setter', () => {
    r.setHL(0x0AFF)

    expect(r.HL).toBe(0x0AFF)
  })

  it('AF is masked to 16 bytes', () => {
    r.AF = MASK.byte + 1
    expect(r.AF).toBe(MASK.byte + 1)
    r.AF = MASK.word + 1
    expect(r.AF).toBe(0)

    r.AF = MASK.word + 2
    expect(r.AF).toBe(0)
  })
})

describe.skip("Special registers", () => {
  beforeEach(setupRegisters);


  it('sets PC via operator', () => {
    r.PC = 1221
    expect(r.PC).toBe(1221)
  })

  it('sets SP via setter', () => {
    r.setSP(1262)

    expect(r.SP).toBe(1262)
  })


  it('incs SP', () => {
    r.SP = 5
    r.incSP()

    expect(r.SP).toBe(6)
  })


  it('decs PC', () => {
    r.PC = 5
    r.decPC()

    expect(r.PC).toBe(4)
  })

  it('SP is masked to 16 bytes', () => {
    r.SP = MASK.byte + 1
    expect(r.SP).toBe(MASK.byte + 1)
    r.SP = MASK.word + 1
    expect(r.SP).toBe(0)

    r.SP = MASK.word + 2
    expect(r.SP).toBe(1)
  })
})

describe.skip('Static methods', () => {
  beforeEach(setupRegisters);

  it('sets nth bit', () => {
    Registers.SET(4, r.F, r.setF)

    expect(r.F).toBe(MASK.bit4)

    Registers.SET(5, r.F, r.setF)

    expect(r.F).toBe(MASK.bit4 + MASK.bit5)
  })


  it('sets nth bit', () => {
    r.F = MASK.bit7 + MASK.bit5
    Registers.RES(5, r.F, r.setF)

    expect(r.F).toBe(MASK.bit7)

    Registers.RES(7, r.F, r.setF)

    expect(r.F).toBe(0)
  })
})

describe.skip('Flag registers', () => {
  beforeEach(setupRegisters);

  it('Z can get set & get & is masked to 1 bit', () => {
    r.flagZ = 1
    expect(r.F).toBe(MASK.bit7)
    expect(r.flagZ).toBe(1)

    r.flagZ = 2
    expect(r.F).toBe(0)
    expect(r.flagZ).toBe(0)
  })

  it('H can get set & get & is masked to 1 bit', () => {
    r.flagH = 1
    expect(r.F).toBe(MASK.bit5)
    expect(r.flagH).toBe(1)

    r.flagH = 2
    expect(r.F).toBe(0)
    expect(r.flagH).toBe(0)
  })

  it('H and C can get set & get & is masked to 1 bit', () => {
    r.flagH = 1
    r.flagC = 1
    expect(r.F).toBe(MASK.bit5 + MASK.bit4)
    expect(r.flagH).toBe(1)
    expect(r.flagC).toBe(1)

    r.flagH = 2
    expect(r.F).toBe(MASK.bit4)
    r.flagC = 2

    expect(r.F).toBe(0)
    expect(r.flagH).toBe(0)
    expect(r.flagC).toBe(0)
  })
})