import data from './experienceData.js'
import './Experience.css'

function Experience() {
  return (
    <div id="experienceDiv">
      <p className="sectionLabel">Experience</p>
      {data.map((e) => (
        <div className="expItem" key={e.key} data-stamp={e.image}>
          <p className="expHead">
            {e.link ? (
              <a
                className={`expCompany${e.featured ? ' featuredExp' : ''}`}
                href={e.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {e.company}
              </a>
            ) : (
              <span className={`expCompany${e.featured ? ' featuredExp' : ''}`}>{e.company}</span>
            )}
            <span className="expDates">{e.dates}</span>
          </p>
          <p className="expRole">{e.role}</p>
          <p className="expDesc">{e.desc}</p>
        </div>
      ))}
    </div>
  )
}

export default Experience
