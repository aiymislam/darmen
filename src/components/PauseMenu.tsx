type Props = {
  onResume: () => void
  onRestart: () => void
  onMainMenu: () => void
}

export function PauseMenu({ onResume, onRestart, onMainMenu }: Props) {
  return (
    <div className="overlay pause-overlay" role="dialog" aria-modal="true" aria-label="Game paused">
      <section className="result-card pause-card">
        <p className="kicker">GAME PAUSED</p>
        <h2>Take a breath.</h2>
        <div className="pause-actions">
          <button onClick={onResume}>Resume</button>
          <button onClick={onRestart}>Restart level</button>
          <button className="pause-secondary" onClick={onMainMenu}>Main menu</button>
        </div>
        <p>Press Esc to continue</p>
      </section>
    </div>
  )
}
