import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import {
  Plane,
  Mail,
  Lock,
  User,
  ArrowRight,
  Phone,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
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
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";

  useEffect(() => {
    if (location.state?.loginRequired) {
      setError("Please log in to continue.");
    }
  }, [location.state]);

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
          if (data?.email) {
            localStorage.setItem("voyexa_user_email", data.email);
          }
          if (data?.phone_number) {
            localStorage.setItem("voyexa_user_phone", data.phone_number);
          }
          setSuccess(data?.message || "Login successful.");
          const requestedPath = location.state?.requestedPath;
          const requestedState = location.state?.requestedState;
          navigate(requestedPath || "/dashboard", requestedState ? { state: requestedState } : undefined);
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
        className={`w-full max-w-[440px] rounded-[2.5rem] relative z-10 p-10 transition-all duration-700 ease-out animate-in fade-in slide-in-from-bottom-10 duration-1000 ${
          isDarkTheme
            ? "bg-[#0f172a] border border-slate-800 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] hover:border-indigo-500/30 hover:shadow-[0_0_40px_rgba(79,70,229,0.15)]"
            : "bg-sky-50/95 border border-blue-200 shadow-[0_20px_50px_-20px_rgba(30,64,175,0.35)] hover:border-blue-400/60 hover:shadow-[0_0_36px_rgba(59,130,246,0.18)]"
        }`}
      >
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 shadow-xl group cursor-default ${
              isDarkTheme ? "bg-indigo-600 shadow-indigo-500/40" : "bg-blue-600 shadow-blue-500/30"
            }`}
          >
            <Plane className="text-white w-7 h-7 -rotate-45 group-hover:scale-110 transition-transform" />
          </div>
          <h1 className={`text-4xl font-black tracking-tight ${isDarkTheme ? "text-white" : "text-slate-900"}`}>
            Voyexa
          </h1>
          <p className={`mt-2 text-sm font-medium ${isDarkTheme ? "text-slate-400" : "text-slate-600"}`}>
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
                  className={`absolute left-4 top-4 w-5 h-5 transition-colors duration-300 ${
                    name ? (isDarkTheme ? "text-indigo-400" : "text-blue-600") : (isDarkTheme ? "text-slate-500" : "text-slate-500")
                  }`}
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 transition-all font-medium ${
                    isDarkTheme
                      ? "bg-[#1e293b] border border-slate-700 focus:ring-indigo-500 focus:bg-[#242f44] text-white placeholder:text-slate-500"
                      : "bg-white border border-blue-200 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-500"
                  }`}
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="relative">
                <Phone
                  className={`absolute left-4 top-4 w-5 h-5 transition-colors duration-300 ${
                    phoneNumber ? (isDarkTheme ? "text-indigo-400" : "text-blue-600") : (isDarkTheme ? "text-slate-500" : "text-slate-500")
                  }`}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  maxLength={10}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 transition-all font-medium ${
                    isDarkTheme
                      ? "bg-[#1e293b] border border-slate-700 focus:ring-indigo-500 focus:bg-[#242f44] text-white placeholder:text-slate-500"
                      : "bg-white border border-blue-200 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-500"
                  }`}
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
              className={`absolute left-4 top-4 w-5 h-5 transition-colors duration-300 ${
                email ? (isDarkTheme ? "text-indigo-400" : "text-blue-600") : (isDarkTheme ? "text-slate-500" : "text-slate-500")
              }`}
            />
            <input
              type="email"
              placeholder="Email Address"
              className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 transition-all font-medium ${
                isDarkTheme
                  ? "bg-[#1e293b] border border-slate-700 focus:ring-indigo-500 focus:bg-[#242f44] text-white placeholder:text-slate-500"
                  : "bg-white border border-blue-200 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-500"
              }`}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock
              className={`absolute left-4 top-4 w-5 h-5 transition-colors duration-300 ${
                password ? (isDarkTheme ? "text-indigo-400" : "text-blue-600") : (isDarkTheme ? "text-slate-500" : "text-slate-500")
              }`}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className={`w-full pl-12 pr-12 py-4 rounded-2xl outline-none focus:ring-2 transition-all font-medium ${
                isDarkTheme
                  ? "bg-[#1e293b] border border-slate-700 focus:ring-indigo-500 focus:bg-[#242f44] text-white placeholder:text-slate-500"
                  : "bg-white border border-blue-200 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-500"
              }`}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className={`absolute right-4 top-4 transition-colors ${
                isDarkTheme ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-700"
              }`}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div
              className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold border animate-shake ${
                isDarkTheme
                  ? "text-red-200 bg-red-900/30 border-red-500/20"
                  : "text-red-700 bg-red-50 border-red-200"
              }`}
            >
              <AlertCircle size={16} className={isDarkTheme ? "text-red-400" : "text-red-600"} /> {error}
            </div>
          )}
          {success && (
            <div
              className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold border ${
                isDarkTheme
                  ? "text-emerald-200 bg-emerald-900/30 border-emerald-500/20"
                  : "text-emerald-700 bg-emerald-50 border-emerald-200"
              }`}
            >
              <ShieldCheck size={16} className={isDarkTheme ? "text-emerald-400" : "text-emerald-600"} /> {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full group font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all mt-4 active:scale-[0.98] ${
              isDarkTheme
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
            } ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            {!loading && (
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </form>

        <div className={`mt-8 text-center border-t pt-6 ${isDarkTheme ? "border-slate-800/50" : "border-blue-200"}`}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setSuccess("");
            }}
            disabled={loading}
            className={`text-sm font-bold transition-colors disabled:opacity-50 ${
              isDarkTheme ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isLogin ? "Need an account? Sign up" : "Already a member? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
