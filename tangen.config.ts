import { defineConfig } from "tangen";

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
      documents: "./src/graphql/**/*.graphql",
    },
  ],
  output: {
    dir: "./src/generated",
    client: "client.ts",
    types: "types.ts",
    operations: "operations.ts",
  },
});
