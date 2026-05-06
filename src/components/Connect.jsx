import connectData from './connectData.js'
import './Connect.css'

function Connect() {
  return (
    <div id="connectDiv">
      {connectData.map((link) => (
        <p key={link.link}>
          <a href={link.link} target="_blank" rel="noopener noreferrer">
            {link.name}
          </a>
        </p>
      ))}
    </div>
  )
}

export default Connect
