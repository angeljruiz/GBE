import CPU from '../src/CPU'
import {
    CLOCK_SPEED,
    DIV_ADDR,
    DIV_FREQ,
    TIMER_FREQUENCIES,
} from "../src/constants";

const c = new CPU()

describe('Timer', () => {
    beforeEach(() => c.PC = 0)

    describe('DIV', () => {
        it('incs DIV', () => {
            c.DIVCounter -= CLOCK_SPEED / DIV_FREQ

            expect(c.DIV).toBe(0)

            c.step()

            expect(c.DIV).toBe(1)
        })

        it('resets when wrote to indirectly', () => {
            c.memory[DIV_ADDR] = 50

            expect(c.DIV).toBe(50)

            c.DIV = 51

            expect(c.DIV).toBe(0)
        })

        it('resets when wrote to directly', () => {
            c.memory[DIV_ADDR] = 50

            expect(c.DIV).toBe(50)

            c.write8(DIV_ADDR, 51)

            expect(c.DIV).toBe(0)
        })
    })

    describe('TIMA', () => {
        it('resets to TMA', () => {
            c.TIMA = 0xFF
            c.TMA = 0x25
            c.TAC = 0x6
            c.cycles = 4

            c.step()

            expect(c.TIMA).toBe(0x25)
            expect(c.cycles).toBe(CLOCK_SPEED / TIMER_FREQUENCIES[2])
        })
    });
})