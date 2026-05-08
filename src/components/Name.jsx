import './Name.css'

// Spans must be on a single line so JSX doesn't insert whitespace
// between them — the loader text "jatinchhanwal" must render seamlessly.
function Name() {
  const showFill = () => document.body.classList.add('showCreativeFill')
  const hideFill = () => document.body.classList.remove('showCreativeFill')

  return (
    <h1
      id="loader"
      onMouseEnter={showFill}
      onMouseLeave={hideFill}
      onTouchStart={showFill}
      onTouchEnd={hideFill}
      onTouchCancel={hideFill}
      aria-label="Jatin Chhanwal"
    >
      <span id="letterJ">J</span><span className="loaderFill" id="fillAtin">atin</span><span id="letterC">C</span><span className="loaderFill" id="fillHhanwal">hhanwal</span>
    </h1>
  )
}

export default Name
