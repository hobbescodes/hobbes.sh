import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";

const previewValidator = z.boolean();
const storageKey = "_preview-open";

export const getPreviewState = createServerFn().handler(async () => {
  const cookie = getCookie(storageKey);
  return cookie === "true";
});

export const setPreviewState = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => previewValidator.parse(data))
  .handler(async ({ data }) => setCookie(storageKey, String(data)));
