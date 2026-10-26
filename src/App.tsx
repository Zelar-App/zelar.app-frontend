import { RouterProvider } from 'react-router'
import { router } from './app/router'
import { AuthProvider } from './features/auth/AuthContext'
import { getApi } from './services/api'
import { ApiProvider } from './services/api/ApiContext'

export default function App() {
  return (
    <ApiProvider api={getApi()}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ApiProvider>
  )
}
