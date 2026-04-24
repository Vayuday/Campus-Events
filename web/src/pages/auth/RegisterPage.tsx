import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { apiErrorMessage } from "../../api/client";
import type { Role } from "../../api/types";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("organizer");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await register(name, email, password, role);
      toast.success("Account created");
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
            Create an account
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organizer or admin access
          </p>
        </div>

        <form onSubmit={onSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              required
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              minLength={6}
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Role</label>
            <select
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
              <option value="student">Student</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Students typically use the mobile app; you'll see an info page
              here.
            </p>
          </div>
          <button className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Creating…" : "Create account"}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
