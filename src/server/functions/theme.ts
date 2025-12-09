import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";

const themeValidator = z.union([z.literal("light"), z.literal("dark")]);
const storageKey = "_preferred-theme";

export type Theme = z.infer<typeof themeValidator>;

export const getTheme = createServerFn().handler(
	async () => (getCookie(storageKey) || "dark") as Theme,
);

export const setTheme = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => themeValidator.parse(data))
	.handler(async ({ data }) => setCookie(storageKey, data));
