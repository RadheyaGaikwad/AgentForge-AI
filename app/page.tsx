import { AgentTeam } from "@/components/landing/AgentTeam";
import { BackgroundScene, FloatingCode } from "@/components/landing/BackgroundScene";
import { Footer } from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { Navbar } from "@/components/landing/Navbar";
import { WorkflowPipeline } from "@/components/landing/WorkflowPipeline";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#05060B] text-white">
      <BackgroundScene />
      <Navbar />

      <HeroSection />

      {/* Ambient floating code blocks */}
      <div className="pointer-events-none relative hidden lg:block">
        <FloatingCode
          code={`const team = await agentforge.deploy({
  agents: 10,
  stack: "full-stack"
});`}
          className="right-[8%] top-[120vh] rotate-2"
          delay={0}
        />
        <FloatingCode
          code={`export default function App() {
  return <Dashboard />;
}`}
          className="left-[5%] top-[180vh] -rotate-1"
          delay={1}
        />
        <FloatingCode
          code={`model Patient {
  id        String @id
  name      String
  records   Record[]
}`}
          className="right-[6%] top-[240vh] rotate-1"
          delay={2}
        />
      </div>

      <AgentTeam />
      <WorkflowPipeline />
      <Footer />
    </main>
  );
}
