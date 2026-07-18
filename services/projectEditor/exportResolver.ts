import type { CodeIndex } from "@/services/projectEditor/codeIndexer";

export interface ExportResolutionResult {
  symbol: string;
  sources: string[];
}

export class ExportResolver {
  resolveSymbol(symbol: string, index: CodeIndex): ExportResolutionResult {
    const sources = index.entries
      .filter((entry) => entry.exports.includes(symbol))
      .map((entry) => entry.relativePath);

    return {
      symbol,
      sources,
    };
  }
}

export function resolveExportSymbol(symbol: string, index: CodeIndex): ExportResolutionResult {
  const resolver = new ExportResolver();
  return resolver.resolveSymbol(symbol, index);
}
