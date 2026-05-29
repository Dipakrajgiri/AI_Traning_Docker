import { Navigate, Route, Routes } from "react-router-dom"
import { isAuthenticated } from "./lib/auth"
import { AppLayout } from "./components/AppLayout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Inventories from "./pages/Inventories"
import InventoryDetail from "./pages/InventoryDetail"
import CategoryDetail from "./pages/CategoryDetail"
import AllItems from "./pages/AllItems"

function Protected({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />
}

function GuestOnly({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <Navigate to="/" replace /> : <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestOnly>
            <Login />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <Register />
          </GuestOnly>
        }
      />
      <Route
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventories" element={<Inventories />} />
        <Route path="/inventories/:invId" element={<InventoryDetail />} />
        <Route path="/inventories/:invId/:catId" element={<CategoryDetail />} />
        <Route path="/items" element={<AllItems />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
