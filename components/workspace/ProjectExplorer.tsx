"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, FileCode2, Folder, Search, ShieldAlert } from "lucide-react";
import type { FileRegistryEntry } from "@/services/fileRegistry";
import type { ProjectSummary, ValidationReport } from "@/types/projectArtifact";

interface ProjectExplorerProps {
  files: FileRegistryEntry[];
  validationReport: ValidationReport;
  projectSummary: ProjectSummary;
  selectedFilePath: string | null;
  onSelectFile: (filePath: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  kind: "folder" | "file";
  children: TreeNode[];
}

const buildTree = (files: FileRegistryEntry[]): TreeNode[] => {
  const root: TreeNode[] = [];

  const ensureNode = (segments: string[], base: TreeNode[]): TreeNode => {
    const [segment, ...rest] = segments;
    const match = base.find((entry) => entry.name === segment);

    if (match) {
      if (rest.length === 0) {
        return match;
      }

      if (!match.children.some((child) => child.name === rest[0])) {
        match.children.push({
          name: rest[0],
          path: rest.join("/"),
          kind: "folder",
          children: [],
        });
      }

      return ensureNode(rest, match.children);
    }

    const node: TreeNode = {
      name: segment,
      path: segments.join("/"),
      kind: rest.length === 0 ? "file" : "folder",
      children: rest.length === 0 ? [] : [],
    };

    base.push(node);
    if (rest.length === 0) {
      return node;
    }

    return ensureNode(rest, node.children);
  };

  files.forEach((file) => {
    const segments = file.relativePath.split("/");
    ensureNode(segments, root);
  });

  return root;
};

const TreeNodeRenderer = ({
  node,
  depth,
  selectedFilePath,
  onSelectFile,
  expandedFolders,
  toggleFolder,
}: {
  node: TreeNode;
  depth: number;
  selectedFilePath: string | null;
  onSelectFile: (filePath: string) => void;
  expandedFolders: Set<string>;
  toggleFolder: (folderPath: string) => void;
}) => {
  const isFolder = node.kind === "folder";
  const isExpanded = expandedFolders.has(node.path);
  const isSelected = selectedFilePath === node.path;

  if (isFolder) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => toggleFolder(node.path)}
          className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-sm text-white/75 hover:bg-white/[0.05]"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <Folder className="h-4 w-4 text-cyan-300" />
          <span>{node.name}</span>
        </button>
        {isExpanded ? (
          <div className="space-y-1">
            {node.children.map((child) => (
              <TreeNodeRenderer
                key={`${child.path}-${depth}`}
                node={child}
                depth={depth + 1}
                selectedFilePath={selectedFilePath}
                onSelectFile={onSelectFile}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelectFile(node.path)}
      className={`flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-sm transition-all ${
        isSelected ? "bg-cyan-400/15 text-white" : "text-white/70 hover:bg-white/[0.05]"
      }`}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      <FileCode2 className="h-4 w-4 text-emerald-300" />
      <span>{node.name}</span>
    </button>
  );
};

export function ProjectExplorer({
  files,
  validationReport,
  projectSummary,
  selectedFilePath,
  onSelectFile,
}: ProjectExplorerProps) {
  const [query, setQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["app", "components", "services", "types"]));

  const filteredFiles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return files;
    }

    return files.filter((file) => file.relativePath.toLowerCase().includes(normalizedQuery));
  }, [files, query]);

  const tree = useMemo(() => buildTree(filteredFiles), [filteredFiles]);

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((current) => {
      const next = new Set(current);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return next;
    });
  };

  return (
    <div className="rounded-[30px] border border-white/10 bg-[#0B1020]/70 p-5 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white/40">Project explorer</p>
          <h3 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-white">Generated project tree</h3>
        </div>
        <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[12px] text-cyan-200">
          {projectSummary.filesGenerated} files
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
        <Search className="h-4 w-4 text-white/50" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search generated files"
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
        />
      </div>

      <div className="mt-4 space-y-2">
        {tree.map((node) => (
          <TreeNodeRenderer
            key={node.path}
            node={node}
            depth={0}
            selectedFilePath={selectedFilePath}
            onSelectFile={onSelectFile}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
          />
        ))}
      </div>

      <div className="mt-5 rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-100">
          <ShieldAlert className="h-4 w-4" />
          Validation summary
        </div>
        <div className="mt-3 grid gap-2 text-xs text-white/70">
          <p>Imports: {validationReport.imports.length}</p>
          <p>Dependencies missing: {validationReport.missingDependencies.length}</p>
          <p>Duplicate files: {validationReport.duplicateFiles.length}</p>
          <p>Empty files: {validationReport.emptyFiles.length}</p>
        </div>
      </div>
    </div>
  );
}
