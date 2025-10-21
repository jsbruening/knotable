import { render, screen } from "@testing-library/react";
import { SizeWarning } from "~/components/ui/size-warning";

describe("SizeWarning Component", () => {
  it("should not render for small content", () => {
    const { container } = render(
      <SizeWarning contentSize={3000} estimatedTime="1 second" />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render medium warning for medium content", () => {
    render(<SizeWarning contentSize={8000} estimatedTime="2-3 seconds" />);

    expect(screen.getByText("Content Size Notice")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Content is moderately sized. Loading may take a few seconds.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("MEDIUM (8,000 characters)")).toBeInTheDocument();
    expect(screen.getByText("2-3 seconds")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Consider breaking this into smaller sections if needed.",
      ),
    ).toBeInTheDocument();
  });

  it("should render large warning for large content", () => {
    render(<SizeWarning contentSize={20000} estimatedTime="5-10 seconds" />);

    expect(screen.getByText("Content Size Notice")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Content is quite large. This may take longer to process and display.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("LARGE (20,000 characters)")).toBeInTheDocument();
    expect(screen.getByText("5-10 seconds")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You may want to regenerate with more focused parameters or break this into multiple campaigns.",
      ),
    ).toBeInTheDocument();
  });

  it("should display correct size categories", () => {
    const { rerender } = render(
      <SizeWarning contentSize={5000} estimatedTime="1-2 seconds" />,
    );

    expect(screen.getByText("MEDIUM (5,000 characters)")).toBeInTheDocument();

    rerender(<SizeWarning contentSize={15000} estimatedTime="3-5 seconds" />);

    expect(screen.getByText("LARGE (15,000 characters)")).toBeInTheDocument();
  });

  it("should format large numbers correctly", () => {
    render(<SizeWarning contentSize={1234567} estimatedTime="10+ seconds" />);

    expect(
      screen.getByText("LARGE (1,234,567 characters)"),
    ).toBeInTheDocument();
  });

  it("should handle missing estimated time", () => {
    render(<SizeWarning contentSize={10000} />);

    expect(screen.getByText("Content Size Notice")).toBeInTheDocument();
    expect(
      screen.queryByText("Estimated Processing Time:"),
    ).not.toBeInTheDocument();
  });

  it("should show appropriate recommendations for each size", () => {
    const { rerender } = render(
      <SizeWarning contentSize={8000} estimatedTime="2-3 seconds" />,
    );

    expect(
      screen.getByText(
        "Consider breaking this into smaller sections if needed.",
      ),
    ).toBeInTheDocument();

    rerender(<SizeWarning contentSize={20000} estimatedTime="5-10 seconds" />);

    expect(
      screen.getByText(
        "You may want to regenerate with more focused parameters or break this into multiple campaigns.",
      ),
    ).toBeInTheDocument();
  });

  it("should have correct color coding for different sizes", () => {
    const { rerender } = render(
      <SizeWarning contentSize={8000} estimatedTime="2-3 seconds" />,
    );

    // Medium should have yellow styling
    const mediumBadge = screen.getByText("MEDIUM (8,000 characters)");
    expect(mediumBadge).toHaveClass("text-yellow-300");

    rerender(<SizeWarning contentSize={20000} estimatedTime="5-10 seconds" />);

    // Large should have red styling
    const largeBadge = screen.getByText("LARGE (20,000 characters)");
    expect(largeBadge).toHaveClass("text-red-300");
  });
});
