import { defineConfig } from "tangrams";

export default defineConfig({
  sources: [
    {
      name: "github",
      type: "graphql",
      schema: {
        url: "https://api.github.com/graphql",
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      },
      documents: "./src/graphql/**/*.graphql",
      generates: ["query"],
      overrides: {
        scalars: {
          URI: "string",
          DateTime: "string",
          HTML: "string",
          GitObjectID: "string",
          GitSSHRemote: "string",
          Base64String: "string",
          PreciseDateTime: "string",
          X509Certificate: "string",
        },
      },
    },
  ],
});
