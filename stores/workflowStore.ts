import { create } from "zustand";
import { WorkflowEngineService, type WorkflowExecutionNode } from "@/services/workflowEngineService";

interface WorkflowState {
  nodes: WorkflowExecutionNode[];
  setNodes: (nodes: WorkflowExecutionNode[]) => void;
  advanceWorkflow: () => WorkflowExecutionNode[];
  resetWorkflow: () => void;
}

const workflowEngine = new WorkflowEngineService();

export const useWorkflowStore = create<WorkflowState>((set) => ({
  nodes: workflowEngine.getNodes(),
  setNodes: (nodes) => set({ nodes }),
  advanceWorkflow: () => {
    const nextNodes = workflowEngine.advance();
    set({ nodes: nextNodes });
    return nextNodes;
  },
  resetWorkflow: () => {
    const resetEngine = new WorkflowEngineService();
    set({ nodes: resetEngine.getNodes() });
  },
}));
