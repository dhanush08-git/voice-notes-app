import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const url = isLogin
        ? "http://voice-notes-app-rqja.onrender.com/api/auth/login"
        : "http://voice-notes-app-rqja.onrender.com/api/auth/register";
      const res = await axios.post(url, form);
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full opacity-20 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full opacity-20 blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="relative bg-white rounded-2xl shadow-xl shadow-slate-200 p-8 w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
              <line x1="12" y1="18" x2="12" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="22" x2="16" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">AI Voice Notes</h1>
          <p className="text-sm text-slate-400 mt-1">
            {isLogin ? "Welcome back! Sign in to continue." : "Create your free account."}
          </p>
        </div>

        {/* Toggle tabs */}
        <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
          {["Login", "Register"].map((label) => {
            const active = isLogin ? label === "Login" : label === "Register";
            return (
              <button
                key={label}
                id={`auth-tab-${label.toLowerCase()}`}
                onClick={() => { setIsLogin(label === "Login"); setError(""); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  active
                    ? "bg-white shadow text-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Form fields */}
        <div className="space-y-3">
          {!isLogin && (
            <div>
              <label htmlFor="auth-name" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Full Name</label>
              <input
                id="auth-name"
                type="text"
                placeholder="Jane Smith"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onKeyDown={handleKey}
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Email</label>
            <input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onKeyDown={handleKey}
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Password</label>
            <input
              id="auth-password"
              type="password"
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={handleKey}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          id="auth-submit-btn"
          onClick={handleSubmit}
          disabled={loading}
          className="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 hover:-translate-y-0.5"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="spin-slow w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeDasharray="60 20" d="M12 2a10 10 0 1 0 10 10" />
              </svg>
              {isLogin ? "Signing in…" : "Creating account…"}
            </span>
          ) : isLogin ? "Sign in" : "Create Account"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400 font-medium">or continue with</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        {/* Google OAuth */}
        <a
          id="google-auth-btn"
          href="http://localhost:5000/api/auth/google"
          className="flex items-center justify-center gap-3 w-full border border-slate-200 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            className="w-5 h-5"
            alt="Google logo"
          />
          Google
        </a>

        <p className="text-center text-xs text-slate-400 mt-6">
          By continuing, you agree to our{" "}
          <span className="text-blue-500 cursor-pointer hover:underline">Terms</span> &{" "}
          <span className="text-blue-500 cursor-pointer hover:underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}