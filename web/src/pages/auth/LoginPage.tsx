import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { apiErrorMessage } from "../../api/client";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome, ${user.name}`);
      const dest =
        user.role === "admin"
          ? "/admin"
          : user.role === "organizer"
            ? "/organizer"
            : "/student";
      nav(dest, { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-brand-50 via-white to-slate-100 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-brand-600 text-white font-semibold items-center justify-center text-xl shadow-soft">
            CE
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Sign in to Campus Events
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organizer and admin dashboard
          </p>
        </div>

        <form onSubmit={onSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              autoFocus
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@campus.edu"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            className="btn-primary w-full"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 mt-4">
          New here?{" "}
          <Link to="/register" className="text-brand-600 hover:text-brand-700 font-medium">
            Create an account
          </Link>
        </div>

        <div className="mt-8 text-xs text-slate-400 text-center">
          Demo · admin@campus.edu / Admin@123 · organizer@campus.edu / Organizer@123
        </div>
      </div>
    </div>
  );
}
