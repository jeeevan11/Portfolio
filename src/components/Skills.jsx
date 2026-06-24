import { skillGroups, recognition } from './skillsData.js'
import './Skills.css'

function Skills() {
  return (
    <div id="skillsDiv">
      <p className="sectionLabel">Skills</p>
      {skillGroups.map((g) => (
        <div className="skillRow" key={g.key} data-stamp={g.image}>
          <span className="skillLabel">{g.label}</span>
          <span className="skillItems">{g.items.join('  ·  ')}</span>
        </div>
      ))}

      <div className="recogBlock" data-stamp="/work/recognition.jpg">
        <p className="sectionLabel recogLabel">Recognition</p>
        {recognition.map((r) => (
          <p className="recogItem" key={r.key}>
            <span className="recogTitle">{r.title}</span>
            <span className="recogDetail">{r.detail}</span>
          </p>
        ))}
      </div>
    </div>
  )
}

export default Skills
