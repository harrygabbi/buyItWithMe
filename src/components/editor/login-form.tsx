"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      <Card className="auth-card">
        <div className="brand">
          OpenHouse <span className="brand-ai">AI</span>
        </div>
        <h1>{register ? "Create your workspace" : "Welcome back"}</h1>
        <p>Private property management for realtors.</p>
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
    </div>
  );
}
