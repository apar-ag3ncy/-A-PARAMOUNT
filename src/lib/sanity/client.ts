import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, hasSanity, projectId } from "./config";

/** The Sanity read client, or null until a project is configured. */
export const sanityClient: SanityClient | null = hasSanity
  ? createClient({
      projectId: projectId as string,
      dataset,
      apiVersion,
      useCdn: true,
    })
  : null;

export { hasSanity };
