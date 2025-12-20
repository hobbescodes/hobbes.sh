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
          URI: "z.string()",
          DateTime: "z.string()",
          HTML: "z.string()",
          GitObjectID: "z.string()",
          GitSSHRemote: "z.string()",
          Base64String: "z.string()",
          PreciseDateTime: "z.string()",
          X509Certificate: "z.string()",
        },
      },
    },
  ],
});
