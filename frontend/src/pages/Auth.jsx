import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, Mail, Lock, User, ArrowRight } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const url = isLogin
        ? "http://localhost:8080/api/users/login"
        : "http://localhost:8080/api/users/register";

    const payload = isLogin
        ? { email, password }
        : { name, email, password, phone_number: "1234567890" };

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
          // Optionally, wait a moment before navigating
          setTimeout(() => navigate("/dashboard"), 1000);
        }
      } else {
        setError(text);
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        {/* Aurora Blurs for Depth */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-[440px] bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 relative z-10 p-10">
          <div className="text-center mb-10">
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
                <div className="relative">
                  <User className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                  <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                  />
                </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <input
                  type="password"
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-500 text-sm">{success}</div>}

            <button
                type="submit"
                className="w-full bg-slate-950 hover:bg-black text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all mt-4 shadow-xl active:scale-[0.98]"
            >
              {isLogin ? "Sign In" : "Create Account"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setSuccess("");
                }}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
            >
              {isLogin ? "Need an account? Sign up" : "Already a member? Log in"}
            </button>
          </div>
        </div>
      </div>
  );
};

export default Auth;
