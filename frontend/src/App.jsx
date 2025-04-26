import { useState } from 'react'
import SideBar from './components/SideBar'
import { Outlet } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex min-h-screen max-w-[1575px] bg-[#F3F4FF]">
      <SideBar />
      <div className=" flex-1">
        <Outlet />
      </div>
    </div>
  )
}

export default App
