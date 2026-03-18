import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

test("str_replace_editor create shows Creating label", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      state="result"
      args={{ command: "create", path: "/App.jsx" }}
    />
  );
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("str_replace_editor str_replace shows Editing label", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      state="result"
      args={{ command: "str_replace", path: "/Button.tsx" }}
    />
  );
  expect(screen.getByText("Editing /Button.tsx")).toBeDefined();
});

test("str_replace_editor insert shows Editing label", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      state="result"
      args={{ command: "insert", path: "/App.jsx" }}
    />
  );
  expect(screen.getByText("Editing /App.jsx")).toBeDefined();
});

test("str_replace_editor view shows Reading label", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      state="result"
      args={{ command: "view", path: "/App.jsx" }}
    />
  );
  expect(screen.getByText("Reading /App.jsx")).toBeDefined();
});

test("str_replace_editor undo_edit shows Undoing edit label", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      state="result"
      args={{ command: "undo_edit", path: "/App.jsx" }}
    />
  );
  expect(screen.getByText("Undoing edit to /App.jsx")).toBeDefined();
});

test("file_manager rename shows Renaming label", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      state="result"
      args={{ command: "rename", path: "/old.jsx", new_path: "/new.jsx" }}
    />
  );
  expect(screen.getByText("Renaming /old.jsx to /new.jsx")).toBeDefined();
});

test("file_manager delete shows Deleting label", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      state="result"
      args={{ command: "delete", path: "/Card.tsx" }}
    />
  );
  expect(screen.getByText("Deleting /Card.tsx")).toBeDefined();
});

test("unknown tool name falls back to raw tool name", () => {
  render(
    <ToolCallBadge
      toolName="some_unknown_tool"
      state="result"
      args={{}}
    />
  );
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});

test("state call renders spinner", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      state="call"
      args={{ command: "create", path: "/App.jsx" }}
    />
  );
  const spinner = document.querySelector(".animate-spin");
  expect(spinner).not.toBeNull();
});

test("state result renders green dot", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      state="result"
      args={{ command: "create", path: "/App.jsx" }}
    />
  );
  const dot = document.querySelector(".bg-emerald-500");
  expect(dot).not.toBeNull();
});
