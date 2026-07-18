import { executionLogService } from "@/services/executionLogService";

const PREVIEW_HOST_CANDIDATES = ["http://127.0.0.1", "http://localhost"];
const PREVIEW_PORT_CANDIDATES = [3000, 3001, 3002, 3003, 4173];
const CONFIGURED_PREVIEW_ENV_KEYS = ["NEXT_PUBLIC_PREVIEW_URL", "PREVIEW_URL", "CLOUD_PREVIEW_URL", "VERCEL_URL"];

export interface PreviewDetectionResult {
  url: string;
  source: "configured" | "detected" | "default";
}

const normalizePreviewUrl = (value: string): string => value.trim().replace(/\/+$/, "");

const withProtocol = (value: string): string => {
  if (/^https?:\/\//i.test(value)) {
    return normalizePreviewUrl(value);
  }

  return normalizePreviewUrl(`https://${value}`);
};

async function probePreviewUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(900),
    });

    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}

export function getConfiguredPreviewUrl(): string | null {
  const envValue = CONFIGURED_PREVIEW_ENV_KEYS.map((key) => process.env[key]).find(Boolean);
  if (!envValue) {
    return null;
  }

  return withProtocol(envValue);
}

export async function detectPreviewUrl(
  portCandidates: number[] = PREVIEW_PORT_CANDIDATES,
  hostCandidates: string[] = PREVIEW_HOST_CANDIDATES,
): Promise<PreviewDetectionResult> {
  const configuredUrl = getConfiguredPreviewUrl();
  if (configuredUrl && (await probePreviewUrl(configuredUrl))) {
    executionLogService.add({
      level: "info",
      actor: "Preview Detector",
      message: `Using configured preview URL ${configuredUrl}.`,
      metadata: { previewUrl: configuredUrl },
    });
    return { url: configuredUrl, source: "configured" };
  }

  for (const port of portCandidates) {
    for (const host of hostCandidates) {
      const candidateUrl = `${host}:${port}`;
      if (await probePreviewUrl(candidateUrl)) {
        executionLogService.add({
          level: "info",
          actor: "Preview Detector",
          message: `Detected live preview at ${candidateUrl}.`,
          metadata: { previewUrl: candidateUrl },
        });
        return { url: candidateUrl, source: "detected" };
      }
    }
  }

  executionLogService.add({
    level: "warning",
    actor: "Preview Detector",
    message: "No live preview URL was detected for the generated project.",
    metadata: { previewUrl: "" },
  });

  return { url: "", source: "default" };
}

export async function waitForPreviewUrl(url: string, attempts = 20): Promise<boolean> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await probePreviewUrl(url)) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return false;
}
