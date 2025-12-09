import { useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { Buffer } from "@/components/editor/Buffer";
import { OilEntry } from "@/components/oil/OilEntry";
import { Terminal } from "@/components/terminal/Terminal";
import { useNavigation } from "@/context/NavigationContext";
import { notFoundAscii } from "@/lib/ascii/404";

import type { FC } from "react";

export const NotFound: FC = () => {
  const canGoBack = useCanGoBack();
  const router = useRouter();
  const navigate = useNavigate();
  const { mode } = useNavigation();

  // Single navigation entry - always selected
  const [selectedIndex] = useState(0);

  // Playful message lines
  const messageLines = [
    { id: "blank-1", text: "" },
    { id: "msg-1", text: "Even tigers get lost sometimes..." },
    { id: "msg-2", text: "The page you're looking for doesn't exist." },
    { id: "blank-2", text: "" },
  ];

  // Calculate line numbers
  const asciiLineCount = notFoundAscii.split("\n").length;
  const messageLineCount = messageLines.length;
  const navHeaderLine = asciiLineCount + messageLineCount + 1; // "Options:" header
  const navEntryLine = navHeaderLine + 1;
  const hintLine = navEntryLine + 2; // blank + hint

  const totalLines = hintLine + 5; // padding for ~
  const contentLineCount = hintLine;
  const currentLine = navEntryLine; // cursor on the nav entry

  const handleNavigate = useCallback(() => {
    if (canGoBack) {
      router.history.back();
    } else {
      navigate({ to: "/" });
    }
  }, [canGoBack, router, navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Only handle in NORMAL mode
      if (mode !== "NORMAL") return;

      if (e.key === "Enter") {
        e.preventDefault();
        handleNavigate();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNavigate, mode]);

  const navEntry = {
    name: canGoBack ? "go-back" : "home",
    displayName: canGoBack ? "← Go back" : "← Home",
    type: "file" as const,
    path: canGoBack ? "" : "/",
  };

  return (
    <Terminal
      title="👻 ~/hobbescodes/404.md"
      filepath="~/hobbescodes/404.md"
      filetype="markdown"
      line={currentLine}
      col={1}
    >
      <Buffer
        lineCount={totalLines}
        currentLine={currentLine}
        contentLineCount={contentLineCount}
      >
        {/* 404 ASCII Art - mauve for branding */}
        <pre className="text-[var(--mauve)] leading-[1.6]">{notFoundAscii}</pre>

        {/* Playful message */}
        {messageLines.map((line) => (
          <div
            key={line.id}
            className="leading-[1.6]"
            style={{ color: "var(--subtext1)" }}
          >
            {line.text || "\u00A0"}
          </div>
        ))}

        {/* Navigation section */}
        <div
          className="font-bold leading-[1.6]"
          style={{ color: "var(--blue)" }}
        >
          Options:
        </div>

        <OilEntry
          entry={navEntry}
          isSelected={selectedIndex === 0}
          onClick={handleNavigate}
        />

        {/* Hint for help */}
        <div
          className="mt-4 leading-[1.6]"
          style={{ color: "var(--overlay2)" }}
        >
          Press <span style={{ color: "var(--yellow)" }}>?</span> for help
        </div>
      </Buffer>
    </Terminal>
  );
};
