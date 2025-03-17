import { useState } from 'react'
import Name from './components/Name'
import Switch from './components/Switch'
import Scrollable from './components/Scrollable'
import Footer from './components/Footer'

function App(){
  const [theme,setTheme]= useState('light');

  return(
    <>
      <div className={theme}>
        <Name/>
        <Switch className={theme==='light'? 'dark' : 'light'}/>
        <Scrollable/>
        <div className={theme==='light'? 'dark' : 'light'}>
          <Footer/>
        </div>
      </div>
    </>
  )
}

export default App