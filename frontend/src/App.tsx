import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { Layout } from '@/components/common/Layout'
import { LoginPage } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { RecoveryCenterPage } from '@/pages/RecoveryCenter'
import { BatchRecoveryPage } from '@/pages/BatchRecovery'
import { HinglishRecoveryChatPage } from '@/pages/HinglishRecoveryChat'
import { CasesPage } from '@/pages/Cases'
import { CaseDetailPage } from '@/pages/CaseDetail'
import { AuditTrailPage } from '@/pages/AuditTrail'
import { SettingsPage } from '@/pages/Settings'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <Layout>{children}</Layout>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/batch-recovery"
        element={
          <ProtectedRoute>
            <BatchRecoveryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recovery-center"
        element={
          <ProtectedRoute>
            <RecoveryCenterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hinglish-chat"
        element={
          <ProtectedRoute>
            <HinglishRecoveryChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases"
        element={
          <ProtectedRoute>
            <CasesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:id"
        element={
          <ProtectedRoute>
            <CaseDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit"
        element={
          <ProtectedRoute>
            <AuditTrailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App
