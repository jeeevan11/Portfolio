import Details from './Details'
import About from './About'
import Experience from './Experience'
import Projects from './Projects'
import Skills from './Skills'
import Connect from './Connect'
import './Scrollable.css'

function Scrollable() {
  return (
    <div id="scrollableDiv">
      <Details />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <Connect />
    </div>
  )
}

export default Scrollable
