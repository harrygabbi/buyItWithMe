"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, House, ShieldCheck } from "lucide-react";
import Image from "next/image";
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
        <Image src="/images/house.jpg" alt="Contemporary home with an open terrace and pool" fill sizes="(max-width: 700px) 100vw, 55vw" preload className="auth-story-image" />
        <div className="brand"><House size={26} aria-hidden="true" /> OpenHouse <span className="brand-ai">AI</span></div>
        <div className="auth-story-copy">
          <span className="eyebrow">A HOME FOR YOUR NEXT CHAPTER</span>
          <h2 id="auth-story-title">Every home has a story.<br />Start yours here.</h2>
          <p>The details, the preparation, the possibilities.<br />All together in your private property workspace.</p>
        </div>
        <span className="auth-story-caption">Considered spaces. Exceptional possibilities.</span>
      </section>
      <div className="auth-form-side">
      <div className="auth-access-label">OPENHOUSE / AGENT WORKSPACE</div>
      <Card className="auth-card">
        <h1>{register ? "Create your workspace" : "Welcome back"}</h1>
        <p>{register ? "A place for your properties, from the very first detail." : "Sign in to manage your properties and prepare for what’s next."}</p>
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
            {!busy && <ArrowRight size={16} aria-hidden="true" />}
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
