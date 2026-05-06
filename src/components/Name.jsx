import './Name.css'

// Spans must be on a single line so JSX doesn't insert whitespace
// between them — the loader text "jatinchhanwal" must render seamlessly.
function Name() {
  const handleEnter = () => document.body.classList.add('navDetailsHover')
  const handleLeave = () => document.body.classList.remove('navDetailsHover')

  return (
    <div id="loader" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <span id="letterJ">J</span><span className="loaderFill" id="fillAtin">atin</span><span id="letterC">C</span><span className="loaderFill" id="fillHhanwal">hhanwal</span>
    </div>
  )
}

export default Name
