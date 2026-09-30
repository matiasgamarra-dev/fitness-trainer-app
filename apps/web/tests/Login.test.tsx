import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../src/pages/Login.js";
import { useAuthStore } from "../src/stores/auth.js";

vi.mock("../src/stores/auth.js", () => ({
  useAuthStore: vi.fn(),
}));

describe("Login", () => {
  beforeEach(() => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      signInWithEmail: vi.fn(),
      signInWithGoogle: vi.fn(),
      loading: false,
    });
  });

  it("renderiza el formulario de login", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );

    // h1 específicamente (no el botón)
    expect(
      screen.getByRole("heading", { name: "Iniciar sesión" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByText("Continuar con Google")).toBeInTheDocument();
  });

  it("muestra el link a registro", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );

    expect(screen.getByText("Registrate")).toBeInTheDocument();
  });
});