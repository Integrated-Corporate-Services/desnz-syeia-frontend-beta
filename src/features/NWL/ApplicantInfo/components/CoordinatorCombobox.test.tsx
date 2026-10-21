import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CoordinatorCombobox, { type CoordinatorOption } from "./CoordinatorCombobox";

const options: CoordinatorOption[] = [
  { id: "coordinator-1", label: "Alex Smith", value: "Alex Smith" },
  {
    id: "coordinator-2",
    label: "A coordinator name that is intentionally long to test narrow reflow",
    value: "A coordinator name that is intentionally long to test narrow reflow",
  },
];

const renderCombobox = (onChange = vi.fn()) =>
  render(
    <>
      <label id="location-label" htmlFor="location">
        Applicant contact name
      </label>
      <CoordinatorCombobox
        id="location"
        labelId="location-label"
        describedBy="location-hint"
        value="Alex Smith"
        options={options}
        onChange={onChange}
        error={false}
      />
    </>,
  );

describe("CoordinatorCombobox", () => {
  it("shows all options in a bounded listbox when opened", () => {
    renderCombobox();

    const combobox = screen.getByRole("combobox", {
      name: "Applicant contact name Alex Smith",
    });
    expect(combobox).toHaveTextContent("Alex Smith");
    fireEvent.click(combobox);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: options[1].label })).toBeInTheDocument();
  });

  it("selects the active option with the keyboard", () => {
    const onChange = vi.fn();
    renderCombobox(onChange);
    const combobox = screen.getByRole("combobox", {
      name: "Applicant contact name Alex Smith",
    });

    fireEvent.keyDown(combobox, { key: "ArrowDown" });
    fireEvent.keyDown(combobox, { key: "ArrowDown" });
    fireEvent.keyDown(combobox, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith(options[1].value);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opens on a type-ahead match and closes with Escape", () => {
    renderCombobox();
    const combobox = screen.getByRole("combobox", {
      name: "Applicant contact name Alex Smith",
    });

    fireEvent.keyDown(combobox, { key: "A" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(combobox).toHaveAttribute("aria-activedescendant");
    fireEvent.keyDown(combobox, { key: "Escape" });

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});