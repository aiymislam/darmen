import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { GameState } from '../lib/game'
import { levels } from '../lib/game'
import { createDemon, createDiamondGun, createGoldGun, createMonster, createSurvivor } from '../lib/models'

type Props = { game: GameState; color: number; jumpSignal: number; shotSignal: number; spiderDead: boolean; invisible: boolean; hasDiamondGun: boolean }
const positionFor = (cell: number, size: number) => ({ x: (cell % size) - size / 2 + 0.5, z: Math.floor(cell / size) - size / 2 + 0.5 })

export function ThreeMaze({ game, color, jumpSignal, shotSignal, spiderDead, invisible, hasDiamondGun }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const state = useRef(game)
  const jump = useRef(jumpSignal)
  const combat = useRef({ shotSignal, spiderDead, invisible })
  state.current = game
  jump.current = jumpSignal
  combat.current = { shotSignal, spiderDead, invisible }
  const level = levels[game.level]

  useEffect(() => {
    if (!host.current) return
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x17211d)
    scene.fog = new THREE.FogExp2(0x17211d, 0.035)
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, Math.max(80, level.size * 3))
    const initialPlayer = positionFor(game.player, level.size)
    camera.position.set(initialPlayer.x, 7.5, initialPlayer.z + 7.5)
    camera.lookAt(initialPlayer.x, 0.6, initialPlayer.z)
    const cameraTarget = new THREE.Vector3(initialPlayer.x, 0.6, initialPlayer.z)
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
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x747c77, roughness: 0.92 })
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
    survivor.traverse((part) => {
      if (part instanceof THREE.Mesh) {
        const material = part.material as THREE.Material
        material.transparent = true
      }
    })
    const monster = game.level >= 14 ? createDemon() : createMonster()
    const rageLight = new THREE.PointLight(0xff1b0f, 0, 7)
    scene.add(rageLight)
    const gun = hasDiamondGun ? createDiamondGun() : createGoldGun()
    gun.visible = false
    gun.position.set(0.13, 0.82, 0.27)
    survivor.add(gun)
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
    let seenJump = jump.current
    let jumpFrame = 44
    let seenShot = combat.current.shotSignal
    let gunFrame = 90
    let escapeStartedAt: number | null = null
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
      const desiredCameraPosition = new THREE.Vector3(playerPos.x, 7.5, playerPos.z + 7.5)
      camera.position.lerp(desiredCameraPosition, 0.1)
      cameraTarget.lerp(new THREE.Vector3(playerPos.x, 0.6, playerPos.z), 0.14)
      camera.lookAt(cameraTarget)
      if (current.status === 'escaping' && escapeStartedAt === null) escapeStartedAt = performance.now()
      const escapeProgress = escapeStartedAt === null ? 0 : Math.min((performance.now() - escapeStartedAt) / 1600, 1)
      const escapeElapsed = escapeStartedAt === null ? 0 : performance.now() - escapeStartedAt
      const rageProgress = Math.max(0, Math.min((escapeElapsed - 1700) / 1400, 1))
      const outward = new THREE.Vector3(exit.x, 0, exit.z).normalize()
      const escapeTarget = new THREE.Vector3(
        playerPos.x + outward.x * escapeProgress * 4.2,
        0,
        playerPos.z + outward.z * escapeProgress * 4.2,
      )
      if (jump.current !== seenJump) { seenJump = jump.current; jumpFrame = 0 }
      if (combat.current.shotSignal !== seenShot) { seenShot = combat.current.shotSignal; gunFrame = 0 }
      const jumpProgress = jumpFrame / 44
      const moving = current.status === 'escaping' || survivor.position.distanceTo(new THREE.Vector3(playerPos.x, 0, playerPos.z)) > 0.06
      if (current.player !== lastPlayerCell) {
        const previous = positionFor(lastPlayerCell, level.size)
        survivor.rotation.y = Math.atan2(playerPos.x - previous.x, playerPos.z - previous.z)
        lastPlayerCell = current.player
      }
      survivor.position.lerp(current.status === 'escaping' ? escapeTarget : new THREE.Vector3(playerPos.x, 0, playerPos.z), 0.42)
      survivor.position.y = jumpProgress < 1
        ? Math.sin(jumpProgress * Math.PI) * 0.72
        : moving ? Math.abs(Math.sin(frame * 0.32)) * 0.06 : 0
      const stride = jumpProgress < 1
        ? Math.sin(jumpProgress * Math.PI) * 0.8
        : moving ? Math.sin(frame * 0.32) * 0.58 : 0
      survivor.getObjectByName('arm-left')!.rotation.x = stride
      survivor.getObjectByName('arm-right')!.rotation.x = -stride
      survivor.getObjectByName('leg-left')!.rotation.x = -stride
      survivor.getObjectByName('leg-right')!.rotation.x = stride
      survivor.rotation.z = moving ? Math.sin(frame * 0.16) * 0.025 : 0
      if (current.status === 'escaping') {
        survivor.rotation.y = Math.atan2(outward.x, outward.z)
        const opacity = Math.max(0, 1 - Math.max(0, escapeProgress - 0.58) / 0.42)
        survivor.traverse((part) => {
          if (part instanceof THREE.Mesh) (part.material as THREE.Material).opacity = opacity
        })
        door.rotation.y = Math.sin(escapeProgress * Math.PI) * 1.15
      }
      monster.position.lerp(new THREE.Vector3(monsterPos.x, 0, monsterPos.z), 0.12)
      monster.visible = !combat.current.spiderDead
      gun.visible = gunFrame < 90
      if (current.status !== 'escaping') survivor.visible = !combat.current.invisible || Math.floor(frame / 8) % 2 === 0
      lamp.position.lerp(new THREE.Vector3(playerPos.x, 4, playerPos.z + 1.5), 0.1)
      monster.rotation.y = Math.sin(frame * 0.08) * 0.12
      if (rageProgress > 0) {
        survivor.visible = false
        monster.visible = true
        const rageShake = Math.sin(frame * 1.7) * 0.13 * rageProgress
        monster.position.x = monsterPos.x + rageShake
        monster.position.y = Math.abs(Math.sin(frame * 0.28)) * 0.32 * rageProgress
        monster.rotation.z = Math.sin(frame * 1.3) * 0.16 * rageProgress
        const rageScale = 1 + Math.sin(rageProgress * Math.PI) * 0.45
        monster.scale.setScalar(rageScale)
        monster.children.forEach((part, index) => {
          if (part instanceof THREE.Group) part.rotation.y = Math.sin(frame * 0.55 + index) * 0.6 * rageProgress
        })
        monster.traverse((part) => {
          if (part instanceof THREE.Mesh && part.material instanceof THREE.MeshStandardMaterial) {
            part.material.emissive.setHex(0x7d0904)
            part.material.emissiveIntensity = rageProgress * 1.8
          }
        })
        rageLight.intensity = 65 * rageProgress
        rageLight.position.set(monsterPos.x, 2, monsterPos.z + 1)
      }
      keyMeshes.forEach(({ cell, key }) => { key.visible = !current.keys.includes(cell); key.rotation.z += 0.025 })
      door.material.emissive.setHex(current.keys.length === level.keys.length ? 0x8c3a16 : 0x210504)
      frame += 1
      jumpFrame += 1
      gunFrame += 1
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
  }, [color, game.level, level, hasDiamondGun])

  return <div className="three-maze" ref={host} aria-label="3D haunted maze" />
}
