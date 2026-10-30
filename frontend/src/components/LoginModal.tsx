import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginModal({
  onClose,
  onSuccess,
  message,
}: {
  onClose: () => void;
  onSuccess: () => void;
  message?: string;
}) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result =
        mode === "login"
          ? await login(identifier, password)
          : await signup(identifier, password, displayName, email);

      if (!result.ok) {
        setError(result.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to authenticate.");
      setLoading(false);
    }
  }



  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(33,29,24,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-paper border p-7 relative shadow-lg rounded-sm"
        style={{ borderColor: "#CBBFA0" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-inkSoft hover:text-ink transition p-1"
        >
          <X size={16} />
        </button>

        <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-moss mb-2">
          {mode === "login" ? "Log in" : "Create an account"}
        </div>
        <h2 className="font-display text-[26px] font-semibold text-ink mb-1">
          <span style={{ color: "#5fade8" }}>Dev</span><span style={{ color: "#133f61" }}>Logger</span>
        </h2>
        {message ? (
          <p className="font-body text-[13px] text-inkSoft mb-5 leading-relaxed">{message}</p>
        ) : (
          <p className="font-body text-[13px] text-inkSoft mb-5">
            {mode === "login"
              ? "Sign in to write and publish your thoughts."
              : "Register to begin writing your journal."}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block font-mono text-[11px] text-inkSoft mb-1">
              {mode === "login" ? "Username or Email" : "Username"}
            </label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-white/60 border px-3 py-2 text-[14px] outline-none font-body text-ink focus:border-ink"
              style={{ borderColor: "#CBBFA0" }}
              placeholder=" @username "
              autoFocus
              required
            />
          </div>

          {mode === "signup" && (
            <>
              <div>
                <label className="block font-mono text-[11px] text-inkSoft mb-1">
                  Display name
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-white/60 border px-3 py-2 text-[14px] outline-none font-body text-ink focus:border-ink"
                  style={{ borderColor: "#CBBFA0" }}
                  placeholder="myname"
                  required
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] text-inkSoft mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/60 border px-3 py-2 text-[14px] outline-none font-body text-ink focus:border-ink"
                  style={{ borderColor: "#CBBFA0" }}
                  placeholder="e.g. @example.com"
                />
              </div>
            </>
          )}

          <div>
            <label className="block font-mono text-[11px] text-inkSoft mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/60 border px-3 py-2 text-[14px] outline-none font-body text-ink focus:border-ink"
              style={{ borderColor: "#CBBFA0" }}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border text-[12px] text-brick font-mono" style={{ borderColor: "#7A3B2E" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 text-[13px] font-mono tracking-wide bg-ink text-paper hover:opacity-85 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            {loading ? "Processing..." : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode(mode === "login" ? "signup" : "login");
            }}
            className="font-mono text-[12px] text-inkSoft hover:text-ink transition underline"
          >
            {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>


      </div>
    </div>
  );
}
