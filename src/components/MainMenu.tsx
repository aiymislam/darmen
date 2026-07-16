type Props = {
  hasAccount: boolean
  onAccount: () => void
  onGuest: () => void
  onMultiplayer: () => void
}

export function MainMenu({ hasAccount, onAccount, onGuest, onMultiplayer }: Props) {
  return (
    <main className="menu-screen">
      <section className="main-menu">
        <p className="kicker">60 LEVELS · 67 SURVIVORS · ONE WAY OUT</p>
        <h1>Secrets of the Labyrinth</h1>
        <p className="menu-intro">Collect the cursed keys, escape the growing maze, and stay ahead of the spider.</p>
        <div className="menu-actions">
          <button className="menu-primary" onClick={onAccount}>{hasAccount ? 'Continue with account' : 'Register or sign in'}</button>
          <button className="menu-secondary" onClick={onGuest}>Play as guest</button>
          <button className="menu-secondary multiplayer" onClick={onMultiplayer}>Online race</button>
        </div>
        <p className="guest-note">Guest mode starts instantly without registration.</p>
      </section>
    </main>
  )
}
