import * as THREE from 'three'

const mesh = (geometry: THREE.BufferGeometry, color: number) =>
  new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.72 }))

export function createSurvivor(color: number) {
  const group = new THREE.Group()
  const skin = 0xffeee5
  const body = mesh(new THREE.CapsuleGeometry(0.24, 0.46, 6, 12), color)
  body.position.y = 0.72
  const head = mesh(new THREE.SphereGeometry(0.22, 18, 14), skin)
  head.scale.set(0.88, 1.08, 0.9)
  head.position.y = 1.28
  const hair = mesh(new THREE.SphereGeometry(0.225, 16, 9, 0, Math.PI * 2, 0, Math.PI / 2), 0x1b1512)
  hair.position.y = 1.36
  const white = new THREE.MeshStandardMaterial({ color: 0xf3eee6, roughness: 0.45 })
  const dark = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.45 })
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), white)
    eye.scale.set(1, 0.72, 0.48)
    eye.position.set(side * 0.082, 1.31, 0.187)
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), dark)
    pupil.position.set(side * 0.082, 1.31, 0.221)
    const ear = mesh(new THREE.SphereGeometry(0.04, 8, 6), skin)
    ear.position.set(side * 0.205, 1.28, 0)
    const arm = mesh(new THREE.CapsuleGeometry(0.055, 0.38, 4, 8), skin)
    arm.name = side < 0 ? 'arm-left' : 'arm-right'
    arm.position.set(side * 0.3, 0.76, 0)
    arm.rotation.z = side * -0.08
    const leg = mesh(new THREE.CapsuleGeometry(0.075, 0.34, 4, 8), 0x1c2327)
    leg.name = side < 0 ? 'leg-left' : 'leg-right'
    leg.position.set(side * 0.12, 0.25, 0)
    group.add(eye, pupil, ear, arm, leg)
  }
  const nose = mesh(new THREE.ConeGeometry(0.035, 0.105, 8), skin)
  nose.position.set(0, 1.245, 0.235)
  nose.rotation.x = Math.PI / 2
  const smileCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.065, 1.18, 0.213),
    new THREE.Vector3(0, 1.15, 0.227),
    new THREE.Vector3(0.065, 1.18, 0.213),
  ])
  const smile = new THREE.Mesh(new THREE.TubeGeometry(smileCurve, 10, 0.009, 6, false), dark)
  group.add(body, head, hair, nose, smile)
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

export function createWeb() {
  const group = new THREE.Group()
  const material = new THREE.MeshBasicMaterial({ color: 0xd9e2df, transparent: true, opacity: 0.62 })
  for (const radius of [0.12, 0.24, 0.36]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.009, 4, 20), material)
    ring.rotation.x = -Math.PI / 2
    group.add(ring)
  }
  for (let index = 0; index < 8; index += 1) {
    const strand = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.76), material)
    strand.rotation.y = (Math.PI / 4) * index
    group.add(strand)
  }
  group.position.y = 0.035
  return group
}
