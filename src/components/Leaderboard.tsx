import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type LeaderboardEntry = {
  user_id: string
  display_name: string
  highest_level: number
  updated_at: string
}

export function Leaderboard({ onBack }: { onBack: () => void }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    supabase
      .from('player_progress')
      .select('user_id, display_name, highest_level, updated_at')
      .order('highest_level', { ascending: false })
      .order('updated_at', { ascending: true })
      .limit(50)
      .then(({ data, error: requestError }) => {
        if (!active) return
        if (requestError) setError('The leaderboard is unavailable until the latest database migration is applied.')
        else setEntries(data ?? [])
        setLoading(false)
      })
    return () => { active = false }
  }, [])

  return (
    <main className="menu-screen">
      <section className="leaderboard-card">
        <p className="kicker">HALL OF SURVIVORS</p>
        <h1>Leaderboard</h1>
        <p className="leaderboard-intro">Ranked by the highest level reached.</p>
        {loading && <p className="leaderboard-message">Loading survivors…</p>}
        {error && <p className="leaderboard-message" role="alert">{error}</p>}
        {!loading && !error && entries.length === 0 && <p className="leaderboard-message">No survivors have reached the maze yet.</p>}
        {entries.length > 0 && (
          <ol className="leaderboard-list">
            {entries.map((entry, index) => (
              <li key={entry.user_id}>
                <span className="leaderboard-rank">#{index + 1}</span>
                <strong>{entry.display_name}</strong>
                <span>Level {entry.highest_level}</span>
              </li>
            ))}
          </ol>
        )}
        <button className="leaderboard-back" onClick={onBack}>Back to main menu</button>
      </section>
    </main>
  )
}
