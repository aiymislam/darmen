import * as THREE from 'three'

export function createSurvivor(color: number) {
  const group = new THREE.Group()
  const material = (shade: number) => new THREE.MeshStandardMaterial({ color: shade, roughness: 0.78 })
  const skin = material(0xffeee5)
  const clothes = material(color)
  const dark = material(0x1b2025)
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.16, 0.58, 12), clothes)
  torso.position.y = 0.83
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.07, 0.13, 10), skin)
  neck.position.y = 1.16
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 18, 14), skin)
  head.scale.set(0.86, 1.08, 0.9)
  head.position.y = 1.37
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.185, 16, 9, 0, Math.PI * 2, 0, Math.PI / 2), material(0x1b1512))
  hair.position.y = 1.45
  group.add(torso, neck, head, hair)

  for (const side of [-1, 1]) {
    const armPivot = new THREE.Group()
    armPivot.name = side < 0 ? 'arm-left' : 'arm-right'
    armPivot.position.set(side * 0.27, 1.05, 0)
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.37, 5, 8), clothes)
    arm.position.y = -0.23
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), skin)
    hand.position.y = -0.47
    armPivot.add(arm, hand)

    const legPivot = new THREE.Group()
    legPivot.name = side < 0 ? 'leg-left' : 'leg-right'
    legPivot.position.set(side * 0.1, 0.55, 0)
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.42, 5, 8), dark)
    leg.position.y = -0.28
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.09, 0.23), material(0x0e1012))
    shoe.position.set(0, -0.54, 0.055)
    legPivot.add(leg, shoe)
    group.add(armPivot, legPivot)
  }
  return group
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

export function createGoldGun() {
  const group = new THREE.Group()
  const gold = new THREE.MeshStandardMaterial({ color: 0xffc928, metalness: 0.82, roughness: 0.22 })
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.42), gold)
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.28, 10), gold)
  barrel.rotation.x = Math.PI / 2
  barrel.position.z = 0.3
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.1), gold)
  grip.position.set(0, -0.13, 0.03)
  grip.rotation.x = -0.25
  group.add(body, barrel, grip)
  return group
}
