import './Name.css'

// Spans must be on a single line so JSX doesn't insert whitespace
// between them — the loader text "jatinchhanwal" must render seamlessly.
function Name() {
  const handleEnter = () => document.body.classList.add('navDetailsHover')
  const handleLeave = () => document.body.classList.remove('navDetailsHover')

  return (
    <h1 id="loader" onMouseEnter={handleEnter} onMouseLeave={handleLeave} aria-label="Jatin Chhanwal">
      <span id="letterJ">J</span><span className="loaderFill" id="fillAtin">atin</span><span id="letterC">C</span><span className="loaderFill" id="fillHhanwal">hhanwal</span>
    </h1>
  )
}

export default Name
