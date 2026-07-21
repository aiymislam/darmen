export type Language = 'en' | 'ru' | 'kk'

export const readLanguage = (): Language => {
  const saved = localStorage.getItem('labyrinth-language')
  return saved === 'ru' || saved === 'kk' ? saved : 'en'
}

export const saveLanguage = (language: Language) => {
  localStorage.setItem('labyrinth-language', language)
}
