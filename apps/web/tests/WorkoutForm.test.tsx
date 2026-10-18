import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import WorkoutForm from "../src/pages/WorkoutForm.js";
import { useRoutines } from "../src/hooks/useRoutines.js";
import { useStartWorkout } from "../src/hooks/useWorkouts.js";
import { ApiError } from "../src/lib/api.js";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../src/hooks/useRoutines.js", () => ({
  useRoutines: vi.fn(),
}));

vi.mock("../src/hooks/useWorkouts.js", () => ({
  useStartWorkout: vi.fn(),
}));

const FAKE_ROUTINE = {
  id: "r-1",
  user_id: "u-1",
  name: "Push Day",
  description: null,
  days_per_week: 3,
  is_active: true,
  created_at: "2026-10-01T00:00:00Z",
  updated_at: "2026-10-01T00:00:00Z",
  exercise_count: 6,
};

describe("WorkoutForm", () => {
  const mutateAsyncMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRoutines as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [FAKE_ROUTINE],
      isLoading: false,
      isError: false,
    });
    (useStartWorkout as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    });
  });

  function renderForm() {
    return render(
      <MemoryRouter>
        <WorkoutForm />
      </MemoryRouter>,
    );
  }

  it("renderiza el header y el select de rutina", () => {
    renderForm();

    expect(screen.getByRole("heading", { name: "Nuevo entrenamiento" })).toBeInTheDocument();
    expect(screen.getByLabelText("Rutina")).toBeInTheDocument();
  });

  it("muestra la opción 'Entrenamiento libre' por defecto", () => {
    renderForm();

    const routineSelect = screen.getByLabelText("Rutina") as HTMLSelectElement;
    expect(routineSelect.value).toBe("__free__");
  });

  it("muestra las rutinas en el select", () => {
    renderForm();

    expect(screen.getByRole("option", { name: /Push Day/ })).toBeInTheDocument();
  });

  it("permite seleccionar una rutina y enviar", async () => {
    mutateAsyncMock.mockResolvedValue({ id: "w-new" });
    renderForm();

    fireEvent.change(screen.getByLabelText("Rutina"), { target: { value: "r-1" } });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar entrenamiento" }));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith(
        expect.objectContaining({
          routine_id: "r-1",
          routine_name: "Push Day",
        }),
      );
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/workouts/w-new");
    });
  });

  it("envía routine_id null si elige 'Entrenamiento libre'", async () => {
    mutateAsyncMock.mockResolvedValue({ id: "w-new" });
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Iniciar entrenamiento" }));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith(
        expect.objectContaining({
          routine_id: null,
          routine_name: "Entrenamiento libre",
        }),
      );
    });
  });

  it("muestra el error y botón 'Ir a la sesión activa' en 409", async () => {
    const apiError = new ApiError("Ya hay una sesión activa", 409, {
      details: { active_session_id: "w-existing" },
    });
    mutateAsyncMock.mockRejectedValue(apiError);
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Iniciar entrenamiento" }));

    await waitFor(() => {
      expect(screen.getByText("Ya hay una sesión activa")).toBeInTheDocument();
    });

    const goToActiveBtn = screen.getByRole("button", { name: /Ir a la sesión activa/ });
    fireEvent.click(goToActiveBtn);

    expect(navigateMock).toHaveBeenCalledWith("/workouts/w-existing");
  });

  it("click en 'Cancelar' navega a /workouts", () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(navigateMock).toHaveBeenCalledWith("/workouts");
  });
});
