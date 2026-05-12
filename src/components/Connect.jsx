import connectData from './connectData.js'
import './Connect.css'

function Connect() {
  return (
    <div id="connectDiv">
      {connectData.map((link) => (
        <p key={link.key}>
          <a
            href={link.link}
            // Real socials open in a new tab. Placeholders aren't live yet,
            // so we drop the target and prevent default to avoid the
            // href="#" page-jump.
            target={link.placeholder ? undefined : '_blank'}
            rel={link.placeholder ? undefined : 'noopener noreferrer'}
            onClick={link.placeholder ? (e) => e.preventDefault() : undefined}
            aria-disabled={link.placeholder || undefined}
          >
            {link.name}
          </a>
        </p>
      ))}
    </div>
  )
}

export default Connect
