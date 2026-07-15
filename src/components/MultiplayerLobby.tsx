import { useState } from 'react'

export function MultiplayerLobby({ onJoin, onBack }: { onJoin: (code: string) => void; onBack: () => void }) {
  const [code, setCode] = useState('')
  const createRoom = () => onJoin(Math.random().toString(36).slice(2, 8).toUpperCase())
  const joinRoom = () => { if (code.trim().length >= 4) onJoin(code.trim().toUpperCase()) }

  return (
    <main className="auth-screen">
      <section className="auth-card race-lobby">
        <p className="kicker">ONLINE MULTIPLAYER</p>
        <h1>Race a friend</h1>
        <p className="auth-intro">Create a room and share its code, or enter your friend’s code.</p>
        <button className="lobby-create" onClick={createRoom}>Create race room</button>
        <div className="room-divider">OR</div>
        <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="ROOM CODE" maxLength={8} />
        <button className="lobby-join" onClick={joinRoom}>Join room</button>
        <button className="auth-switch" onClick={onBack}>Back to main menu</button>
      </section>
    </main>
  )
}
