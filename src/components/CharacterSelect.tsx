import type { CSSProperties } from 'react'

export type Character = { name: string; color: number; colorHex: string; skill: string }

export const characters: Character[] = [
  { name: 'Mara', color: 0x8f342e, colorHex: '#8f342e', skill: 'The fearless explorer' },
  { name: 'Noah', color: 0x344c62, colorHex: '#344c62', skill: 'The clever survivor' },
  { name: 'Iris', color: 0x5d4a71, colorHex: '#5d4a71', skill: 'The silent runner' },
  { name: 'Zane', color: 0x486f52, colorHex: '#486f52', skill: 'The night tracker' },
  { name: 'Elena', color: 0xb56d32, colorHex: '#b56d32', skill: 'The brave medic' },
  { name: 'Kai', color: 0x733f45, colorHex: '#733f45', skill: 'The lost detective' },
  { name: 'Sofia', color: 0x2f6870, colorHex: '#2f6870', skill: 'The fearless climber' },
  { name: 'Leo', color: 0x7b6335, colorHex: '#7b6335', skill: 'The quick escape artist' },
  { name: 'Amara', color: 0x70436a, colorHex: '#70436a', skill: 'The mystery researcher' },
  { name: 'Maya', color: 0x9a4f63, colorHex: '#9a4f63', skill: 'The careful navigator' },
  { name: 'Adam', color: 0x365a7a, colorHex: '#365a7a', skill: 'The fearless scout' },
  { name: 'Luna', color: 0x6f5798, colorHex: '#6f5798', skill: 'The shadow watcher' },
  { name: 'Theo', color: 0x55743c, colorHex: '#55743c', skill: 'The hidden pathfinder' },
  { name: 'Nina', color: 0xa26145, colorHex: '#a26145', skill: 'The clever locksmith' },
  { name: 'Omar', color: 0x445d5e, colorHex: '#445d5e', skill: 'The quiet guardian' },
  { name: 'Eva', color: 0x8a496f, colorHex: '#8a496f', skill: 'The brave investigator' },
  { name: 'Max', color: 0x6c5b42, colorHex: '#6c5b42', skill: 'The quick thinker' },
  { name: 'Zara', color: 0x3f7180, colorHex: '#3f7180', skill: 'The storm survivor' },
  { name: 'Finn', color: 0x78573d, colorHex: '#78573d', skill: 'The tunnel explorer' },
  { name: 'Layla', color: 0x705687, colorHex: '#705687', skill: 'The calm strategist' },
  { name: 'Sam', color: 0x477052, colorHex: '#477052', skill: 'The daring rescuer' },
  { name: 'Ruby', color: 0x983d3f, colorHex: '#983d3f', skill: 'The fearless runner' },
  { name: 'Alex', color: 0x3f5878, colorHex: '#3f5878', skill: 'The clue collector' },
  { name: 'Hana', color: 0x8b6445, colorHex: '#8b6445', skill: 'The patient tracker' },
  { name: 'Milo', color: 0x526b63, colorHex: '#526b63', skill: 'The maze cartographer' },
  { name: 'Ava', color: 0x865171, colorHex: '#865171', skill: 'The daring adventurer' },
  { name: 'Ben', color: 0x65733f, colorHex: '#65733f', skill: 'The final survivor' },
]

type Props = { onSelect: (character: Character) => void }

export function CharacterSelect({ onSelect }: Props) {
  return (
    <main className="start-screen">
      <p className="kicker">A NIGHTMARE AWAITS</p>
      <h1>Secrets of the Labyrinth</h1>
      <p className="intro">Survive three changing mazes. Find every cursed key. Do not let it find you.</p>
      <h2>Choose your survivor</h2>
      <div className="characters">
        {characters.map((character) => (
          <button className="character-card" key={character.name} onClick={() => onSelect(character)}>
            <span className="avatar-preview" style={{ '--coat': character.colorHex } as CSSProperties}>
              <i className="avatar-head"><b className="preview-eye left" /><b className="preview-eye right" /><b className="preview-nose" /><b className="preview-smile" /></i>
              <i className="avatar-body" />
            </span>
            <strong>{character.name}</strong>
            <small>{character.skill}</small>
          </button>
        ))}
      </div>
      <p className="warning">Hard difficulty · The spider moves once every time you move</p>
    </main>
  )
}
