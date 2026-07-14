import * as THREE from 'three'

const mesh = (geometry: THREE.BufferGeometry, color: number) =>
  new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.72 }))

export function createSurvivor(color: number) {
  const group = new THREE.Group()
  const skin = 0xc99470
  const body = mesh(new THREE.CapsuleGeometry(0.24, 0.46, 6, 12), color)
  body.position.y = 0.72
  const head = mesh(new THREE.SphereGeometry(0.22, 18, 14), skin)
  head.scale.set(0.88, 1.08, 0.9)
  head.position.y = 1.28
  const hair = mesh(new THREE.SphereGeometry(0.225, 16, 9, 0, Math.PI * 2, 0, Math.PI / 2), 0x1b1512)
  hair.position.y = 1.36
  const white = new THREE.MeshStandardMaterial({ color: 0xf3eee6, roughness: 0.45 })
  const dark = new THREE.MeshStandardMaterial({ color: 0x201713, roughness: 0.55 })
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), white)
    eye.scale.set(1, 0.72, 0.48)
    eye.position.set(side * 0.082, 1.31, 0.187)
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), dark)
    pupil.position.set(side * 0.082, 1.31, 0.221)
    const ear = mesh(new THREE.SphereGeometry(0.04, 8, 6), skin)
    ear.position.set(side * 0.205, 1.28, 0)
    const arm = mesh(new THREE.CapsuleGeometry(0.055, 0.38, 4, 8), skin)
    arm.position.set(side * 0.3, 0.76, 0)
    arm.rotation.z = side * -0.08
    const leg = mesh(new THREE.CapsuleGeometry(0.075, 0.34, 4, 8), 0x1c2327)
    leg.position.set(side * 0.12, 0.25, 0)
    group.add(eye, pupil, ear, arm, leg)
  }
  const nose = mesh(new THREE.ConeGeometry(0.035, 0.105, 8), skin)
  nose.position.set(0, 1.245, 0.235)
  nose.rotation.x = Math.PI / 2
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.014, 0.012), new THREE.MeshStandardMaterial({ color: 0x733c38 }))
  mouth.position.set(0, 1.17, 0.218)
  group.add(body, head, hair, nose, mouth)
  return group
}

export function createMonster() {
  const group = new THREE.Group()
  const body = mesh(new THREE.ConeGeometry(0.5, 1.25, 7), 0x351010)
  body.position.y = 0.63
  const head = mesh(new THREE.SphereGeometry(0.36, 10, 8), 0x591716)
  head.position.y = 1.3
  const hornMaterial = new THREE.MeshStandardMaterial({ color: 0x17110f, roughness: 1 })
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xff2b18 })
  for (const side of [-1, 1]) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.48, 6), hornMaterial)
    horn.position.set(side * 0.25, 1.67, 0)
    horn.rotation.z = side * -0.35
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), eyeMaterial)
    eye.position.set(side * 0.13, 1.36, 0.31)
    group.add(horn, eye)
  }
  group.add(body, head)
  return group
}
