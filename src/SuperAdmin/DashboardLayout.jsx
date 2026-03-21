import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function DashboardLayout() {
  return (
    <div className="h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-6">
        <Navbar />
        <main className="mt-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}