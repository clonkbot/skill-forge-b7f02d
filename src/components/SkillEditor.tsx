import { useState, useEffect, useRef } from "react";
import { Id } from "../../convex/_generated/dataModel";

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

interface SkillEditorProps {
  skill: Skill;
  onSave: (id: Id<"skills">, updates: { title?: string; description?: string; content?: string }) => Promise<void>;
  onShowAI: () => void;
}

export function SkillEditor({ skill, onSave, onShowAI }: SkillEditorProps) {
  const [title, setTitle] = useState(skill.title);
  const [description, setDescription] = useState(skill.description);
  const [content, setContent] = useState(skill.content);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTitle(skill.title);
    setDescription(skill.description);
    setContent(skill.content);
    setLastSaved(null);
  }, [skill._id]);

  const handleSave = async (updates: { title?: string; description?: string; content?: string }) => {
    setIsSaving(true);
    try {
      await onSave(skill._id, updates);
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  };

  const debouncedSave = (updates: { title?: string; description?: string; content?: string }) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(updates);
    }, 1000);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    debouncedSave({ title: newTitle });
  };

  const handleDescriptionChange = (newDesc: string) => {
    setDescription(newDesc);
    debouncedSave({ description: newDesc });
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    debouncedSave({ content: newContent });
  };

  const accentColor = skill.skillType === "claude" ? "cyan" : "amber";
  const icon = skill.skillType === "claude" ? "🟠" : "🔵";

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Editor Header */}
      <div className="border-b border-gray-800 p-4 md:p-6 flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xl md:text-2xl">{icon}</span>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="flex-1 bg-transparent text-white font-display text-xl md:text-2xl focus:outline-none border-b border-transparent focus:border-gray-600 transition-colors"
                placeholder="Skill title..."
              />
            </div>

            <input
              type="text"
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className="w-full bg-transparent text-gray-400 font-mono text-xs md:text-sm focus:outline-none border-b border-transparent focus:border-gray-700 transition-colors"
              placeholder="Brief description..."
            />
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Mobile AI button */}
            <button
              onClick={onShowAI}
              className={`md:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-xs border transition-all ${
                accentColor === "cyan"
                  ? "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                  : "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              }`}
            >
              🤖 AI HELP
            </button>

            <div className="hidden md:flex items-center gap-2 text-gray-500 font-mono text-xs">
              {isSaving && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  Saving...
                </span>
              )}
              {!isSaving && lastSaved && (
                <span className="text-green-500/60">✓ Saved</span>
              )}
            </div>

            <span className={`px-3 py-1.5 rounded-full font-mono text-xs border ${
              accentColor === "cyan"
                ? "border-cyan-500/30 text-cyan-400 bg-cyan-500/10"
                : "border-amber-500/30 text-amber-400 bg-amber-500/10"
            }`}>
              {skill.skillType.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 p-4 md:p-6 overflow-hidden">
          <div className="h-full relative">
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-full bg-[#12121a] border border-gray-800 rounded-xl p-4 md:p-6 text-gray-300 font-mono text-xs md:text-sm leading-relaxed resize-none focus:outline-none focus:border-gray-700 transition-colors custom-scrollbar"
              placeholder="Start writing your skill definition..."
              spellCheck={false}
            />

            {/* Line numbers overlay effect */}
            <div className="absolute left-0 top-0 bottom-0 w-12 md:w-16 bg-gradient-to-r from-[#12121a] to-transparent pointer-events-none rounded-l-xl" />
          </div>
        </div>

        {/* Editor Footer */}
        <div className="border-t border-gray-800 px-4 md:px-6 py-3 flex items-center justify-between text-gray-600 font-mono text-xs flex-shrink-0">
          <div className="flex items-center gap-4">
            <span>{content.length} characters</span>
            <span>{content.split(/\n/).length} lines</span>
          </div>
          <div>
            Last modified: {new Date(skill.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
