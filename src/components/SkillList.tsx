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

interface SkillListProps {
  skills: Skill[];
  selectedSkill: Skill | null;
  onSelect: (skill: Skill) => void;
  onDelete: (id: Id<"skills">) => void;
}

export function SkillList({ skills, selectedSkill, onSelect, onDelete }: SkillListProps) {
  const claudeSkills = skills.filter(s => s.skillType === "claude");
  const grokSkills = skills.filter(s => s.skillType === "grok");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <h2 className="font-mono text-xs text-gray-500 tracking-widest">YOUR SKILLS</h2>
        <p className="font-mono text-xs text-gray-600 mt-1">{skills.length} total</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {skills.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-600 font-mono text-xs">No skills yet</div>
          </div>
        ) : (
          <div className="p-2 space-y-4">
            {claudeSkills.length > 0 && (
              <SkillGroup
                title="CLAUDE"
                icon="🟠"
                accentColor="cyan"
                skills={claudeSkills}
                selectedSkill={selectedSkill}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            )}

            {grokSkills.length > 0 && (
              <SkillGroup
                title="GROK"
                icon="🔵"
                accentColor="amber"
                skills={grokSkills}
                selectedSkill={selectedSkill}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SkillGroup({
  title,
  icon,
  accentColor,
  skills,
  selectedSkill,
  onSelect,
  onDelete,
}: {
  title: string;
  icon: string;
  accentColor: "cyan" | "amber";
  skills: Skill[];
  selectedSkill: Skill | null;
  onSelect: (skill: Skill) => void;
  onDelete: (id: Id<"skills">) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 px-2 py-2">
        <span className="text-sm">{icon}</span>
        <span className={`font-mono text-xs tracking-widest ${accentColor === "cyan" ? "text-cyan-400" : "text-amber-400"}`}>
          {title}
        </span>
        <span className="font-mono text-xs text-gray-600">({skills.length})</span>
      </div>

      <div className="space-y-1">
        {skills.map((skill) => (
          <SkillCard
            key={skill._id}
            skill={skill}
            isSelected={selectedSkill?._id === skill._id}
            accentColor={accentColor}
            onSelect={() => onSelect(skill)}
            onDelete={() => onDelete(skill._id)}
          />
        ))}
      </div>
    </div>
  );
}

function SkillCard({
  skill,
  isSelected,
  accentColor,
  onSelect,
  onDelete,
}: {
  skill: Skill;
  isSelected: boolean;
  accentColor: "cyan" | "amber";
  onSelect: () => void;
  onDelete: () => void;
}) {
  const borderColor = accentColor === "cyan" ? "border-cyan-500" : "border-amber-500";
  const bgColor = accentColor === "cyan" ? "bg-cyan-500/5" : "bg-amber-500/5";

  return (
    <div
      onClick={onSelect}
      className={`group p-3 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? `${borderColor} ${bgColor}`
          : "border-gray-800 hover:border-gray-700 hover:bg-gray-800/50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-mono text-sm text-white truncate">{skill.title}</h3>
          <p className="font-mono text-xs text-gray-500 truncate mt-1">{skill.description}</p>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
          title="Delete skill"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <span className="font-mono text-[10px] text-gray-600">
          {formatDate(skill.updatedAt)}
        </span>
      </div>
    </div>
  );
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
