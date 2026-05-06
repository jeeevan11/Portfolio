import './Details.css'

function Details() {
  const handleEnter = () => document.body.classList.add('navDetailsHover')
  const handleLeave = () => document.body.classList.remove('navDetailsHover')

  return (
    <div id="details" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <p>Independent</p>
      <p>Creative Developer</p>
    </div>
  )
}

export default Details
