import { useState } from 'react'
import connectData from './connectData.js'
import './Connect.css'

function Connect() {
  const [toast, setToast] = useState('')

  const flash = (msg) => {
    setToast(msg)
    window.clearTimeout(flash._t)
    flash._t = window.setTimeout(() => setToast(''), 1900)
  }

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      flash('Email copied to clipboard')
    } catch {
      flash(text)
    }
  }

  return (
    <div id="connectDiv">
      {connectData.map((link) => {
        const isExternal = link.link && /^https?:/.test(link.link)
        let inner
        if (link.copy) {
          inner = (
            <button
              type="button"
              className="connectAction"
              onClick={() => copy(link.copy)}
              aria-label="Copy email address"
            >
              {link.name}
            </button>
          )
        } else {
          inner = (
            <a
              href={link.link}
              target={isExternal ? '_blank' : undefined}
              rel="noopener noreferrer"
            >
              {link.name}
            </a>
          )
        }
        return (
          <p key={link.key} data-stamp={link.image}>
            {inner}
          </p>
        )
      })}

      <div className={`connectToast${toast ? ' show' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  )
}

export default Connect
