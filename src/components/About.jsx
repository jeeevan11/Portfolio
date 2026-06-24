import { useState, useEffect } from 'react'
import { aboutMe, beliefs } from './aboutData.js'
import './About.css'

// A word that quietly cycles through its spellings in different scripts, in a
// unique accent colour. All spellings are stacked in one inline-grid cell, so
// the cell is sized to the widest and the line never reflows as it swaps.
function RotatingWord({ words, interval = 2800 }) {
  const [active, setActive] = useState(0)
  useEffect(() => {
    if (words.length <= 1) return
    const reduce =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return // hold the first (English) spelling
    const id = setInterval(() => setActive((p) => (p + 1) % words.length), interval)
    return () => clearInterval(id)
  }, [words.length, interval])

  return (
    // Screen readers get the English spelling once; the rotation is decorative.
    <span className="rotWord" aria-label={words[0]}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" className={i === active ? 'rotWordItem on' : 'rotWordItem'}>
          {w}
        </span>
      ))}
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
            Born in <RotatingWord words={PUNJAB} />.
          </li>
          <li className="aboutItem">
            Based in <RotatingWord words={BENGALURU} />, India.
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
