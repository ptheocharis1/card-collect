"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function getErrorMessage(data: any): string {
  const detail = data?.detail ?? data?.error;

  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || "Validation error").join(", ");
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (detail && typeof detail === "object" && "msg" in detail) {
    return String(detail.msg);
  }

  return "Registration failed";
}

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(getErrorMessage(data));
        return;
      }

      router.push("/login");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark">FC</div>
          <div className="brand-copy">
            <span className="brand-title">Freak Collector V1</span>
            <span className="brand-subtitle">Start your collection</span>
          </div>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">
          Set up your collector profile and start organizing your cards.
        </p>

        <form onSubmit={handleSubmit} className="stack" style={{ marginTop: 24 }}>
          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="label">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              className="input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
              required
            />
          </div>

          {error ? (
            <div
              className="panel"
              style={{
                borderColor: "rgba(239,68,68,0.35)",
                color: "#fecaca",
              }}
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="button button-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>

          <div className="row-between">
            <span className="page-description">Already have an account?</span>

            <Link href="/login" className="nav-link nav-link-active">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}