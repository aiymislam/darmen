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

const levelNames = [
  'The Abandoned Ward', 'The Flooded Cells', 'The Crimson Crypt', 'The Silent Library',
  'The Broken Chapel', 'The Ashen Tunnels', 'The Moonlit Prison', 'The Forgotten Mine',
  'The Whispering Halls', 'The Sunken Vault', 'The Hollow Factory', 'The Frozen Catacombs',
  'The Twisted Garden', 'The Empty School', 'The Rusted Bunker', 'The Shadow Theater',
  'The Buried Station', 'The Cursed Museum', 'The Blackened Hotel', 'The Ancient Sewers',
  'The Lost Hospital', 'The Glass Passage', 'The Bleeding Keep', 'The Nameless Archive',
  'The Spider Nest', 'The Last Sanctuary', 'The Endless Basement', 'The Dark Observatory',
  'The Shattered Palace', 'The Final Labyrinth',
]
const corners = [400, 418, 40, 22]
const keySpots = [362, 372, 318, 288, 248, 206, 198, 160, 156, 152, 122, 112, 80, 78, 76]
const lightColors = [0xe98566, 0x56a7b8, 0xd44537, 0x8e70bd, 0x6ea46e, 0xc19a55]

export const levels: Level[] = levelNames.map((name, index) => {
  const keyCount = 4 + Math.floor(index / 10)
  const keys = Array.from({ length: keyCount }, (_, keyIndex) =>
    keySpots[(index * 3 + keyIndex * 2) % keySpots.length],
  )
  return {
    name,
    start: corners[index % corners.length],
    monster: corners[(index + 2) % corners.length],
    exit: corners[(index + 1) % corners.length],
    keys,
    walls: makeMaze(1847 + index * 3571),
    speed: 1,
    color: lightColors[index % lightColors.length],
  }
})

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
