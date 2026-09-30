import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.js";

export default function Login() {
  const navigate = useNavigate();
  const { signInWithEmail, signInWithGoogle, loading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const { error } = await signInWithEmail(email, password);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/dashboard");
  }

  async function handleGoogle() {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg bg-[#161B22] p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-cyan-400">Iniciar sesión</h1>
        <p className="mb-6 text-sm text-gray-400">Entrená. Comé. Progresá.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded bg-[#0D1117] px-3 py-2 text-white outline-none ring-1 ring-gray-700 focus:ring-cyan-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded bg-[#0D1117] px-3 py-2 text-white outline-none ring-1 ring-gray-700 focus:ring-cyan-400"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-cyan-500 py-2 font-semibold text-black transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-2">
          <div className="h-px flex-1 bg-gray-700" />
          <span className="text-xs text-gray-500">o</span>
          <div className="h-px flex-1 bg-gray-700" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full rounded border border-gray-700 bg-white py-2 font-semibold text-black transition hover:bg-gray-100 disabled:opacity-50"
        >
          Continuar con Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-400">
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="text-cyan-400 hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
