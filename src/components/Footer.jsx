import './Footer.css'

const BACK_TO_TOP_TEXT = 'BACK TO TOP ↑'

const DEFAULT_QUOTE = { line1: "Hold on,", line2: "we're going home.", source: "Drake" }

function Footer({ quote = DEFAULT_QUOTE }) {
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
                <span>{char === ' ' ? ' ' : char}</span>
                <span>{char === ' ' ? ' ' : char}</span>
              </span>
            </span>
          ))}
        </button>
      </div>
      <div id="footerLine"></div>
      <div id="footerYear">
        <div id="footerYearText" key={quote.line1 + quote.line2}>
          <span>{quote.line1}</span>
          <span>{quote.line2}</span>
          <span id="footerAttrib">— {quote.source}</span>
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
