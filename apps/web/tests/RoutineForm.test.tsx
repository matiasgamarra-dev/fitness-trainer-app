import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RoutineForm from "../src/pages/RoutineForm.js";
import {
  useRoutine,
  useCreateRoutine,
  useUpdateRoutine,
} from "../src/hooks/useRoutines.js";

const navigateMock = vi.fn();
let paramsMock: { id?: string } = {};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => paramsMock,
  };
});

vi.mock("../src/hooks/useRoutines.js", () => ({
  useRoutine: vi.fn(),
  useCreateRoutine: vi.fn(),
  useUpdateRoutine: vi.fn(),
  useDeleteRoutine: vi.fn(),
  useRoutines: vi.fn(),
}));

vi.mock("../src/components/ExerciseSelector.js", () => ({
  default: ({ onSelect, onClose }: any) => (
    <div data-testid="exercise-selector">
      <button onClick={onClose}>Cerrar</button>
      <button
        onClick={() =>
          onSelect({
            id: "a0000000-0000-4000-8000-000000000001",
            name: "Bench Press",
            muscle_group: "chest",
            equipment: "barbell",
            description: null,
            created_at: "2026-10-01T00:00:00Z",
          })
        }
      >
        Mock Bench Press
      </button>
    </div>
  ),
}));

const FAKE_ROUTINE = {
  id: "routine-1",
  user_id: "user-1",
  name: "Full Body A",
  description: "Rutina existente",
  days_per_week: 2,
  is_active: true,
  created_at: "2026-10-01T00:00:00Z",
  updated_at: "2026-10-01T00:00:00Z",
  exercises: [
    {
      id: "ex-1",
      routine_id: "routine-1",
      exercise_id: "a0000000-0000-4000-8000-000000000001",
      day_of_week: 1,
      order_index: 0,
      sets: 3,
      reps: "8-10",
      rest_seconds: 90,
      notes: null,
      created_at: "2026-10-01T00:00:00Z",
      exercise: {
        id: "a0000000-0000-4000-8000-000000000001",
        name: "Bench Press",
        muscle_group: "chest",
        equipment: "barbell",
      },
    },
  ],
};

