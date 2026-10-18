import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Measurements from "../src/pages/Measurements.js";
import {
  useMeasurements,
  useCreateMeasurement,
  useDeleteMeasurement,
} from "../src/hooks/useMeasurements.js";

// Mock de ResizeObserver (Recharts lo usa; jsdom no lo tiene)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

vi.mock("../src/hooks/useMeasurements.js", () => ({
  useMeasurements: vi.fn(),
  useCreateMeasurement: vi.fn(),
  useDeleteMeasurement: vi.fn(),
}));

const FAKE_MEASUREMENT_1 = {
  id: "m-1",
  user_id: "user-1",
  date: "2026-09-20",
  weight_kg: 78.5,
  body_fat_pct: 18,
  chest_cm: null,
  waist_cm: null,
  hip_cm: null,
  neck_cm: null,
  arm_cm: null,
  forearm_cm: null,
  thigh_cm: null,
  calf_cm: null,
  shoulder_cm: null,
  notes: null,
  week_start: "2026-09-14",
  week_end: "2026-09-20",
  created_at: "2026-09-20T10:00:00Z",
  updated_at: "2026-09-20T10:00:00Z",
};

const FAKE_MEASUREMENT_2 = {
  ...FAKE_MEASUREMENT_1,
  id: "m-2",
  date: "2026-09-27",
  weight_kg: 78.0,
  body_fat_pct: null,
  week_start: "2026-09-21",
  week_end: "2026-09-27",
};

describe("Measurements", () => {
  const createMutateAsyncMock = vi.fn();
  const deleteMutateMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useCreateMeasurement as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync: createMutateAsyncMock,
      isPending: false,
    });

    (useDeleteMeasurement as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: deleteMutateMock,
      isPending: false,
    });
  });

  function mockMeasurementsList({
    data = [] as typeof FAKE_MEASUREMENT_1[],
    isLoading = false,
    isError = false,
  } = {}) {
    (useMeasurements as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data,
      isLoading,
      isError,
    });
  }

  function renderMeasurements() {
    return render(
      <MemoryRouter>
        <Measurements />
      </MemoryRouter>,
    );
  }

  it("renderiza el formulario vacío cuando no hay medidas", () => {
    mockMeasurementsList({ data: [] });
    renderMeasurements();

    expect(screen.getByText("Medidas")).toBeInTheDocument();
    expect(
      screen.getByText("Todavía no registraste ninguna medida."),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ej: 78.5")).toBeInTheDocument();
  });

  it("muestra una medida en el historial (sin gráfico con 1 sola)", () => {
    mockMeasurementsList({ data: [FAKE_MEASUREMENT_1] });
    renderMeasurements();

    expect(screen.getByText("2026-09-20")).toBeInTheDocument();
    expect(screen.getByText("78.5 kg")).toBeInTheDocument();
    expect(screen.getByText("18%")).toBeInTheDocument();

    // Con solo 1 medida, NO debe aparecer el gráfico
    expect(screen.queryByText("Evolución del peso")).not.toBeInTheDocument();
  });

  it("muestra el gráfico cuando hay 2 o más medidas", () => {
    mockMeasurementsList({
      data: [FAKE_MEASUREMENT_1, FAKE_MEASUREMENT_2],
    });
    renderMeasurements();

    expect(screen.getByText("Evolución del peso")).toBeInTheDocument();
    expect(screen.getByText("Historial (2)")).toBeInTheDocument();
  });

  it("muestra estado de carga", () => {
    mockMeasurementsList({ data: [], isLoading: true });
    renderMeasurements();

    expect(screen.getByText("Cargando…")).toBeInTheDocument();
  });

  it("submit del form llama a createMutation.mutateAsync con payload válido", async () => {
    mockMeasurementsList({ data: [] });
    createMutateAsyncMock.mockResolvedValueOnce(undefined);

    renderMeasurements();

    fireEvent.change(screen.getByPlaceholderText("Ej: 78.5"), {
      target: { value: "80" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Guardar medida" }));

    await waitFor(() => {
      expect(createMutateAsyncMock).toHaveBeenCalledTimes(1);
    });

    const payload = createMutateAsyncMock.mock.calls[0][0];
    expect(payload.weight_kg).toBe(80);
    expect(payload.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // formato YYYY-MM-DD
    expect(payload.week_start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(payload.week_end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("muestra el error 409 cuando ya hay una medida esa semana", async () => {
    mockMeasurementsList({ data: [] });

    // Simular ApiError con status 409
    // Firma real: new ApiError(message, status, options?)
    const { ApiError } = await import("../src/lib/api.js");
    createMutateAsyncMock.mockRejectedValueOnce(
      new ApiError("Conflict", 409),
    );

    renderMeasurements();

    fireEvent.change(screen.getByPlaceholderText("Ej: 78.5"), {
      target: { value: "80" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Guardar medida" }));

    await waitFor(() => {
      expect(
        screen.getByText(/Ya existe una medida registrada esta semana/),
      ).toBeInTheDocument();
    });
  });
});