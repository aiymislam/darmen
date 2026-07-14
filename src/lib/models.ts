import * as THREE from 'three'

const mesh = (geometry: THREE.BufferGeometry, color: number) =>
  new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.72 }))

export function createSurvivor(color: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 512
  const context = canvas.getContext('2d')!
  const coat = `#${color.toString(16).padStart(6, '0')}`
  context.fillStyle = '#1d2327'
  context.fillRect(78, 345, 42, 115)
  context.fillRect(136, 345, 42, 115)
  context.fillStyle = '#111315'
  context.fillRect(66, 443, 58, 26)
  context.fillRect(132, 443, 58, 26)
  context.fillStyle = coat
  context.beginPath()
  context.moveTo(63, 195); context.lineTo(193, 195); context.lineTo(180, 355); context.lineTo(76, 355); context.closePath(); context.fill()
  context.lineWidth = 25
  context.strokeStyle = coat
  context.beginPath(); context.moveTo(76, 215); context.lineTo(43, 345); context.moveTo(180, 215); context.lineTo(213, 345); context.stroke()
  context.fillStyle = '#ffeee5'
  context.beginPath(); context.arc(43, 354, 17, 0, Math.PI * 2); context.arc(213, 354, 17, 0, Math.PI * 2); context.fill()
  context.beginPath(); context.ellipse(128, 125, 67, 79, 0, 0, Math.PI * 2); context.fill()
  context.fillStyle = '#201714'
  context.beginPath(); context.arc(128, 98, 70, Math.PI, Math.PI * 2); context.lineTo(192, 123); context.lineTo(64, 123); context.closePath(); context.fill()
  context.fillStyle = '#080808'
  context.beginPath(); context.arc(102, 132, 7, 0, Math.PI * 2); context.arc(154, 132, 7, 0, Math.PI * 2); context.fill()
  context.strokeStyle = '#80564d'; context.lineWidth = 4
  context.beginPath(); context.moveTo(128, 140); context.lineTo(122, 157); context.lineTo(132, 157); context.stroke()
  context.beginPath(); context.arc(128, 161, 19, 0.2, Math.PI - 0.2); context.stroke()
  const material = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(0.78, 1.56, 1)
  sprite.center.set(0.5, 0)
  return sprite
}

export function createMonster() {
  const group = new THREE.Group()
  const shell = new THREE.MeshStandardMaterial({ color: 0x161316, roughness: 0.72 })
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xff3025 })
  const abdomen = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 12), shell)
  abdomen.scale.set(1, 0.72, 1.25)
  abdomen.position.set(0, 0.48, -0.18)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), shell)
  head.position.set(0, 0.45, 0.42)
  group.add(abdomen, head)
  for (const side of [-1, 1]) {
    for (let index = 0; index < 4; index += 1) {
      const leg = new THREE.Group()
      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.65, 7), shell)
      const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.72, 7), shell)
      upper.rotation.z = side * (0.9 + index * 0.08)
      upper.position.x = side * 0.28
      lower.rotation.z = side * (0.55 + index * 0.06)
      lower.position.set(side * 0.67, -0.16, 0)
      leg.position.set(0, 0.5, 0.35 - index * 0.24)
      leg.add(upper, lower)
      group.add(leg)
    }
    for (const offset of [0.08, 0.18]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), eyeMaterial)
      eye.position.set(side * offset, 0.52, 0.68)
      group.add(eye)
    }
  }
  return group
}
