import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RoutineDetail from "../src/pages/RoutineDetail.js";
import {
  useRoutine,
  useDeleteRoutine,
} from "../src/hooks/useRoutines.js";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ id: "routine-1" }),
  };
});

vi.mock("../src/hooks/useRoutines.js", () => ({
  useRoutine: vi.fn(),
  useDeleteRoutine: vi.fn(),
  useCreateRoutine: vi.fn(),
  useUpdateRoutine: vi.fn(),
  useRoutines: vi.fn(),
}));

const FAKE_ROUTINE = {
  id: "routine-1",
  user_id: "user-1",
  name: "Full Body A",
  description: "Rutina de 3 días",
  days_per_week: 3,
  is_active: true,
  created_at: "2026-10-01T00:00:00Z",
  updated_at: "2026-10-01T00:00:00Z",
  exercises: [
    {
      id: "ex-1",
      routine_id: "routine-1",
      exercise_id: "bench-id",
      day_of_week: 1,
      order_index: 0,
      sets: 3,
      reps: "8-10",
      rest_seconds: 90,
      notes: null,
      created_at: "2026-10-01T00:00:00Z",
      exercise: {
        id: "bench-id",
        name: "Bench Press",
        muscle_group: "chest",
        equipment: "barbell",
      },
    },
    {
      id: "ex-2",
      routine_id: "routine-1",
      exercise_id: "squat-id",
      day_of_week: 1,
      order_index: 1,
      sets: 4,
      reps: "8",
      rest_seconds: 120,
      notes: null,
      created_at: "2026-10-01T00:00:00Z",
      exercise: {
        id: "squat-id",
        name: "Squat",
        muscle_group: "legs",
        equipment: "barbell",
      },
    },
    {
      id: "ex-3",
      routine_id: "routine-1",
      exercise_id: "deadlift-id",
      day_of_week: 3,
      order_index: 0,
      sets: 3,
      reps: "5",
      rest_seconds: 180,
      notes: null,
      created_at: "2026-10-01T00:00:00Z",
      exercise: {
        id: "deadlift-id",
        name: "Deadlift",
        muscle_group: "back",
        equipment: "barbell",
      },
    },
  ],
};

describe("RoutineDetail", () => {
  const deleteMutateAsyncMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useDeleteRoutine as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync: deleteMutateAsyncMock,
      isPending: false,
    });
  });

  function mockRoutine(opts: {
    data?: typeof FAKE_ROUTINE | null;
    isLoading?: boolean;
    isError?: boolean;
  }) {
    (useRoutine as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: opts.data ?? null,
      isLoading: opts.isLoading ?? false,
      isError: opts.isError ?? false,
    });
  }

  function renderDetail() {
    return render(
      <MemoryRouter initialEntries={["/routines/routine-1"]}>
        <Routes>
          <Route path="/routines/:id" element={<RoutineDetail />} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it("muestra loading state", () => {
    mockRoutine({ data: null, isLoading: true });
    renderDetail();

    expect(screen.getByText("Cargando rutina...")).toBeInTheDocument();
  });

  it("muestra error state", () => {
    mockRoutine({ data: null, isError: true });
    renderDetail();

    expect(screen.getByText("No se pudo cargar la rutina.")).toBeInTheDocument();
  });

  it("renderiza nombre, metadata y badge Activa", () => {
    mockRoutine({ data: FAKE_ROUTINE });
    renderDetail();

    expect(screen.getByRole("heading", { name: "Full Body A" })).toBeInTheDocument();
    expect(screen.getByText("Activa")).toBeInTheDocument();
    expect(screen.getByText(/3 días\/semana/)).toBeInTheDocument();
    expect(screen.getByText("Rutina de 3 días")).toBeInTheDocument();
  });

  it("agrupa ejercicios por dÃ­a (Lunes, Miércoles)", () => {
    mockRoutine({ data: FAKE_ROUTINE });
    renderDetail();

    // Encabezados de dÃ­a
    expect(screen.getByText("Lunes")).toBeInTheDocument();
    expect(screen.getByText("Miércoles")).toBeInTheDocument();

    // Ejercicios del Lunes
    expect(screen.getByText("Bench Press")).toBeInTheDocument();
    expect(screen.getByText("Squat")).toBeInTheDocument();

    // Ejercicio del Miércoles
    expect(screen.getByText("Deadlift")).toBeInTheDocument();
  });

  it("muestra sets, reps y rest de cada ejercicio", () => {
    mockRoutine({ data: FAKE_ROUTINE });
    renderDetail();

    // "3 series" aparece 2 veces (Bench Press y Deadlift)
    expect(screen.getAllByText("3 series")).toHaveLength(2);

    // "8-10 reps" solo en Bench Press
    expect(screen.getByText("8-10 reps")).toBeInTheDocument();
    expect(screen.getByText("90s descanso")).toBeInTheDocument();

    // "4 series" solo en Squat
    expect(screen.getByText("4 series")).toBeInTheDocument();
    expect(screen.getByText("120s descanso")).toBeInTheDocument();

    // Deadlift
    expect(screen.getByText("5 reps")).toBeInTheDocument();
    expect(screen.getByText("180s descanso")).toBeInTheDocument();
  });

  it("empty state si la rutina no tiene ejercicios", () => {
    mockRoutine({
      data: { ...FAKE_ROUTINE, exercises: [] },
    });
    renderDetail();

    expect(
      screen.getByText("Esta rutina no tiene ejercicios todavía."),
    ).toBeInTheDocument();
  });

  it("click en 'Volver a rutinas' navega a /routines", () => {
    mockRoutine({ data: FAKE_ROUTINE });
    renderDetail();

    fireEvent.click(screen.getByText(/Volver a rutinas/));

    expect(navigateMock).toHaveBeenCalledWith("/routines");
  });

  it("click en 'Editar' navega a /routines/:id/edit", () => {
    mockRoutine({ data: FAKE_ROUTINE });
    renderDetail();

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));

    expect(navigateMock).toHaveBeenCalledWith("/routines/routine-1/edit");
  });

  it("click en 'Eliminar' pide confirm y llama al mutation", async () => {
    mockRoutine({ data: FAKE_ROUTINE });
    deleteMutateAsyncMock.mockResolvedValueOnce(undefined);
    vi.spyOn(window, "confirm").mockReturnValueOnce(true);

    renderDetail();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(window.confirm).toHaveBeenCalled();

    await new Promise((r) => setTimeout(r, 0));

    expect(deleteMutateAsyncMock).toHaveBeenCalledWith("routine-1");
  });

  it("NO elimina si el user cancela el confirm", async () => {
    mockRoutine({ data: FAKE_ROUTINE });
    vi.spyOn(window, "confirm").mockReturnValueOnce(false);

    renderDetail();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(deleteMutateAsyncMock).not.toHaveBeenCalled();
  });
});