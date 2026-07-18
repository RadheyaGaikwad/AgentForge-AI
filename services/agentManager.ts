import type { Agent, AgentStatus } from "@/types/agent";

export type IExecutionAgent = Agent;

export interface IAgentManager {
  registerAgent(agent: Omit<IExecutionAgent, "id" | "createdAt" | "updatedAt">): IExecutionAgent;
  removeAgent(id: string): boolean;
  getAgent(id: string): IExecutionAgent | null;
  getAgents(): IExecutionAgent[];
  setAgents(agents: IExecutionAgent[]): void;
  assignTask(agentId: string, taskId: string): IExecutionAgent | null;
  updateStatus(id: string, status: AgentStatus, progress?: number, task?: string | null): IExecutionAgent | null;
  reset(): void;
}

export class MockAgentManager implements IAgentManager {
  private agents: IExecutionAgent[] = [];

  registerAgent(agent: Omit<IExecutionAgent, "id" | "createdAt" | "updatedAt">): IExecutionAgent {
    const timestamp = new Date().toISOString();
    const registeredAgent: IExecutionAgent = {
      ...agent,
      id: `agent-${Math.random().toString(36).slice(2, 10)}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.agents = [...this.agents, registeredAgent];
    return registeredAgent;
  }

  removeAgent(id: string): boolean {
    const nextSize = this.agents.filter((agent) => agent.id !== id).length;
    this.agents = this.agents.filter((agent) => agent.id !== id);
    return nextSize !== this.agents.length;
  }

  getAgent(id: string): IExecutionAgent | null {
    return this.agents.find((agent) => agent.id === id) ?? null;
  }

  getAgents(): IExecutionAgent[] {
    return this.agents.map((agent) => ({ ...agent }));
  }

  setAgents(agents: IExecutionAgent[]): void {
    this.agents = agents.map((agent) => ({ ...agent }));
  }

  assignTask(agentId: string, taskId: string): IExecutionAgent | null {
    const agent = this.getAgent(agentId);

    if (!agent) {
      return null;
    }

    const nextAgent = { ...agent, currentTask: `Task ${taskId}`, updatedAt: new Date().toISOString() };
    this.agents = this.agents.map((entry) => (entry.id === agentId ? nextAgent : entry));
    return this.getAgent(agentId);
  }

  updateStatus(id: string, status: AgentStatus, progress = 0, task: string | null = null): IExecutionAgent | null {
    const agent = this.getAgent(id);

    if (!agent) {
      return null;
    }

    const nextAgent = {
      ...agent,
      status,
      progress,
      currentTask: task ?? agent.currentTask,
      updatedAt: new Date().toISOString(),
    };

    this.agents = this.agents.map((entry) => (entry.id === id ? nextAgent : entry));
    return this.getAgent(id);
  }

  reset(): void {
    this.agents = [];
  }
}
