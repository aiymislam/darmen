import type { CSSProperties } from 'react'

export type Character = { name: string; color: number; colorHex: string; skill: string }

export const characters: Character[] = [
  { name: 'Mara', color: 0x8f342e, colorHex: '#8f342e', skill: 'The fearless explorer' },
  { name: 'Noah', color: 0x344c62, colorHex: '#344c62', skill: 'The clever survivor' },
  { name: 'Iris', color: 0x5d4a71, colorHex: '#5d4a71', skill: 'The silent runner' },
]

type Props = { onSelect: (character: Character) => void }

export function CharacterSelect({ onSelect }: Props) {
  return (
    <main className="start-screen">
      <p className="kicker">A NIGHTMARE AWAITS</p>
      <h1>The Hollow Maze</h1>
      <p className="intro">Find three cursed keys. Unlock the iron door. Do not let it find you.</p>
      <h2>Choose your survivor</h2>
      <div className="characters">
        {characters.map((character) => (
          <button className="character-card" key={character.name} onClick={() => onSelect(character)}>
            <span className="avatar-preview" style={{ '--coat': character.colorHex } as CSSProperties}>
              <i className="avatar-head" /><i className="avatar-body" />
            </span>
            <strong>{character.name}</strong>
            <small>{character.skill}</small>
          </button>
        ))}
      </div>
      <p className="warning">Headphones recommended · The monster moves every two steps</p>
    </main>
  )
}
