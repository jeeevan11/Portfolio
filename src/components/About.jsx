import { aboutMe, beliefs } from './aboutData.js'
import './About.css'

function About() {
  return (
    <div id="aboutDiv">
      <div className="aboutCol" data-stamp="/aesthetic/me-1.jpg">
        <p className="sectionLabel">A few things about me</p>
        <ul className="aboutList">
          {aboutMe.map((line, i) => (
            <li className="aboutItem" key={i}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="aboutCol" data-stamp="/aesthetic/me-2.jpg">
        <p className="sectionLabel">A few things I believe</p>
        <ul className="aboutList">
          {beliefs.map((line, i) => (
            <li className="aboutItem" key={i}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default About
