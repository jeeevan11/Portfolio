import './Projects.css'
import data from './projectsData.js'

function Projects() {
  return (
    <div id="projectRefs">
      {data.map((proj) => (
        <p className="projectPara" key={proj.key}>
          <a
            href={proj.link}
            // Real projects open in a new tab. Placeholders don't have a
            // real destination, so we skip target=_blank and swallow the
            // click so href="#" doesn't jump the page to the top.
            target={proj.placeholder ? undefined : '_blank'}
            rel={proj.placeholder ? undefined : 'noopener noreferrer'}
            onClick={proj.placeholder ? (e) => e.preventDefault() : undefined}
            aria-disabled={proj.placeholder || undefined}
            className={proj.featured ? 'featuredLink' : ''}
          >
            {proj.name}
            {proj.tags && <span className="projTags">{proj.tags}</span>}
          </a>
          <sup className="sup">({proj.year})</sup>
        </p>
      ))}
    </div>
  )
}

export default Projects
