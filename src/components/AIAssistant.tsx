import { useState, useRef, useEffect } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
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

interface AIAssistantProps {
  currentSkill: Skill | null;
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIAssistant({ currentSkill, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chat = useAction(api.ai.chat);
  const saveSuggestion = useMutation(api.suggestions.save);
  const recentSuggestions = useQuery(api.suggestions.listRecent);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getSystemPrompt = () => {
    const skillContext = currentSkill
      ? `\n\nThe user is currently working on a ${currentSkill.skillType.toUpperCase()} skill titled "${currentSkill.title}".\nDescription: ${currentSkill.description}\n\nCurrent content:\n\`\`\`\n${currentSkill.content}\n\`\`\``
      : "";

    return `You are an expert AI skill writer assistant. You help users create and refine skills for Claude (Anthropic) and Grok (xAI).

For CLAUDE skills:
- Skills are markdown documents that define custom behaviors
- Include clear instructions, examples, and constraints
- Use structured headers and bullet points
- Consider edge cases and error handling

For GROK skills:
- Follow xAI's skill format and conventions
- Include clear triggers and responses
- Define parameters and their types
- Provide example interactions

Be concise but thorough. Provide actionable suggestions. When asked to write or improve a skill, output the complete skill content in markdown code blocks.${skillContext}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const allMessages = [
        ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: userMessage }
      ];

      const response = await chat({
        messages: allMessages,
        systemPrompt: getSystemPrompt(),
      });

      setMessages(prev => [...prev, { role: "assistant", content: response }]);

      // Save the suggestion
      await saveSuggestion({
        skillId: currentSkill?._id,
        prompt: userMessage,
        suggestion: response,
      });
    } catch (err) {
      setError("Failed to get AI response. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const quickActions = currentSkill ? [
    `Improve the clarity of my ${currentSkill.skillType} skill`,
    "Add more examples to this skill",
    "Check for edge cases I might have missed",
    "Suggest a better structure for this skill",
  ] : [
    "How do I write a Claude skill?",
    "What makes a good Grok skill?",
    "Show me a skill template",
    "What are skill best practices?",
  ];

  return (
    <div className="h-full flex flex-col bg-[#0a0a0c]">
      {/* Header */}
      <div className="border-b border-gray-800 p-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="font-mono text-sm text-amber-400 tracking-wide flex items-center gap-2">
            <span>🤖</span> AI ASSISTANT
          </h2>
          <p className="font-mono text-xs text-gray-600 mt-1">
            Powered by Grok
          </p>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center py-6 md:py-8">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 border border-amber-500/30 rounded-xl flex items-center justify-center bg-amber-500/5">
                <span className="text-xl md:text-2xl">✨</span>
              </div>
              <h3 className="font-display text-base md:text-lg text-white mb-2">Skill Forge AI</h3>
              <p className="font-mono text-xs text-gray-500 max-w-xs mx-auto">
                I can help you write, improve, and debug your Claude and Grok skills.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-mono text-xs text-gray-600 px-1">Quick actions:</p>
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAction(action)}
                  className="w-full text-left p-3 rounded-lg border border-gray-800 hover:border-amber-500/30 hover:bg-amber-500/5 font-mono text-xs text-gray-400 hover:text-amber-400 transition-all"
                >
                  → {action}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">🤖</span>
                </div>
                <div className="flex-1 bg-[#12121a] rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error Toast */}
      {error && (
        <div className="mx-4 mb-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="font-mono text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-800 p-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about skill writing..."
            disabled={isLoading}
            className="flex-1 bg-[#12121a] border border-gray-800 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-amber-500/50 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-black font-mono text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            →
          </button>
        </form>

        {currentSkill && (
          <p className="font-mono text-[10px] text-gray-600 mt-2 px-1">
            Context: {currentSkill.title} ({currentSkill.skillType})
          </p>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isUser
          ? "bg-cyan-500/10 border border-cyan-500/30"
          : "bg-amber-500/10 border border-amber-500/30"
      }`}>
        <span className="text-sm">{isUser ? "👤" : "🤖"}</span>
      </div>

      <div className={`flex-1 max-w-[85%] rounded-xl p-4 ${
        isUser
          ? "bg-cyan-500/10 border border-cyan-500/30"
          : "bg-[#12121a] border border-gray-800"
      }`}>
        <div className={`font-mono text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
          isUser ? "text-cyan-100" : "text-gray-300"
        }`}>
          {message.content}
        </div>
      </div>
    </div>
  );
}
