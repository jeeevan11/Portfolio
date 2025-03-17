import connectData from './connectData.js'
import './Connect.css'
function Connect(){

    const connectD = connectData.map((links)=>{
        return(<p key={links.link}><a href={links.link} target="_blank">{links.name}</a></p>)
    })

    return(
        <div id="connectDiv">
            {connectD}
        </div>
    )
}

export default Connect