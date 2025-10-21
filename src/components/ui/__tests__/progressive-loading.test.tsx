import { render, screen } from "@testing-library/react";
import { ProgressiveLoading } from "~/components/ui/progressive-loading";

describe("ProgressiveLoading Component", () => {
  it("should render with idle stage", () => {
    render(
      <ProgressiveLoading
        stage="idle"
        message="Ready to generate content"
        progress={0}
      />,
    );

    expect(screen.getByText("AI Content Generation")).toBeInTheDocument();
    expect(screen.getByText("Ready to generate content")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("should render with building-prompt stage", () => {
    render(
      <ProgressiveLoading
        stage="building-prompt"
        message="Building AI prompt with your parameters..."
        progress={20}
      />,
    );

    expect(screen.getByText("AI Content Generation")).toBeInTheDocument();
    expect(
      screen.getByText("Building AI prompt with your parameters..."),
    ).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
    expect(screen.getByText("Building Prompt")).toBeInTheDocument();
  });

  it("should render with calling-ai stage", () => {
    render(
      <ProgressiveLoading
        stage="calling-ai"
        message="Sending request to Gemini AI..."
        progress={40}
      />,
    );

    expect(screen.getByText("AI Content Generation")).toBeInTheDocument();
    expect(
      screen.getByText("Sending request to Gemini AI..."),
    ).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getByText("Calling AI")).toBeInTheDocument();
  });

  it("should render with parsing-response stage", () => {
    render(
      <ProgressiveLoading
        stage="parsing-response"
        message="Processing AI response and formatting content..."
        progress={80}
      />,
    );

    expect(screen.getByText("AI Content Generation")).toBeInTheDocument();
    expect(
      screen.getByText("Processing AI response and formatting content..."),
    ).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText("Parsing Response")).toBeInTheDocument();
  });

  it("should render with complete stage", () => {
    render(
      <ProgressiveLoading
        stage="complete"
        message="Content generated successfully!"
        progress={100}
      />,
    );

    expect(screen.getByText("AI Content Generation")).toBeInTheDocument();
    expect(
      screen.getByText("Content generated successfully!"),
    ).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("Complete")).toBeInTheDocument();
  });

  it("should show all stage indicators", () => {
    render(
      <ProgressiveLoading
        stage="calling-ai"
        message="Sending request to Gemini AI..."
        progress={40}
      />,
    );

    expect(screen.getByText("Building Prompt")).toBeInTheDocument();
    expect(screen.getByText("Calling AI")).toBeInTheDocument();
    expect(screen.getByText("Parsing Response")).toBeInTheDocument();
    expect(screen.getByText("Complete")).toBeInTheDocument();
  });

  it("should display progress bar", () => {
    render(
      <ProgressiveLoading
        stage="calling-ai"
        message="Sending request to Gemini AI..."
        progress={40}
      />,
    );

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
  });

  it("should handle different progress values", () => {
    const { rerender } = render(
      <ProgressiveLoading
        stage="calling-ai"
        message="Sending request to Gemini AI..."
        progress={25}
      />,
    );

    expect(screen.getByText("25%")).toBeInTheDocument();

    rerender(
      <ProgressiveLoading
        stage="calling-ai"
        message="Sending request to Gemini AI..."
        progress={75}
      />,
    );

    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("should handle empty message", () => {
    render(<ProgressiveLoading stage="idle" message="" progress={0} />);

    expect(
      screen.getByText("Generating your learning campaign content..."),
    ).toBeInTheDocument();
  });
});
