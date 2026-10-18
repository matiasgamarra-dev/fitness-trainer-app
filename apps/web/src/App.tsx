import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import Dashboard from "./pages/Dashboard.js";
import AuthCallback from "./pages/AuthCallback.js";
import Onboarding from "./pages/Onboarding.js";
import Profile from "./pages/Profile.js";
import Measurements from "./pages/Measurements.js";
import Routines from "./pages/Routines.js";
import RoutineDetail from "./pages/RoutineDetail.js";
import RoutineForm from "./pages/RoutineForm.js";
import Workouts from "./pages/Workouts.js";
import WorkoutForm from "./pages/WorkoutForm.js";
import WorkoutActive from "./pages/WorkoutActive.js";
import ProtectedRoute from "./components/ProtectedRoute.js";
import AppLayout from "./components/AppLayout.js";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PÃºblicas */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Onboarding: protegida pero SIN layout (pantalla completa) */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute skipOnboardingCheck>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Protegidas con layout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/measurements" element={<Measurements />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/routines/new" element={<RoutineForm />} />
          <Route path="/routines/:id" element={<RoutineDetail />} />
          <Route path="/routines/:id/edit" element={<RoutineForm />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/workouts/new" element={<WorkoutForm />} />
          <Route path="/workouts/:id" element={<WorkoutActive />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}