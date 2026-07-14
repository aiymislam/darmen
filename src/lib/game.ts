export type Direction = 'up' | 'down' | 'left' | 'right'
export type GameStatus = 'playing' | 'won' | 'lost'

export type GameState = {
  player: number
  monster: number
  keys: number[]
  steps: number
  status: GameStatus
}

export const SIZE = 11
export const START = 111
export const EXIT = 9
export const KEY_CELLS = [33, 87, 105]
export const walls = new Set([
  12, 13, 14, 16, 18, 20, 23, 27, 29, 31, 34, 35, 36, 38, 40, 42,
  45, 49, 51, 53, 56, 57, 58, 60, 62, 64, 67, 71, 73, 75, 78, 79,
  80, 82, 84, 86, 89, 93, 95, 97, 100, 102, 104, 106, 107, 108,
])

export const createGame = (): GameState => ({
  player: START,
  monster: 11,
  keys: [],
  steps: 0,
  status: 'playing',
})

const offset = { up: -SIZE, down: SIZE, left: -1, right: 1 }

const canEnter = (from: number, to: number) => {
  const wraps = Math.abs((from % SIZE) - (to % SIZE)) > 1
  return to >= 0 && to < SIZE * SIZE && !wraps && !walls.has(to)
}

export const movePlayer = (position: number, direction: Direction) => {
  const next = position + offset[direction]
  return canEnter(position, next) ? next : position
}

const distance = (from: number, to: number) =>
  Math.abs(Math.floor(from / SIZE) - Math.floor(to / SIZE)) + Math.abs((from % SIZE) - (to % SIZE))

export const moveMonster = (monster: number, player: number, steps: number) => {
  if (steps % 2 !== 0) return monster
  const options = [-SIZE, SIZE, -1, 1]
    .map((change) => monster + change)
    .filter((cell) => canEnter(monster, cell))
    .sort((a, b) => distance(a, player) - distance(b, player))
  return options[0] ?? monster
}

export const isNearMonster = (state: GameState) => distance(state.player, state.monster) <= 3
