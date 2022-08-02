export default class PPU {
  VRAM: Array<number> = new Array(0x2000).fill(0)
  OAM: Array<number> = new Array(0xA0).fill(0)

  constructor() {

  }
}