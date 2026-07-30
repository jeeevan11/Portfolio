import { useState, useEffect } from 'react'
import './ResumeViewer.css'

const RESUME_URL = '/Jatin_Chhanwal_Resume.pdf'

// Phones render <object type="application/pdf"> blank — on mobile we hand the
// PDF straight to the OS viewer in a new tab instead of the in-page modal.
const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768

// A "click me" cue that sits under the portrait stamp and opens the résumé in
// place — view inline, download, or share.
export default function ResumeViewer() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const openResume = () => {
    if (IS_MOBILE) { window.open(RESUME_URL, '_blank', 'noopener'); return }
    setOpen(true)
  }

  // Anything on the page can open the résumé by firing this event
  // (the photo stamp, the "Résumé" link in socials, etc.).
  useEffect(() => {
    const onOpen = () => {
      if (IS_MOBILE) { window.open(RESUME_URL, '_blank', 'noopener') }
      else setOpen(true)
    }
    window.addEventListener('jc:open-resume', onOpen)
    return () => window.removeEventListener('jc:open-resume', onOpen)
  }, [])

  const share = async () => {
    const url = window.location.origin + RESUME_URL
    if (navigator.share) {
      try { await navigator.share({ title: 'Jatin Chhanwal, Résumé', url }) } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      } catch { /* ignore */ }
    }
  }

  return (
    <>
      <button
        className="resumeCue"
        type="button"
        onClick={openResume}
        aria-label="View résumé"
      >
        click me
      </button>

      {open && (
        <div className="resumeModal" role="dialog" aria-modal="true" aria-label="Résumé">
          <div className="resumeBackdrop" onClick={() => setOpen(false)} />
          <div className="resumePanel">
            <div className="resumeBar">
              <span className="resumeTitle">Résumé</span>
              <div className="resumeActions">
                <a className="resumeBtn" href={RESUME_URL} download>Download</a>
                <button className="resumeBtn" type="button" onClick={share}>
                  {copied ? 'Link copied' : 'Share'}
                </button>
                <button
                  className="resumeBtn resumeClose"
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close résumé"
                >
                  Close
                </button>
              </div>
            </div>
            <object className="resumeDoc" data={`${RESUME_URL}#view=FitH`} type="application/pdf" aria-label="Résumé PDF">
              <div className="resumeFallback">
                <p>Your browser can’t show the PDF here.</p>
                <a className="resumeBtn" href={RESUME_URL} target="_blank" rel="noopener noreferrer">Open résumé</a>
              </div>
            </object>
          </div>
        </div>
      )}
    </>
  )
}
