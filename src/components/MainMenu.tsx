import type { Language } from '../lib/i18n'

type Props = {
  hasAccount: boolean
  onAccount: () => void
  onGuest: () => void
  onMultiplayer: () => void
  onLeaderboard: () => void
  language: Language
  onLanguageChange: (language: Language) => void
}

const translations = {
  en: {
    language: 'Language', kicker: '15 LEVELS · 67 SURVIVORS · ONE WAY OUT', title: 'Secrets of the Labyrinth',
    intro: 'Collect the cursed keys, escape the growing maze, and stay ahead of the spider.',
    account: 'Register or sign in', continue: 'Continue with account', guest: 'Play as guest',
    race: 'Online race', leaderboard: 'Leaderboard', note: 'Guest mode starts instantly without registration.',
  },
  ru: {
    language: 'Язык', kicker: '15 УРОВНЕЙ · 67 ВЫЖИВШИХ · ОДИН ВЫХОД', title: 'Тайны лабиринта',
    intro: 'Собери проклятые ключи, выберись из растущего лабиринта и не дай пауку догнать тебя.',
    account: 'Регистрация или вход', continue: 'Продолжить с аккаунтом', guest: 'Играть как гость',
    race: 'Онлайн-гонка', leaderboard: 'Таблица лидеров', note: 'Гостевой режим запускается сразу без регистрации.',
  },
  kk: {
    language: 'Тіл', kicker: '15 ДЕҢГЕЙ · 67 АМАН ҚАЛҒАН · БІР ҒАНА ШЫҒУ ЖОЛЫ', title: 'Лабиринт құпиялары',
    intro: 'Қарғыс атқан кілттерді жинап, үлкейіп жатқан лабиринттен қашып, өрмекшіден алда бол.',
    account: 'Тіркелу немесе кіру', continue: 'Аккаунтпен жалғастыру', guest: 'Қонақ ретінде ойнау',
    race: 'Онлайн жарыс', leaderboard: 'Көшбасшылар', note: 'Қонақ режимі тіркелусіз бірден басталады.',
  },
} satisfies Record<Language, Record<string, string>>

export function MainMenu({ hasAccount, onAccount, onGuest, onMultiplayer, onLeaderboard, language, onLanguageChange }: Props) {
  const text = translations[language]

  return (
    <main className="menu-screen">
      <section className="main-menu">
        <label className="language-select">
          <span>{text.language}</span>
          <select value={language} onChange={(event) => onLanguageChange(event.target.value as Language)}>
            <option value="en">English</option>
            <option value="ru">Русский</option>
            <option value="kk">Қазақша</option>
          </select>
        </label>
        <p className="kicker">{text.kicker}</p>
        <h1>{text.title}</h1>
        <p className="menu-intro">{text.intro}</p>
        <div className="menu-actions">
          <button className="menu-primary" onClick={onAccount}>{hasAccount ? text.continue : text.account}</button>
          <button className="menu-secondary" onClick={onGuest}>{text.guest}</button>
          <button className="menu-secondary multiplayer" onClick={onMultiplayer}>{text.race}</button>
          <button className="menu-secondary leaderboard-button" onClick={onLeaderboard}>{text.leaderboard}</button>
        </div>
        <p className="guest-note">{text.note}</p>
      </section>
    </main>
  )
}
