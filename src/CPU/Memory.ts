import Registers from "./Registers";
import {
    BIOS,
    CLOCK_SPEED,
    DIV_FREQ,
    DIV_ADDR,
    MASK,
    MISC_REGISTERS,
    TAC_ADDR,
} from '../constants'

export default class Memory extends Registers {
    static BIOS: Array<number> = BIOS
    memory: Array<number> = new Array(2 ** 16).fill(0)

    pHL: number
    DIV: number
    DIVCounter: number = CLOCK_SPEED / DIV_FREQ
    TAC: number
    TMA: number
    TIMA: number
    IE: number
    IF: number

    constructor() {
        super();

        MISC_REGISTERS.forEach(register => {
            Object.defineProperty(this, register.name, {
                get: () => this.read8(register.address),
                set: (value: number) => this.write8(register.address, value & (register.max ? register.max : MASK.byte))
            })
        })
    }

    read8 = (addr: number): number => {
        addr &= MASK.word

        if (addr === 0xFF44) return 0x90
        if (addr >= 0xE000 && addr < 0xFE00) addr -= 0x2000

        return this.memory[addr]
    }

    read16 = (addr: number): number => this.read8(addr) + (this.read8(addr + 1) << 8)

    write8 = (addr: number, data: number) => {
        addr &= MASK.word

        if (addr === 0xFF02) console.log(String.fromCharCode(this.read8(0xFF01)))
        if (addr >= 0xE000 && addr < 0xFE00) addr -= 0x2000
        if (addr === DIV_ADDR) {
            data = 0

            if (this.DIV === 1 && this.TAC & MASK.bit2) this.TIMA++
        }

        if (addr === TAC_ADDR && data === 0 && this.TAC === 0x5) this.TIMA++

        this.memory[addr] = data & MASK.byte
    }

    write16 = (addr: number, data: number) => {
        this.write8(addr, data & MASK.byte)
        this.write8(addr + 1, (data & 0xFF00) >> 8)
    }

    get8 = (): number => this.read8(this.PC++)
    get16 = (): number => this.get8() + (this.get8() << 8)

    loadROM = (file: File) => {
        const reader = new FileReader()
        reader.readAsBinaryString(file)
        reader.onload = ({ target: { result: binString } }) => {
            (binString as string).split('').forEach((value: string, index: number) => {
                const opcode = value.charCodeAt(0)
                this.write8(index, opcode)
            })
        }
    }
}
