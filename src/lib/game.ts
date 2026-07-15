export type Direction = 'up' | 'down' | 'left' | 'right'
export type GameStatus = 'playing' | 'won' | 'lost'
export type Level = { name: string; size: number; start: number; monster: number; exit: number; keys: number[]; walls: Set<number>; speed: number; color: number }

export type GameState = {
  level: number
  player: number
  monster: number
  keys: number[]
  steps: number
  status: GameStatus
}

const makeMaze = (size: number, seed: number) => {
  const walls = new Set(Array.from({ length: size * size }, (_, cell) => cell))
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
    walls.delete(row * size + column)
    const choices = [[-2, 0], [2, 0], [0, -2], [0, 2]]
      .map(([rowStep, columnStep]) => [row + rowStep, column + columnStep, rowStep, columnStep])
      .filter(([nextRow, nextColumn]) => nextRow > 0 && nextRow < size - 1 && nextColumn > 0 && nextColumn < size - 1 && !visited.has(`${nextRow},${nextColumn}`))
      .sort(() => (nextRandom() % 3) - 1)
    const next = choices[0]
    if (!next) { stack.pop(); continue }
    const [nextRow, nextColumn, rowStep, columnStep] = next
    walls.delete((row + rowStep / 2) * size + column + columnStep / 2)
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
const lightColors = [0xe98566, 0x56a7b8, 0xd44537, 0x8e70bd, 0x6ea46e, 0xc19a55]

export const levels: Level[] = levelNames.map((name, index) => {
  const size = 15 + index * 2
  const corners = [(size - 2) * size + 1, (size - 2) * size + size - 2, size + size - 2, size + 1]
  const openCells = Array.from({ length: ((size - 1) / 2) ** 2 }, (_, cell) => {
    const width = (size - 1) / 2
    return (1 + Math.floor(cell / width) * 2) * size + 1 + (cell % width) * 2
  }).filter((cell) => !corners.includes(cell))
  const keyCount = 4 + Math.floor(index / 5)
  const keys = Array.from({ length: keyCount }, (_, keyIndex) => openCells[(index * 17 + keyIndex * 23) % openCells.length])
  return {
    name,
    size,
    start: corners[index % corners.length],
    monster: corners[(index + 2) % corners.length],
    exit: corners[(index + 1) % corners.length],
    keys,
    walls: makeMaze(size, 92821 + index * 7919),
    speed: index < 10 ? 5 : index < 20 ? 4 : 3,
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

const canEnter = (from: number, to: number, level: Level) => {
  const wraps = Math.abs((from % level.size) - (to % level.size)) > 1
  return to >= 0 && to < level.size * level.size && !wraps && !level.walls.has(to)
}

export const movePlayer = (position: number, direction: Direction, level: Level) => {
  const offset = { up: -level.size, down: level.size, left: -1, right: 1 }
  const next = position + offset[direction]
  return canEnter(position, next, level) ? next : position
}

const distance = (from: number, to: number, size: number) =>
  Math.abs(Math.floor(from / size) - Math.floor(to / size)) + Math.abs((from % size) - (to % size))

export const moveMonster = (monster: number, player: number, steps: number, level: Level) => {
  if (steps % level.speed !== 0) return monster
  const queue: Array<{ cell: number; first: number }> = [{ cell: monster, first: monster }]
  const visited = new Set([monster])
  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) break
    if (current.cell === player) return current.first
    for (const change of [-level.size, level.size, -1, 1]) {
      const next = current.cell + change
      if (!visited.has(next) && canEnter(current.cell, next, level)) {
        visited.add(next)
        queue.push({ cell: next, first: current.cell === monster ? next : current.first })
      }
    }
  }
  return monster
}

export const isNearMonster = (state: GameState) => distance(state.player, state.monster, levels[state.level].size) <= 3
