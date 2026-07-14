export type Direction = 'up' | 'down' | 'left' | 'right'
export type GameStatus = 'playing' | 'won' | 'lost'
export type Level = { name: string; start: number; monster: number; exit: number; keys: number[]; walls: Set<number>; speed: number; color: number }

export type GameState = {
  level: number
  player: number
  monster: number
  keys: number[]
  steps: number
  status: GameStatus
}

export const SIZE = 21

const makeMaze = (seed: number) => {
  const walls = new Set(Array.from({ length: SIZE * SIZE }, (_, cell) => cell))
  const visited = new Set<string>()
  const stack: Array<[number, number]> = [[1, 1]]
  let random = seed
  const nextRandom = () => {
    random = (random * 1664525 + 1013904223) >>> 0
    return random
  }
  while (stack.length > 0) {
    const [row, column] = stack[stack.length - 1]
    visited.add(`${row},${column}`)
    walls.delete(row * SIZE + column)
    const choices = [[-2, 0], [2, 0], [0, -2], [0, 2]]
      .map(([rowStep, columnStep]) => [row + rowStep, column + columnStep, rowStep, columnStep])
      .filter(([nextRow, nextColumn]) => nextRow > 0 && nextRow < SIZE - 1 && nextColumn > 0 && nextColumn < SIZE - 1 && !visited.has(`${nextRow},${nextColumn}`))
      .sort(() => (nextRandom() % 3) - 1)
    const next = choices[0]
    if (!next) { stack.pop(); continue }
    const [nextRow, nextColumn, rowStep, columnStep] = next
    walls.delete((row + rowStep / 2) * SIZE + column + columnStep / 2)
    stack.push([nextRow, nextColumn])
  }
  return walls
}

export const levels: Level[] = [
  { name: 'The Abandoned Ward', start: 400, monster: 22, exit: 40, keys: [362, 288, 156, 80], walls: makeMaze(1847), speed: 3, color: 0xe98566 },
  { name: 'The Flooded Cells', start: 418, monster: 40, exit: 22, keys: [372, 276, 206, 112, 78], walls: makeMaze(7391), speed: 3, color: 0x56a7b8 },
  { name: 'The Crimson Crypt', start: 400, monster: 40, exit: 22, keys: [410, 318, 248, 152, 76, 198], walls: makeMaze(12553), speed: 3, color: 0xd44537 },
]

export const createGame = (level = 0, steps = 0): GameState => ({
  level,
  player: levels[level].start,
  monster: levels[level].monster,
  keys: [],
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
