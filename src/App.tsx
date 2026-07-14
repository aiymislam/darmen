import { useCallback, useEffect, useState } from 'react'
import { CharacterSelect } from './components/CharacterSelect'
import type { Character } from './components/CharacterSelect'
import { ThreeMaze } from './components/ThreeMaze'
import { createGame, EXIT, isNearMonster, KEY_CELLS, moveMonster, movePlayer } from './lib/game'
import type { Direction } from './lib/game'

export default function App() {
  const [character, setCharacter] = useState<Character | null>(null)
  const [game, setGame] = useState(createGame)

  const move = useCallback((direction: Direction) => {
    setGame((current) => {
      if (current.status !== 'playing') return current
      const player = movePlayer(current.player, direction)
      if (player === current.player) return current
      const steps = current.steps + 1
      const keys = KEY_CELLS.includes(player) && !current.keys.includes(player)
        ? [...current.keys, player]
        : current.keys
      const monster = moveMonster(current.monster, player, steps)
      const caught = monster === player
      const escaped = player === EXIT && keys.length === KEY_CELLS.length
      return { player, monster, keys, steps, status: caught ? 'lost' : escaped ? 'won' : 'playing' }
    })
  }, [])

  useEffect(() => {
    const directions: Record<string, Direction> = {
      ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down',
      ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right',
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = directions[event.key]
      if (direction) { event.preventDefault(); move(direction) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [move])

  if (!character) return <CharacterSelect onSelect={setCharacter} />
  const restart = () => setGame(createGame())
  const danger = isNearMonster(game)

  return (
    <main className={danger ? 'game-screen danger' : 'game-screen'}>
      <header>
        <div><p className="kicker">THE HOLLOW MAZE</p><h1>Stay quiet.</h1></div>
        <button className="text-button" onClick={() => { setCharacter(null); restart() }}>Change survivor</button>
      </header>
      <section className="status-bar">
        <span className="survivor">Survivor: {character.name}</span>
        <span>Keys <strong>{game.keys.length}/{KEY_CELLS.length}</strong></span>
        <span className={danger ? 'threat active' : 'threat'}>{danger ? 'IT IS CLOSE' : 'QUIET'}</span>
      </section>
      <ThreeMaze game={game} color={character.color} />
      <nav className="controls" aria-label="Movement controls">
        {([['▲', 'up'], ['◀', 'left'], ['▼', 'down'], ['▶', 'right']] as const).map(([label, direction]) => (
          <button className={direction} key={direction} onClick={() => move(direction)} aria-label={`Move ${direction}`}>{label}</button>
        ))}
      </nav>
      <p className="instructions">Use WASD, arrow keys, or controls. Gather every key, then reach the door.</p>
      {game.status !== 'playing' && (
        <div className="overlay"><section className="result-card">
          <span className={game.status === 'won' ? 'result-mark escaped' : 'result-mark caught'} />
          <p className="kicker">{game.status === 'won' ? 'YOU SURVIVED' : 'YOU WERE FOUND'}</p>
          <h2>{game.status === 'won' ? 'The door slams behind you.' : 'The maze keeps another soul.'}</h2>
          <p>You lasted {game.steps} steps.</p>
          <button onClick={restart}>Enter again</button>
        </section></div>
      )}
    </main>
  )
}
