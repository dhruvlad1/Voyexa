import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plane,
  Mail,
  Lock,
  User,
  ArrowRight,
  Phone,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true); // Start loading

    const url = isLogin
      ? "http://localhost:8080/api/users/login"
      : "http://localhost:8080/api/users/register";

    const payload = isLogin
      ? { email, password }
      : {
          name,
          email,
          password,
          phone_number: phoneNumber,
        };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();

      if (response.ok) {
        setSuccess(text);
        if (isLogin) {
          // Navigate to dashboard after a short delay to show success
          setTimeout(() => navigate("/dashboard"), 1200);
        } else {
          // Switch to login view after successful registration
          setTimeout(() => {
            setIsLogin(true);
            setSuccess("");
          }, 2000);
        }
      } else {
        setError(text);
      }
    } catch (err) {
      setError("Network error: Is the backend running?");
    } finally {
      setLoading(false); // Stop loading regardless of outcome
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[440px] bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 relative z-10 p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-6 shadow-xl shadow-indigo-200">
            <Plane className="text-white w-7 h-7 -rotate-45" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Voyexa
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            {isLogin
              ? "Your next journey starts here."
              : "Join the future of travel planning."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              {/* Full Name Field */}
              <div className="relative">
                <User className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Phone Number Field */}
              <div className="relative">
                <Phone className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required={!isLogin}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Email Field */}
          <div className="relative">
            <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Status Messages */}
          {error && (
            <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl text-xs font-bold animate-in fade-in zoom-in-95">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-xl text-xs font-bold animate-in fade-in zoom-in-95">
              <ShieldCheck size={16} /> {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-slate-950 hover:bg-black text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all mt-4 shadow-xl active:scale-[0.98] ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setSuccess("");
            }}
            disabled={loading}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4 transition-colors disabled:opacity-50"
          >
            {isLogin ? "Need an account? Sign up" : "Already a member? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
