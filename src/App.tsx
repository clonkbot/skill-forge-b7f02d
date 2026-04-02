import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { SkillForge } from "./components/SkillForge";
import { AuthScreen } from "./components/AuthScreen";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <SkillForge />;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center relative overflow-hidden">
      <div className="scanlines" />
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <div className="w-16 h-16 border-2 border-cyan-400 rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 bg-cyan-400/20 animate-ping rounded" />
        </div>
        <p className="font-mono text-cyan-400/60 text-sm tracking-widest">
          INITIALIZING FORGE...
        </p>
      </div>
    </div>
  );
}
