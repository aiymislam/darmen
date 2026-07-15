import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { GameState } from '../lib/game'
import { levels } from '../lib/game'
import { createMonster, createSurvivor } from '../lib/models'

type Props = { game: GameState; color: number }
const positionFor = (cell: number, size: number) => ({ x: (cell % size) - size / 2 + 0.5, z: Math.floor(cell / size) - size / 2 + 0.5 })

function createBloodyWallTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')!
  context.fillStyle = '#514744'
  context.fillRect(0, 0, 256, 256)
  context.strokeStyle = '#2c2726'
  context.lineWidth = 5
  for (let row = 32; row < 256; row += 48) {
    context.beginPath(); context.moveTo(0, row); context.lineTo(256, row); context.stroke()
  }
  context.fillStyle = '#6d0808'
  context.globalAlpha = 0.48
  const stains = [[30, 0, 24, 118], [105, 0, 18, 152], [178, 0, 28, 96], [230, 0, 12, 132]]
  stains.forEach(([x, y, width, height], index) => {
    context.beginPath()
    context.ellipse(x + width / 2, y + 18, width, 30, 0, 0, Math.PI * 2)
    context.fill()
    context.fillRect(x, y, width, height)
    context.beginPath(); context.arc(x + width / 2, height + 12, width / 2, 0, Math.PI * 2); context.fill()
    if (index % 2 === 0) context.fillRect(x + width, 20, 9, height * 0.55)
  })
  context.fillStyle = '#a20c0c'
  context.globalAlpha = 0.34
  context.beginPath(); context.ellipse(135, 76, 48, 22, -0.2, 0, Math.PI * 2); context.fill()
  context.globalAlpha = 1
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function ThreeMaze({ game, color }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const state = useRef(game)
  state.current = game
  const level = levels[game.level]

  useEffect(() => {
    if (!host.current) return
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x17211d)
    scene.fog = new THREE.FogExp2(0x17211d, 0.035)
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100)
    camera.position.set(0, 5.3, 5.5)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    host.current.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight(0xc2d8cb, 0x18201c, 2.15))
    const lamp = new THREE.PointLight(level.color, 48, 18)
    lamp.position.set(0, 5, 3)
    lamp.castShadow = true
    scene.add(lamp)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(level.size, level.size),
      new THREE.MeshStandardMaterial({ color: 0x34423b, roughness: 1 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    const wallGeometry = new THREE.BoxGeometry(0.9, 1.7, 0.9)
    const wallMaterial = new THREE.MeshStandardMaterial({
      map: createBloodyWallTexture(),
      color: 0xb9a6a0,
      roughness: 0.94,
      metalness: 0.02,
    })
    const wallMesh = new THREE.InstancedMesh(wallGeometry, wallMaterial, level.walls.size)
    const matrix = new THREE.Matrix4()
    Array.from(level.walls).forEach((cell, index) => {
      const pos = positionFor(cell, level.size)
      wallMesh.setMatrixAt(index, matrix.makeTranslation(pos.x, 0.85, pos.z))
    })
    wallMesh.castShadow = true
    wallMesh.receiveShadow = true
    scene.add(wallMesh)

    const survivor = createSurvivor(color)
    const monster = createMonster()
    scene.add(survivor, monster)
    const keyMeshes = level.keys.map((cell) => {
      const key = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.055, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0xd6a449, emissive: 0x5c3607 }),
      )
      const pos = positionFor(cell, level.size)
      key.position.set(pos.x, 0.45, pos.z)
      key.rotation.x = Math.PI / 2
      scene.add(key)
      return { cell, key }
    })
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 1.7, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x5d281f, emissive: 0x210504 }),
    )
    const exit = positionFor(level.exit, level.size)
    door.position.set(exit.x, 0.85, exit.z)
    scene.add(door)

    let frame = 0
    let animation = 0
    let lastPlayerCell = state.current.player
    const resize = () => {
      const width = host.current?.clientWidth ?? 600
      const height = host.current?.clientHeight ?? 600
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    const draw = () => {
      const current = state.current
      const playerPos = positionFor(current.player, level.size)
      const monsterPos = positionFor(current.monster, level.size)
      const moving = survivor.position.distanceTo(new THREE.Vector3(playerPos.x, 0, playerPos.z)) > 0.06
      if (current.player !== lastPlayerCell) {
        const previous = positionFor(lastPlayerCell, level.size)
        survivor.rotation.y = Math.atan2(playerPos.x - previous.x, playerPos.z - previous.z)
        lastPlayerCell = current.player
      }
      survivor.position.lerp(new THREE.Vector3(playerPos.x, 0, playerPos.z), 0.42)
      survivor.position.y = moving ? Math.abs(Math.sin(frame * 0.32)) * 0.06 : 0
      const stride = moving ? Math.sin(frame * 0.32) * 0.58 : 0
      survivor.getObjectByName('arm-left')!.rotation.x = stride
      survivor.getObjectByName('arm-right')!.rotation.x = -stride
      survivor.getObjectByName('leg-left')!.rotation.x = -stride
      survivor.getObjectByName('leg-right')!.rotation.x = stride
      survivor.rotation.z = moving ? Math.sin(frame * 0.16) * 0.025 : 0
      monster.position.lerp(new THREE.Vector3(monsterPos.x, 0, monsterPos.z), 0.12)
      camera.position.lerp(new THREE.Vector3(playerPos.x, 4.8, playerPos.z + 4.5), 0.08)
      camera.lookAt(playerPos.x, 0.45, playerPos.z)
      lamp.position.lerp(new THREE.Vector3(playerPos.x, 4, playerPos.z + 1.5), 0.1)
      monster.rotation.y = Math.sin(frame * 0.08) * 0.12
      keyMeshes.forEach(({ cell, key }) => { key.visible = !current.keys.includes(cell); key.rotation.z += 0.025 })
      door.material.emissive.setHex(current.keys.length === level.keys.length ? 0x8c3a16 : 0x210504)
      frame += 1
      renderer.render(scene, camera)
      animation = requestAnimationFrame(draw)
    }
    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animation)
      window.removeEventListener('resize', resize)
      renderer.dispose()
      host.current?.replaceChildren()
    }
  }, [color, game.level, level])

  return <div className="three-maze" ref={host} aria-label="3D haunted maze" />
}
