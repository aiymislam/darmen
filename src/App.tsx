import { useCallback, useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { CharacterSelect } from './components/CharacterSelect'
import type { Character } from './components/CharacterSelect'
import { GameAuth } from './components/GameAuth'
import { GameShop } from './components/GameShop'
import { MainMenu } from './components/MainMenu'
import { Leaderboard } from './components/Leaderboard'
import { MultiplayerLobby } from './components/MultiplayerLobby'
import { PauseMenu } from './components/PauseMenu'
import { ThreeMaze } from './components/ThreeMaze'
import { chaseMonster, createGame, isNearMonster, levels, movePlayer } from './lib/game'
import type { Direction } from './lib/game'
import { readLanguage, saveLanguage } from './lib/i18n'
import type { Language } from './lib/i18n'
import { buyItem, LEVEL_REWARD, loadInventory, STARTER_COINS } from './lib/shop'
import type { ShopItemId } from './lib/shop'
import { supabase } from './lib/supabase'

export default function App() {
  const [entryMode, setEntryMode] = useState<'account' | 'guest' | 'leaderboard' | null>(null)
  const [language, setLanguage] = useState<Language>(readLanguage)
  const [playMode, setPlayMode] = useState<'single' | 'multi'>('single')
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [opponent, setOpponent] = useState<{ name: string; status: string } | null>(null)
  const [character, setCharacter] = useState<Character | null>(null)
  const [game, setGame] = useState(createGame)
  const [showJumpscare, setShowJumpscare] = useState(false)
  const [jumpSignal, setJumpSignal] = useState(0)
  const [shotSignal, setShotSignal] = useState(0)
  const [spiderDead, setSpiderDead] = useState(false)
  const [gunCooldown, setGunCooldown] = useState(0)
  const [inventory, setInventory] = useState(loadInventory)
  const [shopOpen, setShopOpen] = useState(false)
  const [invisible, setInvisible] = useState(false)
  const [musicOn, setMusicOn] = useState(false)
  const [paused, setPaused] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const lastMoveAt = useRef(0)
  const playerId = useRef(crypto.randomUUID())
  const raceChannel = useRef<RealtimeChannel | null>(null)
  const pressedKeys = useRef(new Set<string>())
  const musicContext = useRef<AudioContext | null>(null)
  const musicTimer = useRef<number | null>(null)
  const escapeRewarded = useRef(false)

  const shoot = useCallback(() => {
    if (gunCooldown > 0) return
    setShotSignal((signal) => signal + 1)
    setSpiderDead(true)
    setGunCooldown(15)
    window.setTimeout(() => setSpiderDead(false), 5000)
  }, [gunCooldown])

  const purchase = (item: ShopItemId) => setInventory((current) => buyItem(current, item))
  const selectCharacter = (selectedCharacter: Character) => {
    setInventory((current) => ({ ...current, coins: Math.max(current.coins, STARTER_COINS) }))
    setCharacter(selectedCharacter)
  }
  const useInvisibility = () => {
    if (inventory.invisibilityPotions < 1 || invisible) return
    setInventory((current) => ({ ...current, invisibilityPotions: current.invisibilityPotions - 1 }))
    setInvisible(true)
    window.setTimeout(() => setInvisible(false), 10000)
  }

  const toggleMusic = useCallback(() => {
    if (musicOn) {
      if (musicTimer.current !== null) window.clearInterval(musicTimer.current)
      musicContext.current?.close()
      musicContext.current = null
      musicTimer.current = null
      setMusicOn(false)
      return
    }
    const context = new AudioContext()
    musicContext.current = context
    const playMelody = () => [523, 659, 784, 880, 1047, 880, 784, 659].forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'triangle'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, context.currentTime + index * 0.15)
      gain.gain.exponentialRampToValueAtTime(0.1, context.currentTime + index * 0.15 + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + index * 0.15 + 0.12)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start(context.currentTime + index * 0.15)
      oscillator.stop(context.currentTime + index * 0.15 + 0.13)
    })
    playMelody()
    musicTimer.current = window.setInterval(playMelody, 1320)
    setMusicOn(true)
  }, [musicOn])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setCheckingAuth(false) })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => data.subscription.unsubscribe()
  }, [])

  const move = useCallback((direction: Direction) => {
    if (paused) return
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
      const protectedFromMonster = spiderDead || invisible
      const monster = current.monster
      const caught = !protectedFromMonster && monster === player
      const escaped = player === level.exit && keys.length === level.keys.length
      return { ...current, player, monster, keys, steps, status: caught ? 'lost' : escaped ? 'escaping' : 'playing' }
    })
  }, [playMode, opponent, spiderDead, invisible, paused])

  useEffect(() => {
    if (paused || spiderDead || invisible) return
    const chaseDelay = game.level < 5 ? 900 : game.level < 10 ? 760 : 640
    const timer = window.setInterval(() => {
      setGame((current) => {
        if (current.status !== 'playing') return current
        const monster = chaseMonster(current.monster, current.player, levels[current.level])
        return { ...current, monster, status: monster === current.player ? 'lost' : current.status }
      })
    }, chaseDelay)
    return () => window.clearInterval(timer)
  }, [game.level, game.status, invisible, paused, spiderDead])

  useEffect(() => { localStorage.setItem('labyrinth-inventory', JSON.stringify(inventory)) }, [inventory])

  useEffect(() => {
    const directions: Record<string, Direction> = {
      ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down',
      ArrowLeft: 'left', a: 'left', ArrowRight: 'right',
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (key === 'escape') {
        event.preventDefault()
        setPaused((current) => !current)
        return
      }
      if (paused) return
      pressedKeys.current.add(key)
      if ((key === 'f' || key === 'g') && pressedKeys.current.has('f') && pressedKeys.current.has('g')) {
        event.preventDefault()
        setGame((current) => current.status === 'playing'
          ? { ...current, keys: [...levels[current.level].keys] }
          : current)
        return
      }
      if (key === 'r') {
        event.preventDefault()
        setSpiderDead(false)
        setShowJumpscare(false)
        setGame((current) => createGame(14, current.steps))
        return
      }
      if (key === 'd') { event.preventDefault(); setJumpSignal((signal) => signal + 1); return }
      if (key === 'u') { event.preventDefault(); if (!event.repeat) toggleMusic(); return }
      if (key === 'l') {
        event.preventDefault()
        if (!event.repeat) shoot()
        return
      }
      const direction = directions[event.key]
      if (direction) { event.preventDefault(); move(direction) }
    }
    const onKeyUp = (event: KeyboardEvent) => pressedKeys.current.delete(event.key.toLowerCase())
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      pressedKeys.current.clear()
    }
  }, [move, paused, shoot, toggleMusic])

  useEffect(() => () => {
    if (musicTimer.current !== null) window.clearInterval(musicTimer.current)
    musicContext.current?.close()
  }, [])

  useEffect(() => {
    if (gunCooldown <= 0) return
    const timer = window.setTimeout(() => setGunCooldown((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [gunCooldown])

  useEffect(() => {
    if (game.status !== 'lost') return
    if (inventory.respawnPotions > 0) {
      setInventory((current) => ({ ...current, respawnPotions: current.respawnPotions - 1 }))
      setGame((current) => createGame(current.level, current.steps))
      return
    }
    setShowJumpscare(true)
    const timer = window.setTimeout(() => setShowJumpscare(false), 1250)
    return () => window.clearTimeout(timer)
  }, [game.status, inventory.respawnPotions])

  useEffect(() => {
    if (game.status === 'playing') {
      escapeRewarded.current = false
      return
    }
    if (game.status !== 'escaping' || escapeRewarded.current) return
    escapeRewarded.current = true
    setInventory((current) => ({ ...current, coins: current.coins + LEVEL_REWARD }))
  }, [game.status])

  useEffect(() => {
    if (!user || entryMode !== 'account') return
    const displayName = user.user_metadata.full_name || user.user_metadata.name || user.email?.split('@')[0] || 'Survivor'
    supabase.rpc('record_player_progress', {
      player_name: displayName,
      reached_level: game.level + 1,
    }).then(({ error }) => {
      if (error) console.error('Could not update leaderboard:', error.message)
    })
  }, [entryMode, game.level, user])

  useEffect(() => {
    if (game.status !== 'escaping') return
    const timer = window.setTimeout(() => {
      setGame((current) => {
        if (current.status !== 'escaping') return current
        if (playMode === 'single' && current.level < levels.length - 1) {
          return createGame(current.level + 1, current.steps)
        }
        return { ...current, status: 'won' }
      })
    }, 3400)
    return () => window.clearTimeout(timer)
  }, [game.status, playMode])

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

  if (!entryMode) return <MainMenu hasAccount={Boolean(user)} language={language} onLanguageChange={(nextLanguage) => { setLanguage(nextLanguage); saveLanguage(nextLanguage) }} onAccount={() => { setRoomCode(null); setPlayMode('single'); setEntryMode('account') }} onGuest={() => { setRoomCode(null); setPlayMode('single'); setEntryMode('guest') }} onMultiplayer={() => { setRoomCode(null); setPlayMode('multi'); setEntryMode('guest') }} onLeaderboard={() => setEntryMode('leaderboard')} />
  if (entryMode === 'leaderboard') return <Leaderboard onBack={() => setEntryMode(null)} />
  if (entryMode === 'account' && checkingAuth) return <main className="loading-screen">Opening the labyrinth…</main>
  if (entryMode === 'account' && !user) return <GameAuth onBack={() => setEntryMode(null)} />
  if (playMode === 'multi' && !roomCode) return <MultiplayerLobby onJoin={setRoomCode} onBack={() => setEntryMode(null)} />
  if (!character) return <CharacterSelect language={language} onSelect={selectCharacter} />
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
          <button className="text-button" onClick={() => setPaused(true)}>Pause</button>
          <button className="text-button" onClick={() => { setCharacter(null); restart() }}>Change survivor</button>
          <button className="text-button" onClick={() => { setCharacter(null); setRoomCode(null); setOpponent(null); setEntryMode(null); restart() }}>Main menu</button>
          {entryMode === 'account' && <button className="text-button" onClick={async () => { await supabase.auth.signOut(); setEntryMode(null) }}>Sign out</button>}
        </div>
      </header>
      <section className="status-bar">
        <span className="survivor">Survivor: {character.name}</span>
        <span>Maze <strong>{level.size}×{level.size}</strong></span>
        <span>Keys <strong>{game.keys.length}/{level.keys.length}</strong></span>
        <span>Coins <strong>🪙 {inventory.coins}</strong></span>
        <span className={danger ? 'threat active' : 'threat'}>{danger ? 'IT IS CLOSE' : 'QUIET'}</span>
      </section>
      {playMode === 'multi' && <section className="race-status"><strong>Room: {roomCode}</strong><span>{opponent ? `${opponent.name}: ${opponent.status === 'won' ? 'escaped!' : 'racing'}` : 'Waiting for opponent…'}</span></section>}
      <ThreeMaze game={game} color={character.color} jumpSignal={jumpSignal} shotSignal={shotSignal} spiderDead={spiderDead} invisible={invisible} hasDiamondGun={inventory.diamondGun} />
      <section className="touch-controls" aria-label="Game controls">
        <nav className="controls" aria-label="Movement controls">
          {([['▲', 'up'], ['◀', 'left'], ['▼', 'down'], ['▶', 'right']] as const).map(([label, direction]) => (
            <button className={direction} key={direction} onClick={() => move(direction)} aria-label={`Move ${direction}`}>{label}</button>
          ))}
        </nav>
        <div className="action-controls">
          <button className="jump-button" onClick={() => setJumpSignal((signal) => signal + 1)}>JUMP · D</button>
          <button className="weapon-button" onClick={shoot} disabled={gunCooldown > 0}>{gunCooldown > 0 ? `COOLDOWN · ${gunCooldown}s` : inventory.diamondGun ? 'DIAMOND GUN · FIRE · L' : 'GOLD GUN · FREE · L'}</button>
          <button className="potion-button" onClick={useInvisibility} disabled={inventory.invisibilityPotions < 1 || invisible}>{invisible ? 'INVISIBLE · 10s' : `INVISIBILITY · ${inventory.invisibilityPotions}`}</button>
          <button className="shop-button" onClick={() => setShopOpen(true)}>SHOP · 90 🪙</button>
          <button className={musicOn ? 'music-button active' : 'music-button'} onClick={toggleMusic}>{musicOn ? 'MUSIC OFF · U' : 'MUSIC · U'}</button>
        </div>
      </section>
      <p className="inventory-line">❤️ Respawn potions: {inventory.respawnPotions} · 👻 Invisibility potions: {inventory.invisibilityPotions}</p>
      <p className="instructions">Use W, A, S and arrow keys to move. Press D to jump or R to travel to Level 15.</p>
      {paused && <PauseMenu
        onResume={() => setPaused(false)}
        onRestart={() => { setPaused(false); setGame((current) => createGame(current.level, current.steps)) }}
        onMainMenu={() => { setPaused(false); setCharacter(null); setRoomCode(null); setOpponent(null); setEntryMode(null); restart() }}
      />}
      {showJumpscare && (
        <div className="jumpscare" aria-label={game.level >= 14 ? 'Demon jumpscare' : 'Spider jumpscare'}>
          <div className={game.level >= 14 ? 'scare-spider scare-demon' : 'scare-spider'}><i className="scare-eye one" /><i className="scare-eye two" /><i className="scare-eye three" /><i className="scare-eye four" /><i className="fang left" /><i className="fang right" /></div>
          <strong>CAUGHT</strong>
        </div>
      )}
      {playMode === 'multi' && opponent?.status === 'won' && game.status === 'playing' && <div className="race-lost">Your opponent escaped first!</div>}
      {(game.status === 'won' || game.status === 'lost') && !showJumpscare && (
        <div className="overlay"><section className="result-card">
          <span className={game.status === 'won' ? 'result-mark escaped' : 'result-mark caught'} />
          <p className="kicker">{game.status === 'won' ? 'YOU SURVIVED' : 'YOU WERE FOUND'}</p>
          <h2>{game.status === 'won' ? 'The door slams behind you.' : 'The maze keeps another soul.'}</h2>
          <p>You lasted {game.steps} steps.</p>
          <button onClick={restart}>Enter again</button>
        </section></div>
      )}
      <GameShop inventory={inventory} open={shopOpen} onBuy={purchase} onClose={() => setShopOpen(false)} />
    </main>
  )
}
