import './Footer.css'

const BACK_TO_TOP_TEXT = 'BACK TO TOP ↑'

function Footer() {
  return (
    <div id="footerDiv">
      <div id="footerTopBar">
        <span id="footerMark">FOLIO / 26</span>
        <button className="footerBackTop" type="button">
          {Array.from(BACK_TO_TOP_TEXT).map((char, i) => (
            <span
              key={i}
              className="letterWrapper"
              style={{ '--delay': `${i * 0.03}s` }}
            >
              <span className="letterStack">
                <span>{char === ' ' ? ' ' : char}</span>
                <span>{char === ' ' ? ' ' : char}</span>
              </span>
            </span>
          ))}
        </button>
      </div>
      <div id="footerLine"></div>
      <div id="footerYear">
        <div id="footerYearText">
          <span>Hold on,</span>
          <span>we're going home.</span>
          <span id="footerAttrib">— Drake</span>
        </div>
        <a
          id="footerArrow"
          href="mailto:connectwithjatin365@gmail.com"
          aria-label="Email Jatin"
        >→</a>
      </div>
    </div>
  )
}

export default Footer
