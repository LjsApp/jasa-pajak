import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { adminLogin } from "@/lib/store";
import { AlertTriangle } from "lucide-react";

const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 60;

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Login Admin — LJS" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Rate limiting state
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          setAttempts(0); // Reset attempts setelah cooldown selesai
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const isBlocked = cooldown > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) return;

    setLoading(true);
    setErr("");
    const ok = await adminLogin(username, password);
    setLoading(false);

    if (ok) {
      navigate({ to: "/laporan" });
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setCooldown(COOLDOWN_SECONDS);
        setErr(`Terlalu banyak percobaan. Coba lagi dalam ${COOLDOWN_SECONDS} detik.`);
      } else {
        const remaining = MAX_ATTEMPTS - newAttempts;
        setErr(`Username atau password salah. ${remaining} percobaan tersisa.`);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-card border rounded-2xl shadow-lg p-8 space-y-5">
        <div className="text-center space-y-2">
          <img src="/logo.jpeg" alt="LJS" className="h-20 w-20 object-contain mx-auto mb-2" />
          <h1 className="text-2xl font-bold">Login Admin</h1>
          <p className="text-sm text-muted-foreground">Masuk untuk mengelola sistem.</p>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              required
              autoFocus
              disabled={isBlocked}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              required
              disabled={isBlocked}
            />
          </label>
        </div>

        {err && (
          <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{err}</span>
          </div>
        )}

        {isBlocked && (
          <div className="text-center text-sm text-muted-foreground bg-muted rounded-md py-2">
            Tunggu <span className="font-bold tabular-nums">{cooldown}s</span> sebelum mencoba lagi
          </div>
        )}

        {/* Indikator percobaan tersisa */}
        {attempts > 0 && !isBlocked && (
          <div className="flex gap-1 justify-center">
            {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  i < attempts ? "bg-destructive" : "bg-muted"
                }`}
              />
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || isBlocked}
          className="w-full px-4 py-2.5 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Memverifikasi…" : isBlocked ? `Tunggu ${cooldown}s` : "Login"}
        </button>
      </form>
    </div>
  );
}