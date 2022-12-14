import { ZMask, CMask, MASK } from '../constants'
import CPU from "./"
import './setupALU'

export default function setupDecoder(c: CPU) {
  setupCBDecoder(c)
  setupMainDecoder(c)
}

function setupMainDecoder(c: CPU) {
  const { decoder: d, get8, get16, write8, write16, read8 } = c
  const { CCF, CP, CPL, DAA, RLA, RRA, RLCA, RRCA, SCF, STOP, HALT, step, setZeroFlag, setCarryFlags } = c
  const { ADDrA, ADD, ADC, SUB, SBC, AND, XOR, OR, LDHLpSPe } = c
  const { JP, JR, CALL, DI, EI, RET, RETI, POP, PUSH, RST } = c
  const { setA, incA, decA, setB, incB, decB, setC, incC, decC, setD, incD, decD, setE,
    incE, decE, setH, incH, decH, setL, incL, decL, setSP, incSP, decSP, setAF,
    setBC, incBC, decBC, setDE, incDE, decDE, setHL, setpHL, incHL, decHL
  } = c

  d.push(() => c.NOP()) // 0
  d.push(() => (c.lCycles = 12, setBC(get16())))
  d.push(() => (c.lCycles = 8, write8(c.BC, c.A)))
  d.push(() => (c.lCycles = 8, incBC()))
  d.push(() => (c.lCycles = 4, incB()))
  d.push(() => (c.lCycles = 4, decB()))
  d.push(() => (c.lCycles = 8, setB(get8())))
  d.push(() => RLCA())
  d.push(() => (c.lCycles = 20, write16(get16(), c.SP)))
  d.push(() => (ADD(c.HL, c.BC, c.setHL, false, true), c.lCycles = 8))
  d.push(() => (c.lCycles = 8, setA(read8(c.BC))))
  d.push(() => (c.lCycles = 8, decBC()))
  d.push(() => (c.lCycles = 4, incC()))
  d.push(() => (c.lCycles = 4, decC()))
  d.push(() => (c.lCycles = 8, setC(get8())))
  d.push(() => RRCA())


  d.push(() => STOP()) // 1
  d.push(() => (c.lCycles = 12, setDE(get16())))
  d.push(() => (c.lCycles = 8, write8(c.DE, c.A)))
  d.push(() => (c.lCycles = 8, incDE()))
  d.push(() => (c.lCycles = 4, incD()))
  d.push(() => (c.lCycles = 4, decD()))
  d.push(() => (c.lCycles = 8, setD(get8())))
  d.push(() => RLA())
  d.push(() => JR())
  d.push(() => (ADD(c.HL, c.DE, c.setHL, false, true), c.lCycles = 8))
  d.push(() => (c.lCycles = 8, setA(read8(c.DE))))
  d.push(() => (c.lCycles = 8, decDE()))
  d.push(() => (c.lCycles = 4, incE()))
  d.push(() => (c.lCycles = 4, decE()))
  d.push(() => (c.lCycles = 8, setE(get8())))
  d.push(() => RRA())


  d.push(() => JR(ZMask, true)) // 2
  d.push(() => (c.lCycles = 12, setHL(get16())))
  d.push(() => (c.lCycles = 8, write8(incHL() - 1, c.A)))
  d.push(() => (c.lCycles = 8, incHL()))
  d.push(() => (c.lCycles = 4, incH()))
  d.push(() => (c.lCycles = 4, decH()))
  d.push(() => (c.lCycles = 8, setH(get8())))
  d.push(() => DAA())
  d.push(() => JR(ZMask))
  d.push(() => (ADD(c.HL, c.HL, c.setHL, false, true), c.lCycles = 8))
  d.push(() => (c.lCycles = 8, setA(read8(incHL() - 1))))
  d.push(() => (c.lCycles = 8, decHL()))
  d.push(() => (c.lCycles = 4, incL()))
  d.push(() => (c.lCycles = 4, decL()))
  d.push(() => (c.lCycles = 8, setL(get8())))
  d.push(() => CPL())


  d.push(() => JR(CMask, true)) // 3
  d.push(() => (c.lCycles = 12, setSP(get16())))
  d.push(() => (c.lCycles = 8, write8(decHL() + 1, c.A)))
  d.push(() => (c.lCycles = 8, incSP()))
  d.push(() => {
    const val = (c.pHL + 1) & MASK.byte
    const carryFlag = c.flagC
    setZeroFlag(val)
    c.flagN = 0
    setCarryFlags(c.pHL, 1)
    c.flagC = carryFlag
    c.pHL = val
    c.lCycles = 12
  })
  d.push(() => {
    const val = (c.pHL - 1) & MASK.byte
    setZeroFlag(val)
    c.flagN = 1
    const carryFlag = c.flagC
    setCarryFlags(c.pHL, 1, false, true)
    c.flagC = carryFlag
    c.pHL = val
    c.lCycles = 12
  })
  d.push(() => (c.lCycles = 12, setpHL(get8())))
  d.push(() => SCF())
  d.push(() => JR(CMask))
  d.push(() => (ADD(c.HL, c.SP, c.setHL, false, true), c.lCycles = 8))
  d.push(() => (c.lCycles = 8, setA(read8(decHL() + 1))))
  d.push(() => (c.lCycles = 8, decSP()))
  d.push(() => (c.lCycles = 4, incA()))
  d.push(() => (c.lCycles = 4, decA()))
  d.push(() => (c.lCycles = 8, setA(get8())))
  d.push(() => CCF())


  d.push(() => (c.lCycles = 4, setB(c.B))) // 4
  d.push(() => (c.lCycles = 4, setB(c.C)))
  d.push(() => (c.lCycles = 4, setB(c.D)))
  d.push(() => (c.lCycles = 4, setB(c.E)))
  d.push(() => (c.lCycles = 4, setB(c.H)))
  d.push(() => (c.lCycles = 4, setB(c.L)))
  d.push(() => (c.lCycles = 8, setB(c.pHL)))
  d.push(() => (c.lCycles = 4, setB(c.A)))
  d.push(() => (c.lCycles = 4, setC(c.B)))
  d.push(() => (c.lCycles = 4, setC(c.C)))
  d.push(() => (c.lCycles = 4, setC(c.D)))
  d.push(() => (c.lCycles = 4, setC(c.E)))
  d.push(() => (c.lCycles = 4, setC(c.H)))
  d.push(() => (c.lCycles = 4, setC(c.L)))
  d.push(() => (c.lCycles = 8, setC(c.pHL)))
  d.push(() => (c.lCycles = 4, setC(c.A)))


  d.push(() => (c.lCycles = 4, setD(c.B))) // 5
  d.push(() => (c.lCycles = 4, setD(c.C)))
  d.push(() => (c.lCycles = 4, setD(c.D)))
  d.push(() => (c.lCycles = 4, setD(c.E)))
  d.push(() => (c.lCycles = 4, setD(c.H)))
  d.push(() => (c.lCycles = 4, setD(c.L)))
  d.push(() => (c.lCycles = 8, setD(c.pHL)))
  d.push(() => (c.lCycles = 4, setD(c.A)))
  d.push(() => (c.lCycles = 4, setE(c.B)))
  d.push(() => (c.lCycles = 4, setE(c.C)))
  d.push(() => (c.lCycles = 4, setE(c.D)))
  d.push(() => (c.lCycles = 4, setE(c.E)))
  d.push(() => (c.lCycles = 4, setE(c.H)))
  d.push(() => (c.lCycles = 4, setE(c.L)))
  d.push(() => (c.lCycles = 8, setE(c.pHL)))
  d.push(() => (c.lCycles = 4, setE(c.A)))


  d.push(() => (c.lCycles = 4, setH(c.B))) // 6
  d.push(() => (c.lCycles = 4, setH(c.C)))
  d.push(() => (c.lCycles = 4, setH(c.D)))
  d.push(() => (c.lCycles = 4, setH(c.E)))
  d.push(() => (c.lCycles = 4, setH(c.H)))
  d.push(() => (c.lCycles = 4, setH(c.L)))
  d.push(() => (c.lCycles = 8, setH(c.pHL)))
  d.push(() => (c.lCycles = 4, setH(c.A)))
  d.push(() => (c.lCycles = 4, setL(c.B)))
  d.push(() => (c.lCycles = 4, setL(c.C)))
  d.push(() => (c.lCycles = 4, setL(c.D)))
  d.push(() => (c.lCycles = 4, setL(c.E)))
  d.push(() => (c.lCycles = 4, setL(c.H)))
  d.push(() => (c.lCycles = 4, setL(c.L)))
  d.push(() => (c.lCycles = 8, setL(c.pHL)))
  d.push(() => (c.lCycles = 4, setL(c.A)))


  d.push(() => (c.lCycles = 8, setpHL(c.B))) // 7
  d.push(() => (c.lCycles = 8, setpHL(c.C)))
  d.push(() => (c.lCycles = 8, setpHL(c.D)))
  d.push(() => (c.lCycles = 8, setpHL(c.E)))
  d.push(() => (c.lCycles = 8, setpHL(c.H)))
  d.push(() => (c.lCycles = 8, setpHL(c.L)))
  d.push(() => HALT())
  d.push(() => (setpHL(c.A), c.lCycles = 8))
  d.push(() => (c.lCycles = 4, setA(c.B)))
  d.push(() => (c.lCycles = 4, setA(c.C)))
  d.push(() => (c.lCycles = 4, setA(c.D)))
  d.push(() => (c.lCycles = 4, setA(c.E)))
  d.push(() => (c.lCycles = 4, setA(c.H)))
  d.push(() => (c.lCycles = 4, setA(c.L)))
  d.push(() => (setA(c.pHL), c.lCycles = 8))
  d.push(() => (c.lCycles = 4, setA(c.A)))


  d.push(() => (c.lCycles = 4, ADDrA(c.B))) // 8
  d.push(() => (c.lCycles = 4, ADDrA(c.C)))
  d.push(() => (c.lCycles = 4, ADDrA(c.D)))
  d.push(() => (c.lCycles = 4, ADDrA(c.E)))
  d.push(() => (c.lCycles = 4, ADDrA(c.H)))
  d.push(() => (c.lCycles = 4, ADDrA(c.L)))
  d.push(() => (ADDrA(c.pHL), c.lCycles = 8))
  d.push(() => (c.lCycles = 4, ADDrA(c.A)))
  d.push(() => (c.lCycles = 4, ADC(c.B)))
  d.push(() => (c.lCycles = 4, ADC(c.C)))
  d.push(() => (c.lCycles = 4, ADC(c.D)))
  d.push(() => (c.lCycles = 4, ADC(c.E)))
  d.push(() => (c.lCycles = 4, ADC(c.H)))
  d.push(() => (c.lCycles = 4, ADC(c.L)))
  d.push(() => (ADC(c.pHL), c.lCycles = 8))
  d.push(() => (c.lCycles = 4, ADC(c.A)))


  d.push(() => SUB(c.B)) // 9
  d.push(() => SUB(c.C))
  d.push(() => SUB(c.D))
  d.push(() => SUB(c.E))
  d.push(() => SUB(c.H))
  d.push(() => SUB(c.L))
  d.push(() => (SUB(c.pHL), c.lCycles = 8))
  d.push(() => SUB(c.A))
  d.push(() => SBC(c.B))
  d.push(() => SBC(c.C))
  d.push(() => SBC(c.D))
  d.push(() => SBC(c.E))
  d.push(() => SBC(c.H))
  d.push(() => SBC(c.L))
  d.push(() => (SBC(c.pHL), c.lCycles = 8))
  d.push(() => SBC(c.A))


  d.push(() => AND(c.B)) // A
  d.push(() => AND(c.C))
  d.push(() => AND(c.D))
  d.push(() => AND(c.E))
  d.push(() => AND(c.H))
  d.push(() => AND(c.L))
  d.push(() => (AND(c.pHL), c.lCycles = 8))
  d.push(() => AND(c.A))
  d.push(() => XOR(c.B))
  d.push(() => XOR(c.C))
  d.push(() => XOR(c.D))
  d.push(() => XOR(c.E))
  d.push(() => XOR(c.H))
  d.push(() => XOR(c.L))
  d.push(() => (XOR(c.pHL), c.lCycles = 8))
  d.push(() => XOR(c.A))

  d.push(() => OR(c.B)) // B
  d.push(() => OR(c.C))
  d.push(() => OR(c.D))
  d.push(() => OR(c.E))
  d.push(() => OR(c.H))
  d.push(() => OR(c.L))
  d.push(() => (OR(c.pHL), c.lCycles = 8))
  d.push(() => OR(c.A))
  d.push(() => CP(c.B))
  d.push(() => CP(c.C))
  d.push(() => CP(c.D))
  d.push(() => CP(c.E))
  d.push(() => CP(c.H))
  d.push(() => CP(c.L))
  d.push(() => (CP(c.pHL), c.lCycles = 8))
  d.push(() => CP(c.A))


  d.push(() => RET(ZMask, true)) // C
  d.push(() => POP(setBC))
  d.push(() => JP(get16(), ZMask, true))
  d.push(() => JP(get16()))
  d.push(() => CALL(ZMask, true))
  d.push(() => PUSH(c.BC))
  d.push(() => (ADDrA(get8()), c.lCycles = 8))
  d.push(() => RST(0))
  d.push(() => RET(ZMask))
  d.push(() => RET())
  d.push(() => JP(get16(), ZMask))
  d.push(() => (step(true), c.lCycles += 4))
  d.push(() => CALL(ZMask))
  d.push(() => CALL())
  d.push(() => (ADC(get8()), c.lCycles = 8))
  d.push(() => RST(0x08))


  d.push(() => RET(CMask, true)) // D
  d.push(() => POP(setDE))
  d.push(() => JP(get16(), CMask, true))
  d.push(() => { })
  d.push(() => CALL(CMask, true))
  d.push(() => PUSH(c.DE))
  d.push(() => (SUB(get8()), c.lCycles = 8))
  d.push(() => RST(0x10))
  d.push(() => RET(CMask))
  d.push(() => RETI())
  d.push(() => JP(get16(), CMask))
  d.push(() => { })
  d.push(() => CALL(CMask))
  d.push(() => { })
  d.push(() => (SBC(get8()), c.lCycles = 8))
  d.push(() => RST(0x18))


  d.push(() => (c.lCycles = 12, write8(0xFF00 + get8(), c.A))) // E
  d.push(() => POP(setHL))
  d.push(() => (c.lCycles = 8, write8(0xFF00 + c.C, c.A)))
  d.push(() => { })
  d.push(() => { })
  d.push(() => PUSH(c.HL))
  d.push(() => (AND(get8()), c.lCycles = 8))
  d.push(() => RST(0x20))
  d.push(() => (ADD(c.SP, CPU.convertSignedNumber(get8()), setSP), c.lCycles = 16))
  d.push(() => (JP(c.HL), c.lCycles = 4))
  d.push(() => (c.lCycles = 16, write8(get16(), c.A)))
  d.push(() => { })
  d.push(() => { })
  d.push(() => { })
  d.push(() => (XOR(get8()), c.lCycles = 8))
  d.push(() => RST(0x28))


  d.push(() => (c.lCycles = 12, setA(read8(0xFF00 + get8())))) // F
  d.push(() => POP(setAF))
  d.push(() => (c.lCycles = 8, setA(read8(0xFF00 + c.C))))
  d.push(() => DI())
  d.push(() => { })
  d.push(() => PUSH(c.AF))
  d.push(() => (OR(get8()), c.lCycles = 8))
  d.push(() => RST(0x30))
  d.push(() => LDHLpSPe())
  d.push(() => (c.lCycles = 8, setSP(c.HL)))
  d.push(() => (c.lCycles = 16, setA(read8(get16()))))
  d.push(() => EI())
  d.push(() => { })
  d.push(() => { })
  d.push(() => (CP(get8()), c.lCycles = 8))
  d.push(() => RST(0x38))
}

