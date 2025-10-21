import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PromptEditorModal } from "~/components/ui/prompt-editor-modal";

const mockProps = {
  isOpen: true,
  onClose: jest.fn(),
  prompt: "Test prompt for AI generation",
  onSave: jest.fn(),
  onGenerate: jest.fn(),
  isGenerating: false,
};

describe("PromptEditorModal Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render when open", () => {
    render(<PromptEditorModal {...mockProps} />);

    expect(screen.getByText("Edit AI Prompt")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Review and customize the prompt that will be sent to the AI.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Test prompt for AI generation"),
    ).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    render(<PromptEditorModal {...mockProps} isOpen={false} />);

    expect(screen.queryByText("Edit AI Prompt")).not.toBeInTheDocument();
  });

  it("should display prompt statistics", () => {
    render(<PromptEditorModal {...mockProps} />);

    expect(screen.getByText("Prompt Statistics:")).toBeInTheDocument();
    expect(screen.getByText("4 words")).toBeInTheDocument();
    expect(screen.getByText("30 characters")).toBeInTheDocument();
    expect(screen.getByText("1 lines")).toBeInTheDocument();
  });

  it("should update statistics when prompt changes", async () => {
    const user = userEvent.setup();
    render(<PromptEditorModal {...mockProps} />);

    const textarea = screen.getByDisplayValue("Test prompt for AI generation");
    await user.clear(textarea);
    await user.type(
      textarea,
      "This is a much longer prompt with more words and characters",
    );

    expect(screen.getByText("11 words")).toBeInTheDocument();
    expect(screen.getByText("67 characters")).toBeInTheDocument();
  });

  it("should show tips section", () => {
    render(<PromptEditorModal {...mockProps} />);

    expect(screen.getByText("Prompt Tips")).toBeInTheDocument();
    expect(screen.getByText("For Better Results:")).toBeInTheDocument();
    expect(screen.getByText("Avoid:")).toBeInTheDocument();
    expect(
      screen.getByText("• Be specific about learning objectives"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("• Vague or unclear instructions"),
    ).toBeInTheDocument();
  });

  it("should handle prompt editing", async () => {
    const user = userEvent.setup();
    render(<PromptEditorModal {...mockProps} />);

    const textarea = screen.getByDisplayValue("Test prompt for AI generation");
    await user.clear(textarea);
    await user.type(textarea, "Edited prompt");

    expect(screen.getByText("You have unsaved changes")).toBeInTheDocument();
  });

  it("should call onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<PromptEditorModal {...mockProps} />);

    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onSave when save button is clicked", async () => {
    const user = userEvent.setup();
    render(<PromptEditorModal {...mockProps} />);

    const textarea = screen.getByDisplayValue("Test prompt for AI generation");
    await user.clear(textarea);
    await user.type(textarea, "Edited prompt");

    const saveButton = screen.getByText("Save Changes");
    await user.click(saveButton);

    expect(mockProps.onSave).toHaveBeenCalledWith("Edited prompt");
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onGenerate when generate button is clicked", async () => {
    const user = userEvent.setup();
    render(<PromptEditorModal {...mockProps} />);

    const generateButton = screen.getByText("Generate Content");
    await user.click(generateButton);

    expect(mockProps.onGenerate).toHaveBeenCalledWith(
      "Test prompt for AI generation",
    );
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("should reset prompt when reset button is clicked", async () => {
    const user = userEvent.setup();
    render(<PromptEditorModal {...mockProps} />);

    const textarea = screen.getByDisplayValue("Test prompt for AI generation");
    await user.clear(textarea);
    await user.type(textarea, "Edited prompt");

    const resetButton = screen.getByText("Reset");
    await user.click(resetButton);

    expect(textarea).toHaveValue("Test prompt for AI generation");
    expect(
      screen.queryByText("You have unsaved changes"),
    ).not.toBeInTheDocument();
  });

  it("should disable buttons when generating", () => {
    render(<PromptEditorModal {...mockProps} isGenerating={true} />);

    expect(screen.getByText("Generating...")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeDisabled();
    expect(screen.getByText("Generate Content")).toBeDisabled();
  });

  it("should not show save button when no changes", () => {
    render(<PromptEditorModal {...mockProps} />);

    expect(screen.queryByText("Save Changes")).not.toBeInTheDocument();
    expect(screen.getByText("No changes made")).toBeInTheDocument();
  });

  it("should handle multiline prompts correctly", () => {
    const multilinePrompt = `This is a multiline prompt
    with multiple lines
    for testing purposes`;

    render(<PromptEditorModal {...mockProps} prompt={multilinePrompt} />);

    expect(screen.getByText("3 lines")).toBeInTheDocument();
    expect(screen.getByDisplayValue(multilinePrompt)).toBeInTheDocument();
  });

  it("should format large numbers correctly in statistics", () => {
    const longPrompt = "word ".repeat(1000);

    render(<PromptEditorModal {...mockProps} prompt={longPrompt} />);

    expect(screen.getByText("1,000 words")).toBeInTheDocument();
  });
});
