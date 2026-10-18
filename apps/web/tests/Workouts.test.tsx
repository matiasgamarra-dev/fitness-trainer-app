import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Workouts from "../src/pages/Workouts.js";
import { useWorkouts } from "../src/hooks/useWorkouts.js";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../src/hooks/useWorkouts.js", () => ({
  useWorkouts: vi.fn(),
}));

const FAKE_WORKOUT_1 = {
  id: "w-1",
  user_id: "u-1",
  routine_id: "r-1",
  routine_name: "Push Day",
  day_of_week: 1,
  started_at: "2026-10-18T10:00:00Z",
  finished_at: "2026-10-18T11:00:00Z",
  notes: null,
  created_at: "2026-10-18T10:00:00Z",
  updated_at: "2026-10-18T11:00:00Z",
};

const FAKE_WORKOUT_2 = {
  ...FAKE_WORKOUT_1,
  id: "w-2",
  routine_name: "Pull Day",
  finished_at: null,
  notes: "Buena sesión",
};

describe("Workouts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockWorkouts(opts: {
    data?: typeof FAKE_WORKOUT_1[];
    isLoading?: boolean;
    isError?: boolean;
  }) {
    (useWorkouts as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: opts.data ?? [],
      isLoading: opts.isLoading ?? false,
      isError: opts.isError ?? false,
    });
  }

  function renderWorkouts() {
    return render(
      <MemoryRouter>
        <Workouts />
      </MemoryRouter>,
    );
  }

  it("renderiza el header con botón '+ Nuevo entrenamiento'", () => {
    mockWorkouts({ data: [] });
    renderWorkouts();

    expect(screen.getByRole("heading", { name: "Entrenamientos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+ Nuevo entrenamiento" })).toBeInTheDocument();
  });

  it("muestra loading state", () => {
    mockWorkouts({ data: [], isLoading: true });
    renderWorkouts();

    expect(screen.getByText("Cargando entrenamientos...")).toBeInTheDocument();
  });

  it("muestra error state", () => {
    mockWorkouts({ data: [], isError: true });
    renderWorkouts();

    expect(screen.getByText("No se pudieron cargar los entrenamientos.")).toBeInTheDocument();
  });

  it("muestra empty state cuando no hay entrenamientos", () => {
    mockWorkouts({ data: [] });
    renderWorkouts();

    expect(screen.getByText("Todavía no tenés entrenamientos.")).toBeInTheDocument();
  });

  it("renderiza cards con nombre, badge de estado y metadata", () => {
    mockWorkouts({ data: [FAKE_WORKOUT_1, FAKE_WORKOUT_2] });
    renderWorkouts();

    expect(screen.getByText("Push Day")).toBeInTheDocument();
    expect(screen.getByText("Pull Day")).toBeInTheDocument();
    expect(screen.getByText("● Activa")).toBeInTheDocument();
    expect(screen.getByText("Finalizada")).toBeInTheDocument();
  });

  it("click en card navega a /workouts/:id", () => {
    mockWorkouts({ data: [FAKE_WORKOUT_1] });
    renderWorkouts();

    const card = screen.getByText("Push Day").closest("button");
    expect(card).toBeTruthy();
    if (card) fireEvent.click(card);

    expect(navigateMock).toHaveBeenCalledWith("/workouts/w-1");
  });

  it("click en '+ Nuevo entrenamiento' navega a /workouts/new", () => {
    mockWorkouts({ data: [] });
    renderWorkouts();

    fireEvent.click(screen.getByRole("button", { name: "+ Nuevo entrenamiento" }));

    expect(navigateMock).toHaveBeenCalledWith("/workouts/new");
  });
});
