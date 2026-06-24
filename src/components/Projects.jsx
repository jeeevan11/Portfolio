import './Projects.css'
import data from './projectsData.js'

function Projects() {
  return (
    <div id="projectRefs">
      <p className="sectionLabel">Selected work</p>
      {data.map((proj) => (
        <div className="projectPara" key={proj.key} data-stamp={proj.image}>
          <p className="projName">
            {proj.placeholder ? (
              // No public link yet — render as plain text so it never looks
              // clickable (honest affordance), not a dead link.
              <span className={`projNameStatic${proj.featured ? ' featuredLink' : ''}`}>
                {proj.name}
              </span>
            ) : (
              <a
                href={proj.link}
                target="_blank"
                rel="noopener noreferrer"
                className={proj.featured ? 'featuredLink' : ''}
              >
                {proj.name}
              </a>
            )}
          </p>
          {proj.tag && <span className="projTag">{proj.tag}</span>}
          {proj.desc && <p className="projDesc">{proj.desc}</p>}
        </div>
      ))}
    </div>
  )
}

export default Projects
