import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { SkillEditor } from "./SkillEditor";
import { SkillList } from "./SkillList";
import { AIAssistant } from "./AIAssistant";

type SkillType = "claude" | "grok";

interface Skill {
  _id: Id<"skills">;
  title: string;
  description: string;
  skillType: SkillType;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export function SkillForge() {
  const { signOut } = useAuthActions();
  const skills = useQuery(api.skills.list, {});
  const createSkill = useMutation(api.skills.create);
  const updateSkill = useMutation(api.skills.update);
  const deleteSkill = useMutation(api.skills.remove);

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newSkillType, setNewSkillType] = useState<SkillType>("claude");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);

  const handleCreateSkill = async () => {
    const id = await createSkill({
      title: "Untitled Skill",
      description: "A new skill",
      skillType: newSkillType,
      content: getSkillTemplate(newSkillType),
    });
    setIsCreating(false);
  };

  const handleSaveSkill = async (id: Id<"skills">, updates: { title?: string; description?: string; content?: string }) => {
    await updateSkill({ id, ...updates });
  };

  const handleDeleteSkill = async (id: Id<"skills">) => {
    await deleteSkill({ id });
    if (selectedSkill?._id === id) {
      setSelectedSkill(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col relative overflow-hidden">
      <div className="scanlines" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 via-transparent to-amber-500" />

      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0a0a0c]/95 backdrop-blur relative z-20">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 border-2 border-cyan-400 rounded-lg flex items-center justify-center bg-cyan-400/5">
              <span className="text-cyan-400 text-sm md:text-lg">⚡</span>
            </div>
            <h1 className="font-display text-xl md:text-2xl text-white tracking-tight">
              Skill<span className="text-cyan-400">Forge</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile AI Toggle */}
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className="md:hidden p-2 rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              <span className="text-lg">🤖</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800"
            >
              <span className="text-lg">☰</span>
            </button>

            <button
              onClick={() => setIsCreating(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-sm rounded-lg transition-all"
            >
              <span>+</span>
              NEW SKILL
            </button>

            <button
              onClick={() => signOut()}
              className="hidden md:block px-4 py-2 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 font-mono text-sm rounded-lg transition-all"
            >
              LOGOUT
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-800 bg-[#12121a] p-4 space-y-3 animate-slideDown">
            <button
              onClick={() => { setIsCreating(true); setShowMobileMenu(false); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-sm rounded-lg"
            >
              <span>+</span>
              NEW SKILL
            </button>
            <button
              onClick={() => signOut()}
              className="w-full px-4 py-3 border border-gray-700 text-gray-400 font-mono text-sm rounded-lg"
            >
              LOGOUT
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
        {/* Sidebar - Skills List */}
        <aside className={`${showMobileMenu ? 'block' : 'hidden'} md:block w-full md:w-80 lg:w-96 border-r border-gray-800 bg-[#0a0a0c] flex-shrink-0 overflow-hidden`}>
          <SkillList
            skills={skills ?? []}
            selectedSkill={selectedSkill}
            onSelect={(skill) => { setSelectedSkill(skill); setShowMobileMenu(false); }}
            onDelete={handleDeleteSkill}
          />
        </aside>

        {/* Editor */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {selectedSkill ? (
            <SkillEditor
              skill={selectedSkill}
              onSave={handleSaveSkill}
              onShowAI={() => setShowAIPanel(true)}
            />
          ) : (
            <EmptyState onCreateNew={() => setIsCreating(true)} />
          )}
        </main>

        {/* AI Assistant Panel */}
        <aside className={`${showAIPanel ? 'fixed inset-0 z-50 md:relative md:inset-auto' : 'hidden'} md:block md:w-80 lg:w-96 border-l border-gray-800 bg-[#0a0a0c] flex-shrink-0 overflow-hidden`}>
          <AIAssistant
            currentSkill={selectedSkill}
            onClose={() => setShowAIPanel(false)}
          />
        </aside>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <CreateModal
          skillType={newSkillType}
          onSkillTypeChange={setNewSkillType}
          onCreate={handleCreateSkill}
          onClose={() => setIsCreating(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#0a0a0c] py-2 px-4 relative z-10">
        <p className="text-gray-600 text-xs font-mono text-center">
          Requested by @LBallz77283 · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}

function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-6 md:p-8">
      <div className="text-center max-w-md animate-fadeIn">
        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 border-2 border-dashed border-gray-700 rounded-2xl flex items-center justify-center">
          <span className="text-3xl md:text-4xl opacity-30">⚡</span>
        </div>
        <h2 className="font-display text-xl md:text-2xl text-white mb-3">No skill selected</h2>
        <p className="text-gray-500 font-mono text-xs md:text-sm mb-6 leading-relaxed">
          Select a skill from the sidebar or create a new one to start forging.
        </p>
        <button
          onClick={onCreateNew}
          className="px-6 py-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-sm rounded-lg hover:bg-cyan-500/20 transition-all"
        >
          + CREATE YOUR FIRST SKILL
        </button>
      </div>
    </div>
  );
}

function CreateModal({
  skillType,
  onSkillTypeChange,
  onCreate,
  onClose,
}: {
  skillType: SkillType;
  onSkillTypeChange: (type: SkillType) => void;
  onCreate: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#12121a] border border-gray-800 rounded-xl p-6 md:p-8 w-full max-w-md relative animate-slideUp">
        <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        <h2 className="font-display text-xl md:text-2xl text-white mb-2">Create New Skill</h2>
        <p className="text-gray-500 font-mono text-xs mb-6">Choose your target AI platform</p>

        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
          <button
            onClick={() => onSkillTypeChange("claude")}
            className={`p-4 md:p-6 rounded-xl border-2 transition-all ${
              skillType === "claude"
                ? "border-cyan-500 bg-cyan-500/10"
                : "border-gray-700 hover:border-gray-600"
            }`}
          >
            <div className="text-2xl md:text-3xl mb-2">🟠</div>
            <div className="font-mono text-xs md:text-sm text-white">CLAUDE</div>
            <div className="font-mono text-[10px] md:text-xs text-gray-500 mt-1">Anthropic</div>
          </button>

          <button
            onClick={() => onSkillTypeChange("grok")}
            className={`p-4 md:p-6 rounded-xl border-2 transition-all ${
              skillType === "grok"
                ? "border-amber-500 bg-amber-500/10"
                : "border-gray-700 hover:border-gray-600"
            }`}
          >
            <div className="text-2xl md:text-3xl mb-2">🔵</div>
            <div className="font-mono text-xs md:text-sm text-white">GROK</div>
            <div className="font-mono text-[10px] md:text-xs text-gray-500 mt-1">xAI</div>
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-700 text-gray-400 font-mono text-sm rounded-lg hover:bg-gray-800 transition-all"
          >
            CANCEL
          </button>
          <button
            onClick={onCreate}
            className={`flex-1 py-3 font-mono text-sm rounded-lg transition-all ${
              skillType === "claude"
                ? "bg-cyan-500 hover:bg-cyan-400 text-black"
                : "bg-amber-500 hover:bg-amber-400 text-black"
            }`}
          >
            CREATE
          </button>
        </div>
      </div>
    </div>
  );
}

function getSkillTemplate(type: SkillType): string {
  if (type === "claude") {
    return `# My Claude Skill

## Overview
Describe what this skill does and when to use it.

## Instructions
1. Step one
2. Step two
3. Step three

## Example Usage
\`\`\`
User: [example input]
Assistant: [example response]
\`\`\`

## Notes
- Additional context or limitations
`;
  } else {
    return `# My Grok Skill

## Purpose
What problem does this skill solve?

## Behavior
Define how Grok should respond when this skill is activated.

## Parameters
- **param1**: Description
- **param2**: Description

## Examples
Show example interactions here.

## Constraints
List any limitations or edge cases to handle.
`;
  }
}
