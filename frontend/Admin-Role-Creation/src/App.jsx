import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CreateRolePage from './pages/CreateRole'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <CreateRolePage/>
    </>
  )
}

export default App
