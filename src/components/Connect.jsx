import connectData from './connectData.js'
import './Connect.css'

// Same scroll-cycle pattern as Projects — see the comment in Projects.jsx.
// The outer `#connectDiv` is the slot; `.connectInner` is what gets translated.
function Connect() {
  return (
    <div id="connectDiv">
      <div className="connectInner">
        {connectData.map((link) => (
          <p key={link.link}>
            <a href={link.link} target="_blank" rel="noopener noreferrer">
              {link.name}
            </a>
          </p>
        ))}
      </div>
    </div>
  )
}

export default Connect
