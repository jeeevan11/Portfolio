import Details from "./Details";
import Projects from "./Projects";
import Connect from "./Connect"
import './Scrollable.css'

function Scrollable(){
    return(
        <div id="scrollableDiv">
            <Details/>
            <Projects/>
            <Connect/>
        </div>
    )
}

export default Scrollable;