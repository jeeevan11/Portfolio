import './Details.css'

function Details() {
  const showColor = () => document.body.classList.add('navDetailsHover')
  const hideColor = () => document.body.classList.remove('navDetailsHover')

  const headingHandlers = {
    onMouseEnter: showColor,
    onMouseLeave: hideColor,
    onTouchStart: showColor,
    onTouchEnd: hideColor,
    onTouchCancel: hideColor,
  }

  return (
    <div id="details">
      <p>
        <span className="headingWord" {...headingHandlers}>Independent</span>
      </p>
      <p>
        <span className="creativeWord">
          <span className="creativeWordBase">Creative</span>
          <span className="creativeWordFill" aria-hidden="true">Creative</span>
        </span>
        {' '}
        <span className="headingWord" {...headingHandlers}>Developer</span>
      </p>
    </div>
  )
}

export default Details
