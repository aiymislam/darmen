import { useCallback, useEffect, useState } from 'react'
import { CharacterSelect } from './components/CharacterSelect'
import type { Character } from './components/CharacterSelect'
import { ThreeMaze } from './components/ThreeMaze'
import { createGame, isNearMonster, levels, moveMonster, movePlayer } from './lib/game'
import type { Direction } from './lib/game'

export default function App() {
  const [character, setCharacter] = useState<Character | null>(null)
  const [game, setGame] = useState(createGame)
  const [showJumpscare, setShowJumpscare] = useState(false)

  const move = useCallback((direction: Direction) => {
    setGame((current) => {
      if (current.status !== 'playing') return current
      const level = levels[current.level]
      const player = movePlayer(current.player, direction, level)
      if (player === current.player) return current
      const steps = current.steps + 1
      const keys = level.keys.includes(player) && !current.keys.includes(player)
        ? [...current.keys, player]
        : current.keys
      const firstMonsterStep = moveMonster(current.monster, player, steps, level)
      const monster = firstMonsterStep === player || steps % 2 !== 0
        ? firstMonsterStep
        : moveMonster(firstMonsterStep, player, steps, level)
      const caught = monster === player
      const escaped = player === level.exit && keys.length === level.keys.length
      if (escaped && current.level < levels.length - 1) return createGame(current.level + 1, steps)
      return { ...current, player, monster, keys, steps, status: caught ? 'lost' : escaped ? 'won' : 'playing' }
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

  useEffect(() => {
    if (game.status !== 'lost') return
    setShowJumpscare(true)
    const timer = window.setTimeout(() => setShowJumpscare(false), 1250)
    return () => window.clearTimeout(timer)
  }, [game.status])

  if (!character) return <CharacterSelect onSelect={setCharacter} />
  const restart = () => { setShowJumpscare(false); setGame(createGame()) }
  const danger = isNearMonster(game)
  const level = levels[game.level]

  return (
    <main className={danger ? 'game-screen danger' : 'game-screen'}>
      <header>
        <div className="game-title">
          <h1>Secrets of the Labyrinth</h1>
          <p className="level-name">Level {game.level + 1} of {levels.length} · {level.name}</p>
        </div>
        <button className="text-button" onClick={() => { setCharacter(null); restart() }}>Change survivor</button>
      </header>
      <section className="status-bar">
        <span className="survivor">Survivor: {character.name}</span>
        <span>Keys <strong>{game.keys.length}/{level.keys.length}</strong></span>
        <span className={danger ? 'threat active' : 'threat'}>{danger ? 'IT IS CLOSE' : 'QUIET'}</span>
      </section>
      <ThreeMaze game={game} color={character.color} />
      <nav className="controls" aria-label="Movement controls">
        {([['▲', 'up'], ['◀', 'left'], ['▼', 'down'], ['▶', 'right']] as const).map(([label, direction]) => (
          <button className={direction} key={direction} onClick={() => move(direction)} aria-label={`Move ${direction}`}>{label}</button>
        ))}
      </nav>
      <p className="instructions">Use WASD, arrow keys, or controls. Gather every key, then reach the door.</p>
      {showJumpscare && (
        <div className="jumpscare" aria-label="Spider jumpscare">
          <div className="scare-spider"><i className="scare-eye one" /><i className="scare-eye two" /><i className="scare-eye three" /><i className="scare-eye four" /><i className="fang left" /><i className="fang right" /></div>
          <strong>CAUGHT</strong>
        </div>
      )}
      {game.status !== 'playing' && !showJumpscare && (
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
