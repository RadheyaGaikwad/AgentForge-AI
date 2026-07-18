import type { PreviewManifest, PreviewPageRoute } from "@/types/projectArtifact";
import type { ProjectArtifact } from "@/types/projectArtifact";

const normalizePreviewUrl = (value: string): string => value.trim().replace(/\/+$/, "");

const inferRouteFromPath = (relativePath: string): string | null => {
  const normalizedPath = relativePath.replace(/\\/g, "/");
  const segments = normalizedPath.split("/");
  const isPageEntry = segments.at(-1)?.startsWith("page.");

  if (!isPageEntry) {
    return null;
  }

  const appIndex = segments.indexOf("app");
  if (appIndex === -1) {
    return null;
  }

  const routeSegments = segments.slice(appIndex + 1, -1).filter((segment) => !segment.startsWith("(") && !segment.endsWith(")"));
  if (routeSegments.length === 0) {
    return "/";
  }

  return `/${routeSegments.join("/")}`;
};

export interface PreviewManifestOptions {
  previewUrl: string;
  artifacts?: ProjectArtifact[];
}

export function buildPreviewManifest({ previewUrl, artifacts = [] }: PreviewManifestOptions): PreviewManifest {
  const pages = artifacts.reduce<Array<PreviewPageRoute>>((collected, artifact) => {
    const route = inferRouteFromPath(artifact.relativePath);
    if (!route) {
      return collected;
    }

    const exists = collected.some((page) => page.route === route && page.sourcePath === artifact.relativePath);
    if (exists) {
      return collected;
    }

    collected.push({
      route,
      label: route === "/" ? "Home page" : route.replace(/^\/+|\/+$/g, "").split("/").join(" / "),
      sourcePath: artifact.relativePath,
    });

    return collected;
  }, []).sort((left, right) => left.route.localeCompare(right.route));

  return {
    previewUrl: normalizePreviewUrl(previewUrl),
    pages,
    generatedAt: new Date().toISOString(),
    status: "pending",
  };
}
