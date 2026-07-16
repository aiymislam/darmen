import { useMemo, useState } from 'react'
import { countries } from '../lib/countries'

type Props = { countryIndex: number; onAnswer: (correct: boolean) => void }
export function QuizCard({ countryIndex, onAnswer }: Props) {
  const country = countries[countryIndex]
  const options = useMemo(() => [...country.options].sort(() => Math.random() - 0.5), [country])
  const [selected, setSelected] = useState<string | null>(null)
  return <div className="overlay"><section className="quiz-card">
    <p className="eyebrow">FLAG COLLECTED</p>
    <div className="big-flag">{country.flag}</div>
    <h2>Which country is this?</h2>
    <div className="answers">{options.map((option) => <button key={option} className={selected ? (option === country.name ? 'correct' : option === selected ? 'wrong' : '') : ''} onClick={() => setSelected(option)} disabled={selected !== null}>{option}</button>)}</div>
    {selected && <><p className="feedback">{selected === country.name ? 'Correct! +100 points' : `It is ${country.name}. +25 points`}</p><button className="continue" onClick={() => onAnswer(selected === country.name)}>Continue</button></>}
  </section></div>
}
