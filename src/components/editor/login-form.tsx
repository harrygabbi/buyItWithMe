"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, House, Layers3, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { ArchitectureScene } from "@/components/architecture-scene";
export function LoginForm() {
  const router = useRouter();
  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="auth-page">
      <section className="auth-story" aria-labelledby="auth-story-title">
        <div className="brand"><span className="brand-mark"><House size={23} aria-hidden="true" /></span>OpenHouse <span className="brand-ai">AI</span></div>
        <div className="auth-story-copy">
          <span className="hero-kicker"><Sparkles size={13} aria-hidden="true" /> THE FUTURE FEELS LIKE HOME</span>
          <h2 id="auth-story-title">A better perspective.<br /><span>On every property.</span></h2>
          <p>One beautiful workspace to bring every detail together. Prepare with confidence. Open the door to what’s next.</p>
        </div>
        <ArchitectureScene />
        <div className="auth-story-footer"><span><ShieldCheck size={16} aria-hidden="true" /> Private by design</span><span><Layers3 size={16} aria-hidden="true" /> Built for realtors</span></div>
      </section>
      <div className="auth-form-side">
      <div className="auth-access-label"><span className="signal-dot" /> YOUR PRIVATE WORKSPACE</div>
      <Card className="auth-card">
        <span className="auth-lock"><LockKeyhole size={23} aria-hidden="true" /></span>
        <h1>{register ? "Create your workspace" : "Welcome back"}</h1>
        <p>{register ? "Your next chapter starts here." : "Your properties. Your possibilities. All here."}</p>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            try {
              const response = await fetch(
                `/api/auth/${register ? "register" : "login"}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email,
                    password,
                    ...(register ? { name } : {}),
                  }),
                },
              );
              const data = await response.json();
              if (!response.ok)
                throw new Error(
                  data.issues
                    ?.map((i: { message: string }) => i.message)
                    .join(" ") || data.error,
                );
              router.replace("/dashboard");
              router.refresh();
            } catch (e) {
              setError((e as Error).message);
              setBusy(false);
            }
          }}
        >
          {register && (
            <div className="form-field">
              <label htmlFor="auth-name">Your name</label>
              <input
                className="field"
                id="auth-name"
                required
                maxLength={120}
                autoComplete="name"
                placeholder="Alex Morgan"
                value={name}
                disabled={busy}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div className="form-field">
            <label htmlFor="auth-email">Email</label>
            <input
              className="field"
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@yourbrokerage.com"
              value={email}
              disabled={busy}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="auth-password">Password</label>
            <input
              className="field"
              id="auth-password"
              type="password"
              placeholder="Enter your password"
              required
              minLength={12}
              maxLength={128}
              autoComplete={register ? "new-password" : "current-password"}
              value={password}
              disabled={busy}
              onChange={(e) => setPassword(e.target.value)}
            />
            <small>At least 12 characters.</small>
          </div>
          {error && (
            <div className="form-failure" role="alert">
              {error}
            </div>
          )}
          <Button type="submit" disabled={busy}>
            {busy ? "Please wait…" : register ? "Create account" : "Sign in"}
            {!busy && <ArrowUpRight size={16} aria-hidden="true" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              setRegister(!register);
              setError("");
            }}
          >
            {register
              ? "Already have an account? Sign in"
              : "Create an account"}
          </Button>
        </form>
      </Card>
      <p className="auth-footnote"><ShieldCheck size={13} aria-hidden="true" /> A secure space for your property portfolio.</p>
      </div>
    </div>
  );
}
