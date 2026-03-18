"use client";

import { Loader2 } from "lucide-react";

interface ToolCallBadgeProps {
  toolName: string;
  state: "call" | "result";
  args: Record<string, unknown>;
}

function getLabel(toolName: string, args: Record<string, unknown>): string {
  const command = args.command as string | undefined;
  const path = args.path as string | undefined;

  if (toolName === "str_replace_editor" && path) {
    switch (command) {
      case "create":
        return `Creating ${path}`;
      case "str_replace":
      case "insert":
        return `Editing ${path}`;
      case "view":
        return `Reading ${path}`;
      case "undo_edit":
        return `Undoing edit to ${path}`;
    }
  }

  if (toolName === "file_manager" && path) {
    switch (command) {
      case "rename": {
        const newPath = args.new_path as string | undefined;
        return newPath ? `Renaming ${path} to ${newPath}` : `Renaming ${path}`;
      }
      case "delete":
        return `Deleting ${path}`;
    }
  }

  return toolName;
}

export function ToolCallBadge({ toolName, state, args }: ToolCallBadgeProps) {
  const label = getLabel(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {state === "result" ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
