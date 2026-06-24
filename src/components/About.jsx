import { useState, useEffect } from 'react'
import { aboutMe, beliefs } from './aboutData.js'
import './About.css'

// Split into grapheme clusters so Devanagari/Kannada/Gurmukhi syllables
// (base + matra) type out as one unit instead of flashing broken half-letters.
function graphemes(str) {
  try {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
      return Array.from(seg.segment(str), (s) => s.segment)
    }
  } catch { /* fall through */ }
  return Array.from(str)
}

// A place name typed out like a typewriter — types a spelling, holds, deletes,
// then types the next script, looping. Sits at the end of its line, so it just
// resizes as it types; nothing after it ever shifts. A caret blinks alongside.
function TypewriterWord({ words, startDelay = 0, type = 85, del = 45, hold = 1600, gap = 450 }) {
  const [text, setText] = useState('')
  useEffect(() => {
    const reduce =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setText(words[0]) // no animation — just show the English spelling
      return
    }
    let wi = 0
    let ci = 0
    let phase = 'type'
    let timer
    const step = () => {
      const g = graphemes(words[wi])
      if (phase === 'type') {
        ci += 1
        setText(g.slice(0, ci).join(''))
        if (ci >= g.length) {
          phase = 'hold'
          timer = setTimeout(step, hold)
        } else {
          timer = setTimeout(step, type)
        }
      } else if (phase === 'hold') {
        phase = 'del'
        timer = setTimeout(step, del)
      } else {
        ci -= 1
        setText(g.slice(0, Math.max(0, ci)).join(''))
        if (ci <= 0) {
          wi = (wi + 1) % words.length
          ci = 0
          phase = 'type'
          timer = setTimeout(step, gap)
        } else {
          timer = setTimeout(step, del)
        }
      }
    }
    timer = setTimeout(step, startDelay)
    return () => clearTimeout(timer)
  }, [words, startDelay, type, del, hold, gap])

  // role=img + aria-label exposes a stable English spelling; the live typing
  // is decorative and not announced character-by-character.
  return (
    <span className="rotWord" role="img" aria-label={words[0]}>
      {text}
      <span className="caret" aria-hidden="true" />
    </span>
  )
}

const PUNJAB = ['Punjab', 'ਪੰਜਾਬ', 'पंजाब']           // English · Punjabi · Hindi
const BENGALURU = ['Bengaluru', 'बेंगलुरु', 'ಬೆಂಗಳೂರು'] // English · Hindi · Kannada

function About() {
  return (
    <div id="aboutDiv">
      <div className="aboutCol" data-stamp="/aesthetic/me-1.jpg">
        <p className="sectionLabel">A few things about me</p>
        <ul className="aboutList">
          <li className="aboutItem">
            Born in <TypewriterWord words={PUNJAB} />
          </li>
          <li className="aboutItem">
            Based in <TypewriterWord words={BENGALURU} startDelay={1100} />
          </li>
          {aboutMe.map((line, i) => (
            <li className="aboutItem" key={i}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="aboutCol" data-stamp="/aesthetic/me-2.jpg">
        <p className="sectionLabel">A few things I believe</p>
        <ul className="aboutList">
          {beliefs.map((line, i) => (
            <li className="aboutItem" key={i}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default About
