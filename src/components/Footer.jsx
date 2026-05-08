import './Footer.css'

const BACK_TO_TOP_TEXT = 'BACK TO TOP ↑'

const DEFAULT_QUOTE = { line1: "Hold on,", line2: "we're going home.", source: "Drake" }

function Footer({ quote = DEFAULT_QUOTE, onLineHover }) {
  return (
    <footer id="footerDiv" role="contentinfo">
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
      <div
        id="footerLine"
        onMouseEnter={onLineHover}
        onTouchStart={onLineHover}
      ></div>
      <div id="footerYear">
        <div
          id="footerYearText"
          key={quote.line1 + quote.line2}
          onClick={onLineHover}
          role="button"
          tabIndex={0}
          aria-label="Shuffle Drake quote"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onLineHover && onLineHover() }}
        >
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
    </footer>
  )
}

export default Footer
