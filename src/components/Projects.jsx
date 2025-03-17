import './Projects.css'
import data from './projectsData.js'

function Projects(){

    const projectsList = data.map((proj)=>{
        return(<><p id="projectPara" key={proj.key}><a href={proj.link} target="_blank">{proj.name}</a><sup class="sup">({proj.year})</sup></p></>)
    })

    return(
        <div id="projectRefs">
            {projectsList}
        </div>
    )
}

export default Projects