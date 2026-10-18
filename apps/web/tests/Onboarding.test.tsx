import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Onboarding from "../src/pages/Onboarding.js";
import { useAuthStore } from "../src/stores/auth.js";
import { useUpdateProfile } from "../src/hooks/useProfile.js";

// Mock del navigate
const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../src/stores/auth.js", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("../src/hooks/useProfile.js", () => ({
  useProfile: vi.fn(),
  useUpdateProfile: vi.fn(),
}));

// Estado fake del auth (lo que devuelve el store)
const FAKE_AUTH_STATE = {
  user: {
    user_metadata: { name: "Matías Gamarra" },
    email: "test@example.com",
  },
  session: { access_token: "fake-token" },
  initialized: true,
};

describe("Onboarding", () => {
  const mutateAsyncMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock con SOPORTE de selector: (state) => selector(state)
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector?: (state: typeof FAKE_AUTH_STATE) => unknown) => {
        if (typeof selector === "function") {
          return selector(FAKE_AUTH_STATE);
        }
        return FAKE_AUTH_STATE;
      },
    );

    (useUpdateProfile as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    });
  });

  function renderOnboarding() {
    return render(
      <MemoryRouter>
        <Onboarding />
      </MemoryRouter>,
    );
  }

  it("renderiza el paso 1 con el nombre pre-cargado", () => {
    renderOnboarding();

    expect(screen.getByText(/Paso 1 de 4/)).toBeInTheDocument();
    // El input de nombre debe tener el valor pre-cargado
    const nameInput = screen.getByPlaceholderText("Cómo te llamás");
    expect(nameInput).toHaveValue("Matías Gamarra");

    // Labels visibles
    expect(screen.getByText("Fecha de nacimiento")).toBeInTheDocument();
    expect(screen.getByText("Sexo")).toBeInTheDocument();
    expect(screen.getByText("Altura (cm)")).toBeInTheDocument();
  });

  it("bloquea 'Siguiente' si faltan campos obligatorios", () => {
    renderOnboarding();

    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));

    // No debe avanzar al paso 2
    expect(screen.getByText(/Paso 1 de 4/)).toBeInTheDocument();
    // Debe mostrar mensaje de error (fecha de nacimiento, porque el nombre ya está)
    expect(
      screen.getByText(/Ingresá tu fecha de nacimiento/),
    ).toBeInTheDocument();
  });

  it("avanza al paso 2 con datos válidos del paso 1", () => {
    const { container } = renderOnboarding();

    // Fecha de nacimiento (el único input type=date)
    const birthDateInput = container.querySelector(
      'input[type="date"]',
    ) as HTMLInputElement;
    fireEvent.change(birthDateInput, { target: { value: "2002-02-18" } });

    // Sexo (el único select)
    const sexSelect = container.querySelector("select") as HTMLSelectElement;
    fireEvent.change(sexSelect, { target: { value: "male" } });

    // Altura (el único input type=number en paso 1)
    const heightInput = screen.getByPlaceholderText("Ej: 178");
    fireEvent.change(heightInput, { target: { value: "170" } });

    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));

    expect(screen.getByText(/Paso 2 de 4/)).toBeInTheDocument();
    expect(
      screen.getByText("¿Cuál es tu objetivo principal?"),
    ).toBeInTheDocument();
  });

  it("botón 'Atrás' deshabilitado en paso 1", () => {
    renderOnboarding();

    const backButton = screen.getByRole("button", { name: "Atrás" });
    expect(backButton).toBeDisabled();
  });

  it("navega al dashboard después de finalizar con datos válidos", async () => {
    mutateAsyncMock.mockResolvedValueOnce(undefined);

    const { container } = renderOnboarding();

    // ── Paso 1 ──
    fireEvent.change(
      container.querySelector('input[type="date"]') as HTMLInputElement,
      { target: { value: "2002-02-18" } },
    );
    fireEvent.change(container.querySelector("select") as HTMLSelectElement, {
      target: { value: "male" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej: 178"), {
      target: { value: "170" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));

    // ── Paso 2: objetivo ──
    fireEvent.click(screen.getByRole("button", { name: "Ganar músculo" }));
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));

    // ── Paso 3: nivel ──
    fireEvent.click(screen.getByRole("button", { name: "Intermedio" }));
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));

    // ── Paso 4: días por semana ──
    fireEvent.change(screen.getByPlaceholderText("1 a 7"), {
      target: { value: "6" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Finalizar" }));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      name: "Matías Gamarra",
      birth_date: "2002-02-18",
      sex: "male",
      height_cm: 170,
      goal: "gain_muscle",
      days_per_week: 6,
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/dashboard", {
        replace: true,
      });
    });
  });
});