describe("RoutineForm", () => {
  const createMutateAsyncMock = vi.fn();
  const updateMutateAsyncMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    paramsMock = {};

    (useRoutine as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    });

    (useCreateRoutine as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync: createMutateAsyncMock,
      isPending: false,
    });

    (useUpdateRoutine as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync: updateMutateAsyncMock,
      isPending: false,
    });
  });

  function renderForm() {
    return render(
      <MemoryRouter>
        <RoutineForm />
      </MemoryRouter>,
    );
  }

  it("modo crear: renderiza form vacÃ­o con dÃ­as = 3", () => {
    renderForm();

    expect(screen.getByRole("heading", { name: "Nueva rutina" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ej: Full Body A")).toHaveValue("");
    expect(screen.getByDisplayValue("3")).toBeInTheDocument();
  });

  it("modo crear: renderiza 3 dÃ­as con botones '+ Agregar ejercicio'", () => {
    renderForm();

    expect(screen.getByText("Lunes")).toBeInTheDocument();
    expect(screen.getByText("Martes")).toBeInTheDocument();
    expect(screen.getByText("Miércoles")).toBeInTheDocument();
    expect(screen.queryByText("Jueves")).not.toBeInTheDocument();

    const addButtons = screen.getAllByText("+ Agregar ejercicio");
    expect(addButtons).toHaveLength(3);
  });

  it("cambiar dÃ­as_per_week actualiza los dÃ­as renderizados", () => {
    renderForm();

    const daysInput = screen.getByDisplayValue("3");
    fireEvent.change(daysInput, { target: { value: "5" } });

    expect(screen.getByText("Jueves")).toBeInTheDocument();
    expect(screen.getByText("Viernes")).toBeInTheDocument();

    const addButtons = screen.getAllByText("+ Agregar ejercicio");
    expect(addButtons).toHaveLength(5);
  });

  it("click en '+ Agregar ejercicio' abre el modal", () => {
    renderForm();

    expect(screen.queryByTestId("exercise-selector")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByText("+ Agregar ejercicio")[0]);

    expect(screen.getByTestId("exercise-selector")).toBeInTheDocument();
  });

  it("seleccionar ejercicio en el modal lo agrega al dÃ­a", () => {
    renderForm();

    fireEvent.click(screen.getAllByText("+ Agregar ejercicio")[0]);
    fireEvent.click(screen.getByText("Mock Bench Press"));

    expect(screen.queryByTestId("exercise-selector")).not.toBeInTheDocument();
    expect(screen.getByText("Bench Press")).toBeInTheDocument();
  });

  it("quitar ejercicio lo remueve de la lista", () => {
    renderForm();

    fireEvent.click(screen.getAllByText("+ Agregar ejercicio")[0]);
    fireEvent.click(screen.getByText("Mock Bench Press"));

    expect(screen.getByText("Bench Press")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Quitar"));

    expect(screen.queryByText("Bench Press")).not.toBeInTheDocument();
  });

  it("modo crear: submit sin nombre no llama mutateAsync", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Crear rutina" }));

    // Esperar un tick para que handleSubmit corra
    await new Promise((r) => setTimeout(r, 100));

    // El mutation NO debe llamarse (form invalido)
    expect(createMutateAsyncMock).not.toHaveBeenCalled();
  });

  it("modo crear: submit con nombre y ejercicios llama mutateAsync", async () => {
    createMutateAsyncMock.mockResolvedValueOnce({ id: "new-routine-id" });

    renderForm();

    fireEvent.change(screen.getByPlaceholderText("Ej: Full Body A"), {
      target: { value: "Mi Nueva Rutina" },
    });

    fireEvent.click(screen.getAllByText("+ Agregar ejercicio")[0]);
    fireEvent.click(screen.getByText("Mock Bench Press"));

    fireEvent.click(screen.getByRole("button", { name: "Crear rutina" }));

    await new Promise((r) => setTimeout(r, 100));
    const errorEl = document.querySelector("p.rounded.border.border-red-500");
    if (errorEl) {
      console.log("Zod error:", errorEl.textContent);
    }
    await waitFor(() => {
      expect(createMutateAsyncMock).toHaveBeenCalled();
    });

    const payload = createMutateAsyncMock.mock.calls[0][0];
    expect(payload.name).toBe("Mi Nueva Rutina");
    expect(payload.days_per_week).toBe(3);
    expect(payload.exercises).toHaveLength(1);
    expect(payload.exercises[0].exercise_id).toBe("a0000000-0000-4000-8000-000000000001");

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/routines/new-routine-id", {
        replace: true,
      });
    });
  });

  it("modo editar: precarga los datos de la rutina", () => {
    paramsMock = { id: "routine-1" };
    (useRoutine as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: FAKE_ROUTINE,
      isLoading: false,
      isError: false,
    });

    renderForm();

    expect(screen.getByRole("heading", { name: "Editar rutina" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Full Body A")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Rutina existente")).toBeInTheDocument();
    expect(screen.getByText("Bench Press")).toBeInTheDocument();
  });

  it("modo editar: submit llama updateMutation", async () => {
    paramsMock = { id: "routine-1" };
    (useRoutine as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: FAKE_ROUTINE,
      isLoading: false,
      isError: false,
    });
    updateMutateAsyncMock.mockResolvedValueOnce(undefined);

    renderForm();

    fireEvent.change(screen.getByDisplayValue("Full Body A"), {
      target: { value: "Rutina Editada" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => {
      expect(updateMutateAsyncMock).toHaveBeenCalled();
    });

    expect(updateMutateAsyncMock.mock.calls[0][0].id).toBe("routine-1");
    expect(updateMutateAsyncMock.mock.calls[0][0].input.name).toBe("Rutina Editada");

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/routines/routine-1", {
        replace: true,
      });
    });
  });

  it("click en 'Cancelar' en modo crear navega a /routines", () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(navigateMock).toHaveBeenCalledWith("/routines");
  });

  it("click en 'Cancelar' en modo editar navega a /routines/:id", () => {
    paramsMock = { id: "routine-1" };
    (useRoutine as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: FAKE_ROUTINE,
      isLoading: false,
      isError: false,
    });

    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(navigateMock).toHaveBeenCalledWith("/routines/routine-1");
  });
});