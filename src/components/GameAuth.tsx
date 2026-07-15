import { useState } from 'react'
import { supabase } from '../lib/supabase'

type Mode = 'signup' | 'signin'

export function GameAuth({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const result = mode === 'signup'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    if (result.error) setMessage(result.error.message)
    else if (mode === 'signup' && !result.data.session) {
      setMessage('Account created. Check your email to confirm it, then sign in.')
    }
    setBusy(false)
  }

  const switchMode = () => {
    setMode((current) => current === 'signup' ? 'signin' : 'signup')
    setMessage('')
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <p className="kicker">SECRETS OF THE LABYRINTH</p>
        <h1>{mode === 'signup' ? 'Create survivor account' : 'Welcome back'}</h1>
        <p className="auth-intro">Save your identity and enter the labyrinth.</p>
        <form onSubmit={submit} className="auth-form">
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} /></label>
          <button type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Enter game'}</button>
        </form>
        {message && <p className="auth-message" role="status">{message}</p>}
        <button className="auth-switch" onClick={switchMode}>
          {mode === 'signup' ? 'Already registered? Sign in' : 'Need an account? Register'}
        </button>
        <button className="auth-switch" onClick={onBack}>Back to main menu</button>
      </section>
    </main>
  )
}
