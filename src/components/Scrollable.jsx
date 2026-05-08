import Details from './Details'
import Projects from './Projects'
import Connect from './Connect'
import './Scrollable.css'

function Scrollable({ onCreativeClick }) {
  return (
    <div id="scrollableDiv">
      <Details onCreativeClick={onCreativeClick} />
      <Projects />
      <Connect />
    </div>
  )
}

export default Scrollable
