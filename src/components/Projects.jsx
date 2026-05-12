import './Projects.css'
import data from './projectsData.js'

// Projects renders as a vertical stack inside `.projectsInner`. The outer
// `#projectRefs` is the "slot" — its height is constrained to one item by
// CSS + JS, and overflow:hidden hides the rest of the stack. App.jsx then
// pins the slot on scroll and translates `.projectsInner` upward so each
// project cycles through the slot one at a time.
function Projects() {
  return (
    <div id="projectRefs">
      <div className="projectsInner">
        {data.map((proj) => (
          <p className="projectPara" key={proj.key}>
            <a href={proj.link} target="_blank" rel="noopener noreferrer" className={proj.featured ? 'featuredLink' : ''}>
              {proj.name}
              {proj.tags && <span className="projTags">{proj.tags}</span>}
            </a>
            <sup className="sup">({proj.year})</sup>
          </p>
        ))}
      </div>
    </div>
  )
}

export default Projects
