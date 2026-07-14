export type Direction = 'up' | 'down' | 'left' | 'right'
export type GameStatus = 'playing' | 'won' | 'lost'
export type Level = { name: string; start: number; monster: number; exit: number; keys: number[]; walls: Set<number>; speed: number; color: number }

export type GameState = {
  level: number
  player: number
  monster: number
  keys: number[]
  webs: number[]
  steps: number
  status: GameStatus
}

export const SIZE = 11
const wallSets = [
  [12,13,14,16,18,20,23,27,29,31,34,35,36,38,40,42,45,49,51,53,56,57,58,60,62,64,67,71,73,75,78,79,80,82,84,86,89,93,95,97,100,102,104,106,107,108],
  [12,14,16,18,19,20,23,24,25,29,31,34,36,38,40,42,45,47,49,53,56,58,60,62,64,67,68,69,73,75,78,80,82,84,86,89,91,93,97,100,102,104,106,108],
  [12,13,14,18,20,23,25,27,29,34,36,38,40,42,45,46,47,51,53,56,58,60,62,64,67,69,71,75,78,80,82,84,86,89,90,91,95,97,100,102,104,106,108],
]

export const levels: Level[] = [
  { name: 'The Abandoned Ward', start: 111, monster: 11, exit: 9, keys: [33, 87], walls: new Set(wallSets[0]), speed: 3, color: 0xe98566 },
  { name: 'The Flooded Cells', start: 119, monster: 1, exit: 11, keys: [9, 55, 99], walls: new Set(wallSets[1]), speed: 2, color: 0x56a7b8 },
  { name: 'The Crimson Crypt', start: 110, monster: 10, exit: 0, keys: [22, 54, 88, 118], walls: new Set(wallSets[2]), speed: 2, color: 0xd44537 },
]

export const createGame = (level = 0, steps = 0): GameState => ({
  level,
  player: levels[level].start,
  monster: levels[level].monster,
  keys: [],
  webs: [],
  steps,
  status: 'playing',
})

const offset = { up: -SIZE, down: SIZE, left: -1, right: 1 }
const canEnter = (from: number, to: number, level: Level) => {
  const wraps = Math.abs((from % SIZE) - (to % SIZE)) > 1
  return to >= 0 && to < SIZE * SIZE && !wraps && !level.walls.has(to)
}

export const movePlayer = (position: number, direction: Direction, level: Level) => {
  const next = position + offset[direction]
  return canEnter(position, next, level) ? next : position
}

const distance = (from: number, to: number) =>
  Math.abs(Math.floor(from / SIZE) - Math.floor(to / SIZE)) + Math.abs((from % SIZE) - (to % SIZE))

export const moveMonster = (monster: number, player: number, steps: number, level: Level) => {
  if (steps % level.speed !== 0) return monster
  const queue: Array<{ cell: number; first: number }> = [{ cell: monster, first: monster }]
  const visited = new Set([monster])
  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) break
    if (current.cell === player) return current.first
    for (const change of [-SIZE, SIZE, -1, 1]) {
      const next = current.cell + change
      if (!visited.has(next) && canEnter(current.cell, next, level)) {
        visited.add(next)
        queue.push({ cell: next, first: current.cell === monster ? next : current.first })
      }
    }
  }
  return monster
}

export const isNearMonster = (state: GameState) => distance(state.player, state.monster) <= 3
