import CPU from './CPU/index'
import './CPU/Registers'

const selectedFile = document.getElementById('ROM') as HTMLInputElement
selectedFile.addEventListener('change', handleUpload, false)

const cpu = new CPU()

declare global {
  interface Window { c: CPU }
}

window.c = cpu

function handleUpload() {
  cpu.loadROM(selectedFile.files[0])
}

