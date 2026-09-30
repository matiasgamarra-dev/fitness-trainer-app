import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuthStore } from "../stores/auth.js";
import { useProfile } from "../hooks/useProfile.js";

interface ProtectedRouteProps {
  children: ReactNode;
  skipOnboardingCheck?: boolean;
}

const ONBOARDING_FIELDS = [
  "birth_date",
  "sex",
  "height_cm",
  "goal",
] as const;

export default function ProtectedRoute({
  children,
  skipOnboardingCheck = false,
}: ProtectedRouteProps) {
  const { session, initialized } = useAuthStore();
  const location = useLocation();

  const shouldCheckProfile = Boolean(session) && !skipOnboardingCheck;
  const profileQuery = useProfile();

  if (!initialized) {
    return <Loading />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (skipOnboardingCheck) {
    return <>{children}</>;
  }

  if (shouldCheckProfile && profileQuery.isLoading) {
    return <Loading />;
  }

  // Si falla la carga del perfil, dejamos pasar (la página mostrará el error)
  if (shouldCheckProfile && profileQuery.isError) {
    return <>{children}</>;
  }

  if (shouldCheckProfile && profileQuery.data) {
    const profile = profileQuery.data;
    const isComplete = ONBOARDING_FIELDS.every(
      (field) => profile[field] !== null,
    );

    if (!isComplete && location.pathname !== "/onboarding") {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return <>{children}</>;
}

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0D1117]">
      <p className="text-gray-400">Cargando…</p>
    </div>
  );
}