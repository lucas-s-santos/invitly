import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import { FullScreenLoader } from "@/components/FullScreenLoader"
import Landing from "@/pages/Landing"
import Login from "@/pages/Login"

// Páginas pesadas / atrás de navegação: carregadas sob demanda
const Dashboard = lazy(() => import("@/pages/Dashboard"))
const TemplateSelect = lazy(() => import("@/pages/TemplateSelect"))
const Editor = lazy(() => import("@/pages/Editor"))
const Checkout = lazy(() => import("@/pages/Checkout"))
const PublicInvite = lazy(() => import("@/pages/PublicInvite"))
const Rsvp = lazy(() => import("@/pages/Rsvp"))
const GuestList = lazy(() => import("@/pages/GuestList"))
const NotFound = lazy(() => import("@/pages/NotFound"))

export default function App() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        {/* Público */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/convite/:slug" element={<PublicInvite />} />
        <Route path="/convite/:slug/rsvp" element={<Rsvp />} />

        {/* Autenticado */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor/novo"
          element={
            <ProtectedRoute>
              <TemplateSelect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor/:id"
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/:id"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/convite/:slug/lista"
          element={
            <ProtectedRoute>
              <GuestList />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
