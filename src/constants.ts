const Z = 7
const N = 6
const H = 5
const C = 4

interface Flags {
  Z: number;
  N: number;
  H: number;
  C: number;
  [key: string]: number
}

export const FLAGS: Flags = {
  Z,
  N,
  H,
  C,
}

export const MASK = {
  bit0: 1,
  bit1: 1 << 1, //2
  bit2: 1 << 2, //4
  bit3: 1 << 3, //8
  bit4: 1 << 4, //16 C
  bit5: 1 << 5, //32 H 
  bit6: 1 << 6, //64 N
  bit7: 1 << 7, //128 Z
  nibble: 0xF,
  byte: 0xFF,
  word: 0xFFFF
}

export const ZMask = MASK.bit7
export const NMask = MASK.bit6
export const HMask = MASK.bit5
export const CMask = MASK.bit4

export const MAX_CYCLES = 69905
export const CLOCK_SPEED = 4194304
export const TIMER_FREQUENCIES = [1024, 16, 64, 256]
export const DIV_FREQ = 16384

export const INTERRUPTS = { VBlank: 0x40, LCDSTAT: 0x48, Timer: 0x50, Serial: 0x58, Joypad: 0x60 }
export const IE_ADDR = 0xFFFF
export const IF_ADDR = 0xFF0F

export const SINGLE_REGISTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'L']
export const HL_REGISTERS = ['pHL', 'rHL']
export const COMBINED_REGISTERS = ['AF', 'BC', 'DE']
export const SPECIAL_REGISTERS = [...HL_REGISTERS, 'PC', 'SP']
export const REGISTERS = [...SINGLE_REGISTERS, ...COMBINED_REGISTERS, ...SPECIAL_REGISTERS]

export const LCDC_ADDR = 0xFF40
export const LCDC_BITS = ['BGWindowEnable', 'ObjEnable', 'ObjSize', 'BGMapOffset', 'TileDataOffset', 'WindowEnable', 'WindowMapOffset', 'Enable']
export const TILE_MAP_OFFSETS = [0x9800, 0x9C00]
export const TILE_DATA_OFFSETS = [0x8800, 0x8000]
export const STAT_ADDR = 0xFF41
export const STAT_BITS = ['Mode', 'LYCLY', 'HBlankEnable', 'VBlankEnable', 'OAMEnable', 'LYCLYEnable']

export const DIV_ADDR = 0xFF04
export const TAC_ADDR = 0xFF07
export const MISC_REGISTERS = [
  {
    name: 'DIV',
    address: DIV_ADDR,
  },
  {
    name: 'TIMA',
    address: 0xFF05,
  },
  {
    name: 'TMA',
    address: 0xFF06,
  },
  {
    name: 'TAC',
    address: TAC_ADDR,
  },
  {
    name: 'SCY',
    address: 0xFF42,
  },
  {
    name: 'SCX',
    address: 0xFF43,
  },
  {
    name: 'LY',
    address: 0xFF44,
    max: 0x99
  },
  {
    name: 'LYC',
    address: 0xFF45,
    max: 0x99
  },
  {
    name: 'BGP',
    address: 0xFF47,
  },
  {
    name: 'OBP0',
    address: 0xFF48,
  },
  {
    name: 'OBP1',
    address: 0xFF49,
  },
  {
    name: 'WY',
    address: 0xFF4A,
  },
  {
    name: 'WX',
    address: 0xFF4B,
  },
  {
    name: 'IE',
    address: IE_ADDR,
  },
  {
    name: 'IF',
    address: IF_ADDR,
  }
]

export const BIOS = [0x0, 0xC3, 0x13, 0x2,
  0xCE, 0xED, 0x66, 0x66, 0xCC, 0x0D, 0x00, 0x0B, 0x03, 0x73, 0x00, 0x83, 0x00, 0x0C, 0x00, 0x0D,
  0x00, 0x08, 0x11, 0x1F, 0x88, 0x89, 0x00, 0x0E, 0xDC, 0xCC, 0x6E, 0xE6, 0xDD, 0xDD, 0xD9, 0x99,
  0xBB, 0xBB, 0x67, 0x63, 0x6E, 0x0E, 0xEC, 0xCC, 0xDD, 0xDC, 0x99, 0x9F, 0xBB, 0xB9, 0x33, 0x3E,
  0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x80, 0x0, 0x0, 0x0, 0x1,
  0x0, 0x0, 0x0, 0x0, 0x0, 0x66
]