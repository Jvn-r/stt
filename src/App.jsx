import { useAuthenticationStatus } from '@nhost/react'
import Login from './Login'
import Dashboard from './Dashboard'

function App() {
  const { isAuthenticated, isLoading } = useAuthenticationStatus()
  console.log('isLoading:', isLoading, 'isAuthenticated:', isAuthenticated)

  if (isLoading) return <div className="center">Loading...</div>

  return isAuthenticated ? <Dashboard /> : <Login />
}
export default App
