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

export const SIZE = 15
const dividerColumns = [2, 4, 6, 8, 10, 12]
const makeMaze = (gaps: number[]) => new Set(
  dividerColumns.flatMap((column, index) =>
    Array.from({ length: SIZE }, (_, row) => row === gaps[index] ? -1 : row * SIZE + column),
  ).filter((cell) => cell >= 0),
)

export const levels: Level[] = [
  { name: 'The Abandoned Ward', start: 211, monster: 1, exit: 13, keys: [168, 112, 56], walls: makeMaze([2, 12, 3, 11, 4, 10]), speed: 4, color: 0xe98566 },
  { name: 'The Flooded Cells', start: 223, monster: 13, exit: 1, keys: [206, 142, 78], walls: makeMaze([11, 3, 12, 4, 10, 2]), speed: 3, color: 0x56a7b8 },
  { name: 'The Crimson Crypt', start: 211, monster: 13, exit: 1, keys: [198, 168, 84, 43], walls: makeMaze([1, 13, 2, 12, 3, 11]), speed: 3, color: 0xd44537 },
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
