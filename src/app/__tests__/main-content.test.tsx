import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MainContent } from "@/app/main-content";

vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useFileSystem: vi.fn(),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div>ChatInterface</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">PreviewFrame</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div>FileTree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">CodeEditor</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div>HeaderActions</div>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Radix UI Tabs fires onValueChange on mousedown, not click
function clickTab(tab: HTMLElement) {
  fireEvent.mouseDown(tab, { button: 0, ctrlKey: false });
}

test("renders Preview tab as active by default", () => {
  render(<MainContent />);

  const previewTrigger = screen.getByRole("tab", { name: "Preview" });
  expect(previewTrigger.getAttribute("data-state")).toBe("active");

  const codeTrigger = screen.getByRole("tab", { name: "Code" });
  expect(codeTrigger.getAttribute("data-state")).toBe("inactive");
});

test("shows preview content by default", () => {
  render(<MainContent />);

  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("clicking Code tab switches to code view", () => {
  render(<MainContent />);

  clickTab(screen.getByRole("tab", { name: "Code" }));

  expect(screen.getByTestId("code-editor")).toBeDefined();
  expect(screen.queryByTestId("preview-frame")).toBeNull();
});

test("clicking Preview tab after Code switches back to preview", () => {
  render(<MainContent />);

  clickTab(screen.getByRole("tab", { name: "Code" }));
  expect(screen.getByTestId("code-editor")).toBeDefined();

  clickTab(screen.getByRole("tab", { name: "Preview" }));
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("Code tab becomes active after clicking it", () => {
  render(<MainContent />);

  clickTab(screen.getByRole("tab", { name: "Code" }));

  const codeTrigger = screen.getByRole("tab", { name: "Code" });
  expect(codeTrigger.getAttribute("data-state")).toBe("active");

  const previewTrigger = screen.getByRole("tab", { name: "Preview" });
  expect(previewTrigger.getAttribute("data-state")).toBe("inactive");
});
