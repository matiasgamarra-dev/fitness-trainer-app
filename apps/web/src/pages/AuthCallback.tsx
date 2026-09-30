import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.js";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { session } = useAuthStore();

  useEffect(() => {
    if (session) {
      navigate("/dashboard", { replace: true });
    }
  }, [session, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-400">Iniciando sesión...</p>
    </div>
  );
}
