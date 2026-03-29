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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isLogin && phoneNumber.length !== 10) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    setLoading(true);

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

      if (isLogin) {
        const contentType = response.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
          ? await response.json()
          : { message: await response.text() };

        if (response.ok) {
          if (data?.userId !== undefined && data?.userId !== null) {
            localStorage.setItem("voyexa_user_id", String(data.userId));
          }
          if (data?.name) {
            localStorage.setItem("voyexa_user_name", data.name);
          }
          setSuccess(data?.message || "Login successful.");
          setTimeout(() => navigate("/dashboard"), 1200);
        } else {
          setError(data?.message || "Login failed.");
        }
      } else {
        const text = await response.text();

        if (response.ok) {
          setSuccess(text);
          setTimeout(() => {
            setIsLogin(true);
            setSuccess("");
            setName("");
            setPhoneNumber("");
          }, 2000);
        } else {
          setError(text);
        }
      }
    } catch (err) {
      setError("Network error: Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-transparent overflow-hidden">
      {/* 1. ANIMATION: animate-in fade-in slide-in-from-bottom-8 (Tailwind standard or custom CSS)
          2. HOVER EFFECT: hover:border-indigo-500/50 and hover:shadow-indigo-500/10 
      */}
      <div
        className="w-full max-w-[440px] bg-[#0f172a] rounded-[2.5rem] 
                      shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] 
                      border border-slate-800 relative z-10 p-10 
                      transition-all duration-700 ease-out
                      hover:border-indigo-500/30 hover:shadow-[0_0_40px_rgba(79,70,229,0.15)]
                      animate-in fade-in slide-in-from-bottom-10 duration-1000"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-6 shadow-xl shadow-indigo-500/40 group cursor-default">
            <Plane className="text-white w-7 h-7 -rotate-45 group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Voyexa
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            {isLogin
              ? "Your next journey starts here."
              : "Join the future of travel planning."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="relative group">
                {/* 3. DYNAMIC ICONS: Color changes when user has typed (value exists) */}
                <User
                  className={`absolute left-4 top-4 w-5 h-5 transition-colors duration-300 ${name ? "text-indigo-400" : "text-slate-500"}`}
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full pl-12 pr-4 py-4 bg-[#1e293b] border border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-[#242f44] transition-all text-white placeholder:text-slate-500 font-medium"
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="relative">
                <Phone
                  className={`absolute left-4 top-4 w-5 h-5 transition-colors duration-300 ${phoneNumber ? "text-indigo-400" : "text-slate-500"}`}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  maxLength={10}
                  className="w-full pl-12 pr-4 py-4 bg-[#1e293b] border border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-[#242f44] transition-all text-white placeholder:text-slate-500 font-medium"
                  required={!isLogin}
                  value={phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setPhoneNumber(val);
                  }}
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail
              className={`absolute left-4 top-4 w-5 h-5 transition-colors duration-300 ${email ? "text-indigo-400" : "text-slate-500"}`}
            />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-4 bg-[#1e293b] border border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-[#242f44] transition-all text-white placeholder:text-slate-500 font-medium"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock
              className={`absolute left-4 top-4 w-5 h-5 transition-colors duration-300 ${password ? "text-indigo-400" : "text-slate-500"}`}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-12 pr-4 py-4 bg-[#1e293b] border border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-[#242f44] transition-all text-white placeholder:text-slate-500 font-medium"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-200 bg-red-900/30 p-3 rounded-xl text-xs font-bold border border-red-500/20 animate-shake">
              <AlertCircle size={16} className="text-red-400" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-emerald-200 bg-emerald-900/30 p-3 rounded-xl text-xs font-bold border border-emerald-500/20">
              <ShieldCheck size={16} className="text-emerald-400" /> {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full group bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all mt-4 shadow-lg shadow-indigo-900/20 active:scale-[0.98] ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            {!loading && (
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-800/50 pt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setSuccess("");
            }}
            disabled={loading}
            className="text-sm font-bold text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            {isLogin ? "Need an account? Sign up" : "Already a member? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
