import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Profile from "../src/pages/Profile.js";
import { useProfile, useUpdateProfile } from "../src/hooks/useProfile.js";

vi.mock("../src/hooks/useProfile.js", () => ({
  useProfile: vi.fn(),
  useUpdateProfile: vi.fn(),
}));

const FAKE_PROFILE = {
  id: "user-1",
  email: "test@example.com",
  name: "Matías Gamarra",
  birth_date: "2002-02-18",
  sex: "male" as const,
  height_cm: 170,
  goal: "gain_muscle" as const,
  days_per_week: 6,
  created_at: "2026-09-30T00:00:00Z",
  updated_at: "2026-09-30T00:00:00Z",
};

describe("Profile", () => {
  const mutateAsyncMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useProfile as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: FAKE_PROFILE,
      isLoading: false,
      isError: false,
    });

    (useUpdateProfile as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    });
  });

  it("renderiza los datos del perfil", () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>,
    );

    // Email
    expect(screen.getByText("test@example.com")).toBeInTheDocument();

    // Nombre editable (input)
    expect(screen.getByPlaceholderText("Tu nombre")).toHaveValue(
      "Matías Gamarra",
    );

    // Campos read-only con etiquetas traducidas
    expect(screen.getByText("Masculino")).toBeInTheDocument();
    expect(screen.getByText("170 cm")).toBeInTheDocument();
    expect(screen.getByText("Ganar músculo")).toBeInTheDocument();
    expect(screen.getByText("6 días")).toBeInTheDocument();
    expect(screen.getByText("2002-02-18")).toBeInTheDocument();
  });

  it("deshabilita 'Guardar cambios' hasta que el nombre cambie", () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>,
    );

    const saveButton = screen.getByRole("button", {
      name: "Guardar cambios",
    });
    expect(saveButton).toBeDisabled();

    const nameInput = screen.getByPlaceholderText("Tu nombre");
    fireEvent.change(nameInput, { target: { value: "Nuevo Nombre" } });

    expect(saveButton).not.toBeDisabled();
  });

  it("llama a updateProfile.mutateAsync con el nombre cambiado", async () => {
    mutateAsyncMock.mockResolvedValueOnce(undefined);

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>,
    );

    const nameInput = screen.getByPlaceholderText("Tu nombre");
    fireEvent.change(nameInput, { target: { value: "Nuevo Nombre" } });

    const saveButton = screen.getByRole("button", {
      name: "Guardar cambios",
    });
    fireEvent.click(saveButton);

    // esperar microtask
    await Promise.resolve();

    expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
    expect(mutateAsyncMock).toHaveBeenCalledWith({ name: "Nuevo Nombre" });
  });

  it("muestra estado de carga cuando isLoading es true", () => {
    (useProfile as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>,
    );

    expect(screen.getByText("Cargando perfil…")).toBeInTheDocument();
  });
});