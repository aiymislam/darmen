import * as THREE from 'three'

const mesh = (geometry: THREE.BufferGeometry, color: number) =>
  new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.72 }))

export function createSurvivor(color: number) {
  const group = new THREE.Group()
  const body = mesh(new THREE.CapsuleGeometry(0.22, 0.48, 5, 10), color)
  body.position.y = 0.65
  const head = mesh(new THREE.SphereGeometry(0.2, 14, 10), 0xc99470)
  head.position.y = 1.15
  const hair = mesh(new THREE.SphereGeometry(0.205, 12, 7, 0, Math.PI * 2, 0, Math.PI / 2), 0x17130f)
  hair.position.y = 1.2
  group.add(body, head, hair)
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
