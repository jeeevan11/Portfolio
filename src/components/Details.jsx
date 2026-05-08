import './Details.css'

function Details({ onCreativeClick }) {
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
        <span
          className="creativeWord"
          onClick={onCreativeClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCreativeClick && onCreativeClick() }}
          aria-label="Play featured video"
        >
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
