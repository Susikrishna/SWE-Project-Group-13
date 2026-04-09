import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CreateRolePage from './pages/CreateRole'
import Roles from './pages/Roles'
import Home from './pages/Home'
import UserRoleManager from './pages/UserRoleManager'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/newRole" element={<CreateRolePage />} />
        <Route path="/role" element={<Roles />} />
        <Route path="" element = {<Home/>}/>
        <Route path="/userToRole" element = {<UserRoleManager/>}/>
      
      </Routes>
    </BrowserRouter>
  )
}

export default App
