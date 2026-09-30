import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Register from "../src/pages/Register.js";
import { useAuthStore } from "../src/stores/auth.js";

vi.mock("../src/stores/auth.js", () => ({
  useAuthStore: vi.fn(),
}));

describe("Register", () => {
  beforeEach(() => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      signUpWithEmail: vi.fn(),
      signInWithGoogle: vi.fn(),
      loading: false,
    });
  });

  it("renderiza el formulario de registro", () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Crear cuenta" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar password")).toBeInTheDocument();
  });

  it("muestra el link a login", () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>,
    );

    expect(screen.getByText("Iniciá sesión")).toBeInTheDocument();
  });
});