import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { GameState } from '../lib/game'
import { levels, SIZE } from '../lib/game'
import { createMonster, createSurvivor } from '../lib/models'

type Props = { game: GameState; color: number }
const positionFor = (cell: number) => ({ x: (cell % SIZE) - SIZE / 2 + 0.5, z: Math.floor(cell / SIZE) - SIZE / 2 + 0.5 })

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
      new THREE.PlaneGeometry(SIZE, SIZE),
      new THREE.MeshStandardMaterial({ color: 0x34423b, roughness: 1 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    const wallGeometry = new THREE.BoxGeometry(0.94, 2.05, 0.94)
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x66756c, roughness: 0.9 })
    level.walls.forEach((cell) => {
      const wall = new THREE.Mesh(wallGeometry, wallMaterial)
      const pos = positionFor(cell)
      wall.position.set(pos.x, 1.025, pos.z)
      wall.castShadow = true
      wall.receiveShadow = true
      scene.add(wall)
    })

    const survivor = createSurvivor(color)
    const monster = createMonster()
    scene.add(survivor, monster)
    const keyMeshes = level.keys.map((cell) => {
      const key = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.055, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0xd6a449, emissive: 0x5c3607 }),
      )
      const pos = positionFor(cell)
      key.position.set(pos.x, 0.45, pos.z)
      key.rotation.x = Math.PI / 2
      scene.add(key)
      return { cell, key }
    })
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 1.7, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x5d281f, emissive: 0x210504 }),
    )
    const exit = positionFor(level.exit)
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
      const playerPos = positionFor(current.player)
      const monsterPos = positionFor(current.monster)
      const moving = survivor.position.distanceTo(new THREE.Vector3(playerPos.x, 0, playerPos.z)) > 0.06
      if (current.player !== lastPlayerCell) lastPlayerCell = current.player
      survivor.position.lerp(new THREE.Vector3(playerPos.x, 0, playerPos.z), 0.18)
      survivor.position.y = moving ? Math.abs(Math.sin(frame * 0.32)) * 0.06 : 0
      survivor.material.rotation = moving ? Math.sin(frame * 0.32) * 0.04 : 0
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
