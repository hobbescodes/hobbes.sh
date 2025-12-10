import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";

import type { Colorscheme } from "@/types";

const colorschemeValidator = z.enum([
  "latte",
  "frappe",
  "macchiato",
  "mocha",
  "ghostty",
]);

const storageKey = "_preferred-theme";

export const getColorscheme = createServerFn().handler(
  async (): Promise<Colorscheme> => {
    const stored = getCookie(storageKey);
    // Validate stored value is a valid colorscheme, fallback to ghostty
    const parsed = colorschemeValidator.safeParse(stored);
    return parsed.success ? parsed.data : "ghostty";
  },
);

export const setColorscheme = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => colorschemeValidator.parse(data))
  .handler(async ({ data }) => setCookie(storageKey, data));
