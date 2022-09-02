import Registers from "./Registers";
import { BIOS, DIV_ADDR, MASK } from "../constants"


export default class Memory extends Registers {
    static BIOS: Array<number> = BIOS
    memory: Array<number> = new Array(2 ** 16).fill(0)

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
        if (addr === DIV_ADDR) data = 0;

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
