import { spawn } from "node:child_process";
import { executionLogService } from "@/services/executionLogService";

export interface DevServerManagerOptions {
  cwd: string;
  port?: number;
  hostname?: string;
  timeoutMs?: number;
}

export interface DevServerManagerResult {
  started: boolean;
  url: string | null;
  port: number | null;
  pid: number | null;
  runtimeLogs: string[];
  errorMessage?: string;
}

const DEFAULT_PORTS = [3000, 3001, 3002, 3003, 4173];
const READY_URL_PATTERNS = [
  /Local:\s+(https?:\/\/[^\s]+)/i,
  /ready - started server on\s+(https?:\/\/[^\s]+)/i,
  /(https?:\/\/localhost:\d+)/i,
  /(https?:\/\/127\.0\.0\.1:\d+)/i,
];

const extractPreviewUrl = (output: string): string | null => {
  for (const pattern of READY_URL_PATTERNS) {
    const match = output.match(pattern);
    if (match?.[1]) {
      return match[1].replace(/\/$/, "");
    }
  }

  return null;
};

const responds = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
};

export async function startPreviewServer(options: DevServerManagerOptions): Promise<DevServerManagerResult> {
  const hostname = options.hostname ?? "127.0.0.1";
  const timeoutMs = options.timeoutMs ?? 90000;
  const portCandidates = options.port ? [options.port] : DEFAULT_PORTS;

  for (const port of portCandidates) {
    const url = `http://${hostname}:${port}`;
    const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
    const environment = { ...process.env };
    delete environment.DATABASE_URL;
    const child = spawn(npmCommand, ["run", "dev", "--", "--hostname", hostname, "--port", String(port)], {
      cwd: options.cwd,
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
      windowsHide: true,
      env: environment,
    });

    if (!child.pid) {
      executionLogService.add({
        level: "warning",
        actor: "Dev Server Manager",
        message: `Could not spawn the dev server for ${options.cwd} on port ${port}.`,
        metadata: { cwd: options.cwd, port },
      });
      continue;
    }

    const runtimeLogs: string[] = [];
    const logOutput = (chunk: Buffer | string) => {
      const text = chunk.toString();
      runtimeLogs.push(text.trim());
    };

    child.stdout?.on("data", logOutput);
    child.stderr?.on("data", logOutput);

    executionLogService.add({
      level: "info",
      actor: "Dev Server Manager",
      message: `Attempting to start the generated app on ${url}.`,
      metadata: { cwd: options.cwd, port, pid: child.pid },
    });

    const startedAt = Date.now();
    let readyUrl: string | null = null;

    while (Date.now() - startedAt < timeoutMs) {
      const combinedOutput = runtimeLogs.join("\n");
      readyUrl = extractPreviewUrl(combinedOutput);
      if (readyUrl && await responds(readyUrl)) {
        executionLogService.add({
          level: "success",
          actor: "Dev Server Manager",
          message: `Preview server started successfully at ${readyUrl}.`,
          metadata: { cwd: options.cwd, port, pid: child.pid, runtimeLogs },
        });

        return {
          started: true,
          url: readyUrl,
          port,
          pid: child.pid,
          runtimeLogs,
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    executionLogService.add({
      level: "warning",
      actor: "Dev Server Manager",
      message: `Preview server did not become ready within ${timeoutMs}ms while probing ${url}.`,
      metadata: { cwd: options.cwd, port, pid: child.pid, runtimeLogs },
    });
  }

  executionLogService.add({
    level: "warning",
    actor: "Dev Server Manager",
    message: "Preview server did not become ready after the startup attempts.",
    metadata: { cwd: options.cwd, ports: portCandidates },
  });

  return {
    started: false,
    url: null,
    port: null,
    pid: null,
    runtimeLogs: [],
    errorMessage: "Preview failed to start.",
  };
}
