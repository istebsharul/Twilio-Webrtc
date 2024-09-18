import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CallComponent from './Components/TwilioWebRTC'
import TwilioWebRTC from './Components/TwilioWebRTC'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <TwilioWebRTC/>
    </>
  )
}

export default App
