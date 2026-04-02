import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    try {
      await signIn("anonymous");
    } catch (err) {
      setError("Could not continue as guest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="scanlines" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />

      <div className="absolute top-20 left-10 text-cyan-500/10 font-mono text-xs hidden md:block">
        {`> skill.forge --init`}
      </div>
      <div className="absolute bottom-20 right-10 text-amber-500/10 font-mono text-xs hidden md:block">
        {`[READY]`}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 md:mb-12 animate-fadeIn">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-cyan-400 rounded-lg flex items-center justify-center bg-cyan-400/5">
              <span className="text-cyan-400 text-lg md:text-xl">⚡</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-white tracking-tight">
              Skill<span className="text-cyan-400">Forge</span>
            </h1>
          </div>
          <p className="text-gray-500 font-mono text-xs md:text-sm tracking-wide">
            CRAFT CLAUDE & GROK SKILLS WITH AI
          </p>
        </div>

        {/* Auth Card */}
        <div
          className="bg-[#12121a] border border-gray-800 rounded-xl p-6 md:p-8 relative animate-slideUp"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

          <div className="flex gap-1 mb-6 md:mb-8 bg-[#0a0a0c] rounded-lg p-1">
            <button
              onClick={() => setFlow("signIn")}
              className={`flex-1 py-2.5 md:py-3 rounded-md font-mono text-xs md:text-sm transition-all ${
                flow === "signIn"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                  : "text-gray-500 hover:text-gray-400"
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => setFlow("signUp")}
              className={`flex-1 py-2.5 md:py-3 rounded-md font-mono text-xs md:text-sm transition-all ${
                flow === "signUp"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  : "text-gray-500 hover:text-gray-400"
              }`}
            >
              SIGN UP
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div>
              <label className="block text-gray-400 font-mono text-xs mb-2 tracking-wide">
                EMAIL
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-[#0a0a0c] border border-gray-700 rounded-lg px-4 py-3 md:py-3.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="forge@example.com"
              />
            </div>

            <div>
              <label className="block text-gray-400 font-mono text-xs mb-2 tracking-wide">
                PASSWORD
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full bg-[#0a0a0c] border border-gray-700 rounded-lg px-4 py-3 md:py-3.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <input name="flow" type="hidden" value={flow} />

            {error && (
              <div className="text-red-400 font-mono text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 md:py-4 rounded-lg font-mono text-sm tracking-wide transition-all ${
                flow === "signIn"
                  ? "bg-cyan-500 hover:bg-cyan-400 text-black"
                  : "bg-amber-500 hover:bg-amber-400 text-black"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? "PROCESSING..." : flow === "signIn" ? "ENTER THE FORGE" : "CREATE ACCOUNT"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <button
              onClick={handleAnonymous}
              disabled={isLoading}
              className="w-full py-3 md:py-3.5 rounded-lg font-mono text-xs md:text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 transition-all disabled:opacity-50"
            >
              CONTINUE AS GUEST →
            </button>
          </div>
        </div>

        <p className="text-center text-gray-600 font-mono text-xs mt-6 animate-fadeIn" style={{ animationDelay: "0.4s" }}>
          v1.0.0 // TERMINAL NOIR EDITION
        </p>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-gray-600 text-xs font-mono">
          Requested by @LBallz77283 · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}
