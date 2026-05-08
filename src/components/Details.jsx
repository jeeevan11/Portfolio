import './Details.css'

function Details() {
  const handleEnter = () => document.body.classList.add('navDetailsHover')
  const handleLeave = () => document.body.classList.remove('navDetailsHover')

  return (
    <div id="details" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <p>Independent</p>
      <p>
        <span className="creativeWord">
          <span className="creativeWordBase">Creative</span>
          <span className="creativeWordFill" aria-hidden="true">Creative</span>
        </span>
        {' '}Developer
      </p>
    </div>
  )
}

export default Details
