import { useCallback, useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { CharacterSelect } from './components/CharacterSelect'
import type { Character } from './components/CharacterSelect'
import { GameAuth } from './components/GameAuth'
import { MainMenu } from './components/MainMenu'
import { MultiplayerLobby } from './components/MultiplayerLobby'
import { ThreeMaze } from './components/ThreeMaze'
import { createGame, isNearMonster, levels, moveMonster, movePlayer } from './lib/game'
import type { Direction } from './lib/game'
import { supabase } from './lib/supabase'

export default function App() {
  const [entryMode, setEntryMode] = useState<'account' | 'guest' | null>(null)
  const [playMode, setPlayMode] = useState<'single' | 'multi'>('single')
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [opponent, setOpponent] = useState<{ name: string; status: string } | null>(null)
  const [character, setCharacter] = useState<Character | null>(null)
  const [game, setGame] = useState(createGame)
  const [showJumpscare, setShowJumpscare] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const lastMoveAt = useRef(0)
  const playerId = useRef(crypto.randomUUID())
  const raceChannel = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setCheckingAuth(false) })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => data.subscription.unsubscribe()
  }, [])

  const move = useCallback((direction: Direction) => {
    if (playMode === 'multi' && opponent?.status === 'won') return
    const now = performance.now()
    if (now - lastMoveAt.current < 150) return
    lastMoveAt.current = now
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
      const monster = firstMonsterStep
      const caught = monster === player
      const escaped = player === level.exit && keys.length === level.keys.length
      if (escaped && playMode === 'single' && current.level < levels.length - 1) return createGame(current.level + 1, steps)
      return { ...current, player, monster, keys, steps, status: caught ? 'lost' : escaped ? 'won' : 'playing' }
    })
  }, [playMode, opponent])

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

  useEffect(() => {
    if (!roomCode || !character || playMode !== 'multi') return
    const channel = supabase.channel(`race:${roomCode}`, { config: { presence: { key: playerId.current } } })
    raceChannel.current = channel
    channel.on('presence', { event: 'sync' }, () => {
      const players = Object.values(channel.presenceState()).flat() as Array<{ playerId?: string; name?: string; status?: string }>
      const other = players.find((player) => player.playerId !== playerId.current)
      setOpponent(other?.name ? { name: other.name, status: other.status ?? 'playing' } : null)
    }).subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await channel.track({ playerId: playerId.current, name: character.name, status: game.status })
    })
    return () => { raceChannel.current = null; supabase.removeChannel(channel) }
  }, [roomCode, character, playMode])

  useEffect(() => {
    raceChannel.current?.track({ playerId: playerId.current, name: character?.name, status: game.status })
  }, [game.status, character])

  if (!entryMode) return <MainMenu hasAccount={Boolean(user)} onAccount={() => { setRoomCode(null); setPlayMode('single'); setEntryMode('account') }} onGuest={() => { setRoomCode(null); setPlayMode('single'); setEntryMode('guest') }} onMultiplayer={() => { setRoomCode(null); setPlayMode('multi'); setEntryMode('guest') }} />
  if (entryMode === 'account' && checkingAuth) return <main className="loading-screen">Opening the labyrinth…</main>
  if (entryMode === 'account' && !user) return <GameAuth onBack={() => setEntryMode(null)} />
  if (playMode === 'multi' && !roomCode) return <MultiplayerLobby onJoin={setRoomCode} onBack={() => setEntryMode(null)} />
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
        <div className="header-actions">
          <button className="text-button" onClick={() => { setCharacter(null); restart() }}>Change survivor</button>
          <button className="text-button" onClick={() => { setCharacter(null); setRoomCode(null); setOpponent(null); setEntryMode(null); restart() }}>Main menu</button>
          {entryMode === 'account' && <button className="text-button" onClick={async () => { await supabase.auth.signOut(); setEntryMode(null) }}>Sign out</button>}
        </div>
      </header>
      <section className="status-bar">
        <span className="survivor">Survivor: {character.name}</span>
        <span>Maze <strong>{level.size}×{level.size}</strong></span>
        <span>Keys <strong>{game.keys.length}/{level.keys.length}</strong></span>
        <span className={danger ? 'threat active' : 'threat'}>{danger ? 'IT IS CLOSE' : 'QUIET'}</span>
      </section>
      {playMode === 'multi' && <section className="race-status"><strong>Room: {roomCode}</strong><span>{opponent ? `${opponent.name}: ${opponent.status === 'won' ? 'escaped!' : 'racing'}` : 'Waiting for opponent…'}</span></section>}
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
      {playMode === 'multi' && opponent?.status === 'won' && game.status === 'playing' && <div className="race-lost">Your opponent escaped first!</div>}
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
