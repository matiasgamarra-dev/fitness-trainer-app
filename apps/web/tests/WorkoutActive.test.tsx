import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import WorkoutActive from "../src/pages/WorkoutActive.js";
import { useWorkout, useUpdateWorkout, useDeleteWorkout } from "../src/hooks/useWorkouts.js";
import { useDeleteSet, useLogSet } from "../src/hooks/useWorkoutSets.js";
import { useExercises } from "../src/hooks/useExercises.js";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../src/hooks/useWorkouts.js", () => ({
  useWorkout: vi.fn(),
  useUpdateWorkout: vi.fn(),
  useDeleteWorkout: vi.fn(),
}));

vi.mock("../src/hooks/useWorkoutSets.js", () => ({
  useDeleteSet: vi.fn(),
  useLogSet: vi.fn(),
}));

vi.mock("../src/hooks/useExercises.js", () => ({
  useExercises: vi.fn(),
}));

const FAKE_EXERCISE = {
  id: "ex-1",
  name: "Press banca",
  muscle_group: "chest",
  equipment: "barbell",
  description: null,
  created_at: "2026-10-01T00:00:00Z",
};

const FAKE_SESSION_ACTIVE = {
  id: "w-1",
  user_id: "u-1",
  routine_id: "r-1",
  routine_name: "Push Day",
  day_of_week: 1,
  started_at: "2026-10-18T10:00:00Z",
  finished_at: null,
  notes: null,
  created_at: "2026-10-18T10:00:00Z",
  updated_at: "2026-10-18T10:00:00Z",
  sets: [],
};

const FAKE_SESSION_FINISHED = {
  ...FAKE_SESSION_ACTIVE,
  finished_at: "2026-10-18T11:00:00Z",
};

const FAKE_SET = {
  id: "set-1",
  session_id: "w-1",
  exercise_id: "ex-1",
  set_number: 1,
  weight_kg: 80,
  reps: 10,
  rpe: 8,
  is_warmup: false,
  completed_at: "2026-10-18T10:15:00Z",
  notes: null,
  exercise: FAKE_EXERCISE,
};

describe("WorkoutActive", () => {
  const mutateAsyncUpdate = vi.fn();
  const mutateAsyncDeleteW = vi.fn();
  const mutateAsyncDeleteSet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUpdateWorkout as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync: mutateAsyncUpdate,
      isPending: false,
    });
    (useDeleteWorkout as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync: mutateAsyncDeleteW,
      isPending: false,
    });
    (useDeleteSet as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync: mutateAsyncDeleteSet,
      isPending: false,
    });
    (useLogSet as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    (useExercises as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [FAKE_EXERCISE],
      isLoading: false,
      isError: false,
    });
  });

  function mockWorkout(opts: {
    data?: typeof FAKE_SESSION_ACTIVE | null;
    isLoading?: boolean;
    isError?: boolean;
  }) {
    (useWorkout as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: opts.data ?? null,
      isLoading: opts.isLoading ?? false,
      isError: opts.isError ?? false,
    });
  }

  function renderActive() {
    return render(
      <MemoryRouter initialEntries={["/workouts/w-1"]}>
        <Routes>
          <Route path="/workouts/:id" element={<WorkoutActive />} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it("muestra loading state", () => {
    mockWorkout({ data: null, isLoading: true });
    renderActive();

    expect(screen.getByText("Cargando sesión...")).toBeInTheDocument();
  });

  it("muestra error state", () => {
    mockWorkout({ data: null, isError: true });
    renderActive();

    expect(screen.getByText("No se pudo cargar la sesión.")).toBeInTheDocument();
  });

  it("muestra 'Sesión no encontrada' si data es null sin error", () => {
    mockWorkout({ data: null });
    renderActive();

    expect(screen.getByText("Sesión no encontrada.")).toBeInTheDocument();
  });

  it("muestra el nombre de la rutina y el día", () => {
    mockWorkout({ data: FAKE_SESSION_ACTIVE });
    renderActive();

    expect(screen.getByRole("heading", { name: "Push Day" })).toBeInTheDocument();
    expect(screen.getByText(/Lunes/)).toBeInTheDocument();
  });

  it("muestra 'Finalizar entrenamiento' si la sesión está activa", () => {
    mockWorkout({ data: FAKE_SESSION_ACTIVE });
    renderActive();

    expect(screen.getByRole("button", { name: "Finalizar entrenamiento" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Agregar serie" })).toBeInTheDocument();
  });

  it("NO muestra 'Finalizar' ni 'Agregar serie' si está finalizada", () => {
    mockWorkout({ data: FAKE_SESSION_FINISHED });
    renderActive();

    expect(screen.queryByRole("button", { name: "Finalizar entrenamiento" })).not.toBeInTheDocument();
    expect(screen.queryByText("Agregar serie")).not.toBeInTheDocument();
    expect(screen.getByText("Finalizada")).toBeInTheDocument();
  });

  it("muestra empty state si no hay series", () => {
    mockWorkout({ data: FAKE_SESSION_ACTIVE });
    renderActive();

    expect(screen.getByText("Todavía no registraste series.")).toBeInTheDocument();
  });

  it("muestra series agrupadas por ejercicio", () => {
    mockWorkout({
      data: { ...FAKE_SESSION_ACTIVE, sets: [FAKE_SET] },
    });
    renderActive();

    expect(screen.getByRole("heading", { name: /Press banca/ })).toBeInTheDocument();
    expect(
      screen.getByText((_, el) => (el?.tagName === "SPAN" && (el?.textContent?.includes("Serie 1: 80 kg × 10") ?? false))),
    ).toBeInTheDocument();
  });

  it("click en 'Finalizar entrenamiento' llama a useUpdateWorkout", async () => {
    mutateAsyncUpdate.mockResolvedValue({});
    mockWorkout({ data: FAKE_SESSION_ACTIVE });
    renderActive();

    fireEvent.click(screen.getByRole("button", { name: "Finalizar entrenamiento" }));

    expect(mutateAsyncUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "w-1",
        input: expect.objectContaining({ finished_at: expect.any(String) }),
      }),
    );
  });

  it("click en 'Eliminar sesión' pide confirmación y luego navega", async () => {
    mutateAsyncDeleteW.mockResolvedValue(undefined);
    mockWorkout({ data: FAKE_SESSION_ACTIVE });
    renderActive();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar sesión" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar eliminar" }));

    expect(mutateAsyncDeleteW).toHaveBeenCalledWith("w-1");
  });

  it("click en 'Eliminar' de una serie llama a useDeleteSet", async () => {
    mutateAsyncDeleteSet.mockResolvedValue(undefined);
    mockWorkout({
      data: { ...FAKE_SESSION_ACTIVE, sets: [FAKE_SET] },
    });
    renderActive();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(mutateAsyncDeleteSet).toHaveBeenCalledWith("set-1");
  });
});
