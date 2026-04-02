// @ts-nocheck

import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("button renderred and text visible", () => {
    render(<Button>Kaydet</Button>);

    expect(screen.getByText("Kaydet")).toBeInTheDocument();
  });

  it("clicking the button calls the onClick handler", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Tıkla</Button>);

    fireEvent.click(screen.getByText("Tıkla"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("cannot click button when disabled", () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        Tıkla
      </Button>
    );

    fireEvent.click(screen.getByText("Tıkla"));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("button is disabled when loading", () => {
    render(<Button isLoading>Kaydet</Button>);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("different variants have the correct classes", () => {
    const { rerender } = render(<Button variant="primary">Test</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-green-700");

    rerender(<Button variant="danger">Test</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-red-600");
  });
});
