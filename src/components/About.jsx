import { useState, useEffect } from 'react'
import { aboutMe, beliefs } from './aboutData.js'
import './About.css'

// A place name that quietly cycles through its spellings in different scripts,
// in a unique accent colour. All spellings are stacked in one inline-grid cell
// sized to the widest, so the cell's width is constant — the text after it
// (", India.") never moves. The city fades out, swaps while invisible, then
// fades back in, so two scripts never overlap.
function RotatingWord({ cities, interval = 2800 }) {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    if (cities.length <= 1) return
    const reduce =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return // hold the first (English) spelling
    let swap
    const id = setInterval(() => {
      setVisible(false)
      swap = setTimeout(() => {
        setActive((p) => (p + 1) % cities.length)
        setVisible(true)
      }, 400)
    }, interval)
    return () => {
      clearInterval(id)
      clearTimeout(swap)
    }
  }, [cities.length, interval])

  return (
    // Screen readers get the English spelling once; the rotation is decorative.
    <span className="rotWord" aria-label={cities[0]} style={{ opacity: visible ? 1 : 0 }}>
      {cities.map((c, i) => (
        <span key={i} aria-hidden="true" className={i === active ? 'rotWordItem on' : 'rotWordItem'}>
          {c}
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
            Born in <RotatingWord cities={PUNJAB} />, India.
          </li>
          <li className="aboutItem">
            Based in <RotatingWord cities={BENGALURU} />, India.
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
