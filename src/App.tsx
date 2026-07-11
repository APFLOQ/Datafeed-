import { useState, useEffect } from 'react'
import { SpiralAnimation } from '@/components/ui/spiral-animation'
import Dashboard from '@/pages/Dashboard'

export default function App() {
  const [inDashboard, setInDashboard] = useState(false)
  const [startVisible, setStartVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setStartVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (inDashboard) {
    return <Dashboard />
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
      <SpiralAnimation />
      <div
        className={`
          absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10
          transition-all duration-1000 ease-out
          ${startVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        <button
          onClick={() => setInDashboard(true)}
          className="
            text-white text-2xl tracking-[0.2em] uppercase font-extralight
            transition-all duration-700
            hover:tracking-[0.3em] animate-pulse
          "
        >
          Enter
        </button>
      </div>
    </div>
  )
}
