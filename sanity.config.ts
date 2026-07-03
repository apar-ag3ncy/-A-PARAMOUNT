import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";

// Read env directly so the Sanity CLI (sanity dev/deploy) works too.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "placeholder";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";

export default defineConfig({
  name: "paramount",
  title: "Paramount — Temple Artifacts",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool(), visionTool({ defaultApiVersion: apiVersion })],
  schema: { types: schemaTypes },
});
