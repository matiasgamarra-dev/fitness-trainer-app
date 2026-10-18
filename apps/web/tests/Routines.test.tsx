import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Routines from "../src/pages/Routines.js";
import { useRoutines } from "../src/hooks/useRoutines.js";

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

const FAKE_ROUTINE_1 = {
  id: "routine-1",
  user_id: "user-1",
  name: "Full Body A",
  description: "Rutina de 3 días",
  days_per_week: 3,
  is_active: true,
  created_at: "2026-10-01T00:00:00Z",
  updated_at: "2026-10-01T00:00:00Z",
  exercise_count: 6,
};

const FAKE_ROUTINE_2 = {
  ...FAKE_ROUTINE_1,
  id: "routine-2",
  name: "Push Pull Legs",
  is_active: false,
  exercise_count: 12,
};

describe("Routines", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockRoutines(opts: {
    data?: typeof FAKE_ROUTINE_1[];
    isLoading?: boolean;
    isError?: boolean;
  }) {
    (useRoutines as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: opts.data ?? [],
      isLoading: opts.isLoading ?? false,
      isError: opts.isError ?? false,
    });
  }

  function renderRoutines() {
    return render(
      <MemoryRouter>
        <Routines />
      </MemoryRouter>,
    );
  }

  it("renderiza el header con botón 'Nueva rutina'", () => {
    mockRoutines({ data: [] });
    renderRoutines();

    expect(screen.getByRole("heading", { name: "Rutinas" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+ Nueva rutina" })).toBeInTheDocument();
  });

  it("muestra empty state cuando no hay rutinas", () => {
    mockRoutines({ data: [] });
    renderRoutines();

    expect(screen.getByText("Todavía no tenés rutinas.")).toBeInTheDocument();
  });

  it("muestra loading state", () => {
    mockRoutines({ data: [], isLoading: true });
    renderRoutines();

    expect(screen.getByText("Cargando rutinas...")).toBeInTheDocument();
  });

  it("muestra error state", () => {
    mockRoutines({ data: [], isError: true });
    renderRoutines();

    expect(
      screen.getByText("No se pudieron cargar las rutinas."),
    ).toBeInTheDocument();
  });

  it("renderiza cards con nombre, metadata y badge Activa", () => {
    mockRoutines({ data: [FAKE_ROUTINE_1, FAKE_ROUTINE_2] });
    renderRoutines();

    // Nombres
    expect(screen.getByText("Full Body A")).toBeInTheDocument();
    expect(screen.getByText("Push Pull Legs")).toBeInTheDocument();

    // Badge Activa solo en la primera
    const badges = screen.queryAllByText("Activa");
    expect(badges).toHaveLength(1);

    // Metadata
    expect(screen.getByText("6 ejercicios")).toBeInTheDocument();
    expect(screen.getByText("12 ejercicios")).toBeInTheDocument();
  });

  it("click en card navega a /routines/:id", () => {
    mockRoutines({ data: [FAKE_ROUTINE_1] });
    renderRoutines();

    const card = screen.getByText("Full Body A").closest("button");
    expect(card).toBeTruthy();

    if (card) fireEvent.click(card);

    expect(navigateMock).toHaveBeenCalledWith("/routines/routine-1");
  });

  it("click en '+ Nueva rutina' navega a /routines/new", () => {
    mockRoutines({ data: [] });
    renderRoutines();

    fireEvent.click(screen.getByRole("button", { name: "+ Nueva rutina" }));

    expect(navigateMock).toHaveBeenCalledWith("/routines/new");
  });
});