function setupCBDecoder(c: CPU) {
  const { cb, RLCrB, RLCrC, RLCrD, RLCrE, RLCrH, RLCrL, RLCpHL, RLCrA } = c
  const { RRCrB, RRCrC, RRCrD, RRCrE, RRCrH, RRCrL, RRCpHL, RRCrA } = c
  const { BITrB, BITrC, BITrD, BITrE, BITrH, BITrL, BITpHL, BITrA } = c
  const { RESrB, RESrC, RESrD, RESrE, RESrH, RESrL, RESpHL, RESrA } = c
  const { SETrB, SETrC, SETrD, SETrE, SETrH, SETrL, SETpHL, SETrA } = c
  const { RLrB, RLrC, RLrD, RLrE, RLrH, RLrL, RLpHL, RLrA } = c
  const { SWAPrB, SWAPrC, SWAPrD, SWAPrE, SWAPrH, SWAPpHL, SWAPrL, SWAPrA } = c
  const { SRLrB, SRLrC, SRLrD, SRLrE, SRLrH, SRLpHL, SRLrL, SRLrA } = c
  const { SLArB, SLArC, SLArD, SLArE, SLArH, SLArL, SLApHL, SLArA } = c
  const { SRArB, SRArC, SRArD, SRArE, SRArH, SRArL, SRApHL, SRArA } = c
  const { RRrB, RRrC, RRrD, RRrE, RRrH, RRrL, RRpHL, RRrA } = c

  cb.push(() => (c.lCycles = 8, RLCrB()))
  cb.push(() => (c.lCycles = 8, RLCrC()))
  cb.push(() => (c.lCycles = 8, RLCrD()))
  cb.push(() => (c.lCycles = 8, RLCrE()))
  cb.push(() => (c.lCycles = 8, RLCrH()))
  cb.push(() => (c.lCycles = 8, RLCrL()))
  cb.push(() => (c.lCycles = 16, RLCpHL()))
  cb.push(() => (c.lCycles = 8, RLCrA()))
  cb.push(() => (c.lCycles = 8, RRCrB()))
  cb.push(() => (c.lCycles = 8, RRCrC()))
  cb.push(() => (c.lCycles = 8, RRCrD()))
  cb.push(() => (c.lCycles = 8, RRCrE()))
  cb.push(() => (c.lCycles = 8, RRCrH()))
  cb.push(() => (c.lCycles = 8, RRCrL()))
  cb.push(() => (c.lCycles = 16, RRCpHL()))
  cb.push(() => (c.lCycles = 8, RRCrA()))

  cb.push(() => (c.lCycles = 8, RLrB()))
  cb.push(() => (c.lCycles = 8, RLrC()))
  cb.push(() => (c.lCycles = 8, RLrD()))
  cb.push(() => (c.lCycles = 8, RLrE()))
  cb.push(() => (c.lCycles = 8, RLrH()))
  cb.push(() => (c.lCycles = 8, RLrL()))
  cb.push(() => (c.lCycles = 16, RLpHL()))
  cb.push(() => (c.lCycles = 8, RLrA()))
  cb.push(() => (c.lCycles = 8, RRrB()))
  cb.push(() => (c.lCycles = 8, RRrC()))
  cb.push(() => (c.lCycles = 8, RRrD()))
  cb.push(() => (c.lCycles = 8, RRrE()))
  cb.push(() => (c.lCycles = 8, RRrH()))
  cb.push(() => (c.lCycles = 8, RRrL()))
  cb.push(() => (c.lCycles = 16, RRpHL()))
  cb.push(() => (c.lCycles = 8, RRrA()))

  cb.push(() => (c.lCycles = 8, SLArB()))
  cb.push(() => (c.lCycles = 8, SLArC()))
  cb.push(() => (c.lCycles = 8, SLArD()))
  cb.push(() => (c.lCycles = 8, SLArE()))
  cb.push(() => (c.lCycles = 8, SLArH()))
  cb.push(() => (c.lCycles = 8, SLArL()))
  cb.push(() => (c.lCycles = 16, SLApHL()))
  cb.push(() => (c.lCycles = 8, SLArA()))
  cb.push(() => (c.lCycles = 8, SRArB()))
  cb.push(() => (c.lCycles = 8, SRArC()))
  cb.push(() => (c.lCycles = 8, SRArD()))
  cb.push(() => (c.lCycles = 8, SRArE()))
  cb.push(() => (c.lCycles = 8, SRArH()))
  cb.push(() => (c.lCycles = 8, SRArL()))
  cb.push(() => (c.lCycles = 16, SRApHL()))
  cb.push(() => (c.lCycles = 8, SRArA()))

  cb.push(() => (c.lCycles = 8, SWAPrB()))
  cb.push(() => (c.lCycles = 8, SWAPrC()))
  cb.push(() => (c.lCycles = 8, SWAPrD()))
  cb.push(() => (c.lCycles = 8, SWAPrE()))
  cb.push(() => (c.lCycles = 8, SWAPrH()))
  cb.push(() => (c.lCycles = 8, SWAPrL()))
  cb.push(() => (c.lCycles = 16, SWAPpHL()))
  cb.push(() => (c.lCycles = 8, SWAPrA()))
  cb.push(() => (c.lCycles = 8, SRLrB()))
  cb.push(() => (c.lCycles = 8, SRLrC()))
  cb.push(() => (c.lCycles = 8, SRLrD()))
  cb.push(() => (c.lCycles = 8, SRLrE()))
  cb.push(() => (c.lCycles = 8, SRLrH()))
  cb.push(() => (c.lCycles = 8, SRLrL()))
  cb.push(() => (c.lCycles = 16, SRLpHL()))
  cb.push(() => (c.lCycles = 8, SRLrA()))


  cb.push(() => (c.lCycles = 8, BITrB(0)))
  cb.push(() => (c.lCycles = 8, BITrC(0)))
  cb.push(() => (c.lCycles = 8, BITrD(0)))
  cb.push(() => (c.lCycles = 8, BITrE(0)))
  cb.push(() => (c.lCycles = 8, BITrH(0)))
  cb.push(() => (c.lCycles = 8, BITrL(0)))
  cb.push(() => (c.lCycles = 16, BITpHL(0)))
  cb.push(() => (c.lCycles = 8, BITrA(0)))
  cb.push(() => (c.lCycles = 8, BITrB(1)))
  cb.push(() => (c.lCycles = 8, BITrC(1)))
  cb.push(() => (c.lCycles = 8, BITrD(1)))
  cb.push(() => (c.lCycles = 8, BITrE(1)))
  cb.push(() => (c.lCycles = 8, BITrH(1)))
  cb.push(() => (c.lCycles = 8, BITrL(1)))
  cb.push(() => (c.lCycles = 16, BITpHL(1)))
  cb.push(() => (c.lCycles = 8, BITrA(1)))


  cb.push(() => (c.lCycles = 8, BITrB(2)))
  cb.push(() => (c.lCycles = 8, BITrC(2)))
  cb.push(() => (c.lCycles = 8, BITrD(2)))
  cb.push(() => (c.lCycles = 8, BITrE(2)))
  cb.push(() => (c.lCycles = 8, BITrH(2)))
  cb.push(() => (c.lCycles = 8, BITrL(2)))
  cb.push(() => (c.lCycles = 16, BITpHL(2)))
  cb.push(() => (c.lCycles = 8, BITrA(2)))
  cb.push(() => (c.lCycles = 8, BITrB(3)))
  cb.push(() => (c.lCycles = 8, BITrC(3)))
  cb.push(() => (c.lCycles = 8, BITrD(3)))
  cb.push(() => (c.lCycles = 8, BITrE(3)))
  cb.push(() => (c.lCycles = 8, BITrH(3)))
  cb.push(() => (c.lCycles = 8, BITrL(3)))
  cb.push(() => (c.lCycles = 16, BITpHL(3)))
  cb.push(() => (c.lCycles = 8, BITrA(3)))


  cb.push(() => (c.lCycles = 8, BITrB(4)))
  cb.push(() => (c.lCycles = 8, BITrC(4)))
  cb.push(() => (c.lCycles = 8, BITrD(4)))
  cb.push(() => (c.lCycles = 8, BITrE(4)))
  cb.push(() => (c.lCycles = 8, BITrH(4)))
  cb.push(() => (c.lCycles = 8, BITrL(4)))
  cb.push(() => (c.lCycles = 16, BITpHL(4)))
  cb.push(() => (c.lCycles = 8, BITrA(4)))
  cb.push(() => (c.lCycles = 8, BITrB(5)))
  cb.push(() => (c.lCycles = 8, BITrC(5)))
  cb.push(() => (c.lCycles = 8, BITrD(5)))
  cb.push(() => (c.lCycles = 8, BITrE(5)))
  cb.push(() => (c.lCycles = 8, BITrH(5)))
  cb.push(() => (c.lCycles = 8, BITrL(5)))
  cb.push(() => (c.lCycles = 16, BITpHL(5)))
  cb.push(() => (c.lCycles = 8, BITrA(5)))


  cb.push(() => (c.lCycles = 8, BITrB(6)))
  cb.push(() => (c.lCycles = 8, BITrC(6)))
  cb.push(() => (c.lCycles = 8, BITrD(6)))
  cb.push(() => (c.lCycles = 8, BITrE(6)))
  cb.push(() => (c.lCycles = 8, BITrH(6)))
  cb.push(() => (c.lCycles = 8, BITrL(6)))
  cb.push(() => (c.lCycles = 16, BITpHL(6)))
  cb.push(() => (c.lCycles = 8, BITrA(6)))
  cb.push(() => (c.lCycles = 8, BITrB(7)))
  cb.push(() => (c.lCycles = 8, BITrC(7)))
  cb.push(() => (c.lCycles = 8, BITrD(7)))
  cb.push(() => (c.lCycles = 8, BITrE(7)))
  cb.push(() => (c.lCycles = 8, BITrH(7)))
  cb.push(() => (c.lCycles = 8, BITrL(7)))
  cb.push(() => (c.lCycles = 16, BITpHL(7)))
  cb.push(() => (c.lCycles = 8, BITrA(7)))


  cb.push(() => (c.lCycles = 8, RESrB(0)))
  cb.push(() => (c.lCycles = 8, RESrC(0)))
  cb.push(() => (c.lCycles = 8, RESrD(0)))
  cb.push(() => (c.lCycles = 8, RESrE(0)))
  cb.push(() => (c.lCycles = 8, RESrH(0)))
  cb.push(() => (c.lCycles = 8, RESrL(0)))
  cb.push(() => (c.lCycles = 16, RESpHL(0)))
  cb.push(() => (c.lCycles = 8, RESrA(0)))
  cb.push(() => (c.lCycles = 8, RESrB(1)))
  cb.push(() => (c.lCycles = 8, RESrC(1)))
  cb.push(() => (c.lCycles = 8, RESrD(1)))
  cb.push(() => (c.lCycles = 8, RESrE(1)))
  cb.push(() => (c.lCycles = 8, RESrH(1)))
  cb.push(() => (c.lCycles = 8, RESrL(1)))
  cb.push(() => (c.lCycles = 16, RESpHL(1)))
  cb.push(() => (c.lCycles = 8, RESrA(1)))


  cb.push(() => (c.lCycles = 8, RESrB(2)))
  cb.push(() => (c.lCycles = 8, RESrC(2)))
  cb.push(() => (c.lCycles = 8, RESrD(2)))
  cb.push(() => (c.lCycles = 8, RESrE(2)))
  cb.push(() => (c.lCycles = 8, RESrH(2)))
  cb.push(() => (c.lCycles = 8, RESrL(2)))
  cb.push(() => (c.lCycles = 16, RESpHL(2)))
  cb.push(() => (c.lCycles = 8, RESrA(2)))
  cb.push(() => (c.lCycles = 8, RESrB(3)))
  cb.push(() => (c.lCycles = 8, RESrC(3)))
  cb.push(() => (c.lCycles = 8, RESrD(3)))
  cb.push(() => (c.lCycles = 8, RESrE(3)))
  cb.push(() => (c.lCycles = 8, RESrH(3)))
  cb.push(() => (c.lCycles = 8, RESrL(3)))
  cb.push(() => (c.lCycles = 16, RESpHL(3)))
  cb.push(() => (c.lCycles = 8, RESrA(3)))


  cb.push(() => (c.lCycles = 8, RESrB(4)))
  cb.push(() => (c.lCycles = 8, RESrC(4)))
  cb.push(() => (c.lCycles = 8, RESrD(4)))
  cb.push(() => (c.lCycles = 8, RESrE(4)))
  cb.push(() => (c.lCycles = 8, RESrH(4)))
  cb.push(() => (c.lCycles = 8, RESrL(4)))
  cb.push(() => (c.lCycles = 16, RESpHL(4)))
  cb.push(() => (c.lCycles = 8, RESrA(4)))
  cb.push(() => (c.lCycles = 8, RESrB(5)))
  cb.push(() => (c.lCycles = 8, RESrC(5)))
  cb.push(() => (c.lCycles = 8, RESrD(5)))
  cb.push(() => (c.lCycles = 8, RESrE(5)))
  cb.push(() => (c.lCycles = 8, RESrH(5)))
  cb.push(() => (c.lCycles = 8, RESrL(5)))
  cb.push(() => (c.lCycles = 16, RESpHL(5)))
  cb.push(() => (c.lCycles = 8, RESrA(5)))


  cb.push(() => (c.lCycles = 8, RESrB(6)))
  cb.push(() => (c.lCycles = 8, RESrC(6)))
  cb.push(() => (c.lCycles = 8, RESrD(6)))
  cb.push(() => (c.lCycles = 8, RESrE(6)))
  cb.push(() => (c.lCycles = 8, RESrH(6)))
  cb.push(() => (c.lCycles = 8, RESrL(6)))
  cb.push(() => (c.lCycles = 16, RESpHL(6)))
  cb.push(() => (c.lCycles = 8, RESrA(6)))
  cb.push(() => (c.lCycles = 8, RESrB(7)))
  cb.push(() => (c.lCycles = 8, RESrC(7)))
  cb.push(() => (c.lCycles = 8, RESrD(7)))
  cb.push(() => (c.lCycles = 8, RESrE(7)))
  cb.push(() => (c.lCycles = 8, RESrH(7)))
  cb.push(() => (c.lCycles = 8, RESrL(7)))
  cb.push(() => (c.lCycles = 16, RESpHL(7)))
  cb.push(() => (c.lCycles = 8, RESrA(7)))


  cb.push(() => (c.lCycles = 8, SETrB(0)))
  cb.push(() => (c.lCycles = 8, SETrC(0)))
  cb.push(() => (c.lCycles = 8, SETrD(0)))
  cb.push(() => (c.lCycles = 8, SETrE(0)))
  cb.push(() => (c.lCycles = 8, SETrH(0)))
  cb.push(() => (c.lCycles = 8, SETrL(0)))
  cb.push(() => (c.lCycles = 16, SETpHL(0)))
  cb.push(() => (c.lCycles = 8, SETrA(0)))
  cb.push(() => (c.lCycles = 8, SETrB(1)))
  cb.push(() => (c.lCycles = 8, SETrC(1)))
  cb.push(() => (c.lCycles = 8, SETrD(1)))
  cb.push(() => (c.lCycles = 8, SETrE(1)))
  cb.push(() => (c.lCycles = 8, SETrH(1)))
  cb.push(() => (c.lCycles = 8, SETrL(1)))
  cb.push(() => (c.lCycles = 16, SETpHL(1)))
  cb.push(() => (c.lCycles = 8, SETrA(1)))


  cb.push(() => (c.lCycles = 8, SETrB(2)))
  cb.push(() => (c.lCycles = 8, SETrC(2)))
  cb.push(() => (c.lCycles = 8, SETrD(2)))
  cb.push(() => (c.lCycles = 8, SETrE(2)))
  cb.push(() => (c.lCycles = 8, SETrH(2)))
  cb.push(() => (c.lCycles = 8, SETrL(2)))
  cb.push(() => (c.lCycles = 16, SETpHL(2)))
  cb.push(() => (c.lCycles = 8, SETrA(2)))
  cb.push(() => (c.lCycles = 8, SETrB(3)))
  cb.push(() => (c.lCycles = 8, SETrC(3)))
  cb.push(() => (c.lCycles = 8, SETrD(3)))
  cb.push(() => (c.lCycles = 8, SETrE(3)))
  cb.push(() => (c.lCycles = 8, SETrH(3)))
  cb.push(() => (c.lCycles = 8, SETrL(3)))
  cb.push(() => (c.lCycles = 16, SETpHL(3)))
  cb.push(() => (c.lCycles = 8, SETrA(3)))


  cb.push(() => (c.lCycles = 8, SETrB(4)))
  cb.push(() => (c.lCycles = 8, SETrC(4)))
  cb.push(() => (c.lCycles = 8, SETrD(4)))
  cb.push(() => (c.lCycles = 8, SETrE(4)))
  cb.push(() => (c.lCycles = 8, SETrH(4)))
  cb.push(() => (c.lCycles = 8, SETrL(4)))
  cb.push(() => (c.lCycles = 16, SETpHL(4)))
  cb.push(() => (c.lCycles = 8, SETrA(4)))
  cb.push(() => (c.lCycles = 8, SETrB(5)))
  cb.push(() => (c.lCycles = 8, SETrC(5)))
  cb.push(() => (c.lCycles = 8, SETrD(5)))
  cb.push(() => (c.lCycles = 8, SETrE(5)))
  cb.push(() => (c.lCycles = 8, SETrH(5)))
  cb.push(() => (c.lCycles = 8, SETrL(5)))
  cb.push(() => (c.lCycles = 16, SETpHL(5)))
  cb.push(() => (c.lCycles = 8, SETrA(5)))


  cb.push(() => (c.lCycles = 8, SETrB(6)))
  cb.push(() => (c.lCycles = 8, SETrC(6)))
  cb.push(() => (c.lCycles = 8, SETrD(6)))
  cb.push(() => (c.lCycles = 8, SETrE(6)))
  cb.push(() => (c.lCycles = 8, SETrH(6)))
  cb.push(() => (c.lCycles = 8, SETrL(6)))
  cb.push(() => (c.lCycles = 16, SETpHL(6)))
  cb.push(() => (c.lCycles = 8, SETrA(6)))
  cb.push(() => (c.lCycles = 8, SETrB(7)))
  cb.push(() => (c.lCycles = 8, SETrC(7)))
  cb.push(() => (c.lCycles = 8, SETrD(7)))
  cb.push(() => (c.lCycles = 8, SETrE(7)))
  cb.push(() => (c.lCycles = 8, SETrH(7)))
  cb.push(() => (c.lCycles = 8, SETrL(7)))
  cb.push(() => (c.lCycles = 16, SETpHL(7)))
  cb.push(() => (c.lCycles = 8, SETrA(7)))
}
