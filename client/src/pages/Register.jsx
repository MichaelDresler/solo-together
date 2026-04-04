import { useContext, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { getApiUrl } from "../lib/api";

export default function Register() {
  const [err, setErr] = useState("");
  const [focused, setFocused] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    const formData = new FormData(e.target);
    const registrationInfo = {
      password: formData.get("password"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
    };
    try {
      const res = await fetch(getApiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationInfo),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Registration failed");
        return;
      }
      localStorage.setItem("token", data.token);
      login(data.token);
    } catch (err) {
      setErr("Network error");
      console.error(err.message);
    }
  };

  const fields = [
    { name: "firstName", label: "First name", type: "text", placeholder: "Jamie", autoComplete: "given-name", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /> },
    { name: "lastName", label: "Last name", type: "text", placeholder: "Kim", autoComplete: "family-name", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /> },
    { name: "email", label: "Email", type: "email", placeholder: "jamie@example.com", autoComplete: "email", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5A2.25 2.25 0 0 0 2.25 6.75m19.5 0v.243a2.25 2.25 0 0 1-.964 1.856l-7.5 5.25a2.25 2.25 0 0 1-2.572 0l-7.5-5.25A2.25 2.25 0 0 1 2.25 6.993V6.75" /> },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-stone-900 flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-orange-400 opacity-10 blur-3xl" />
        <div className="absolute top-1/3 -right-16 w-64 h-64 rounded-full bg-stone-600 opacity-40 blur-2xl" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-orange-400" />
            <span className="text-white font-semibold text-lg tracking-tight">SoloTogether</span>
          </div>
        </div>

        {/* Steps */}
        {/* <div className="relative z-10 space-y-6">
          <p className="text-stone-400 text-sm uppercase tracking-widest font-medium">How it works</p>
          <div className="flex flex-col gap-5">
            {[
              { step: "01", text: "Create your profile and list your interests" },
              { step: "02", text: "Browse upcoming events near you" },
              { step: "03", text: "Connect with solo attendees heading to the same show" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-4">
                <span className="text-orange-400 font-semibold text-sm tabular-nums">{step}</span>
                <p className="text-stone-300 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div> */}

        {/* Quote */}

        <div className="relative z-10">
          <blockquote className="text-stone-300 text-base leading-relaxed font-light italic">
            "I used to skip concerts because I didn't have anyone to go with.
            Now I have a concert crew in every city"
          </blockquote>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-600 flex items-center justify-center text-stone-300 text-xs font-semibold">
              JK
            </div>
            <div>
              <p className="text-white text-sm font-medium">Jamie Kim</p>
              <p className="text-stone-500 text-xs">Member since 2022</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-7 h-7 rounded-md bg-orange-400" />
          <span className="font-semibold text-lg tracking-tight text-stone-900">SoloTogether</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Create your account</h1>
            <p className="text-stone-500 text-sm mt-1.5">Find your people at the next show</p>
          </div>

          {/* Error banner */}
          {err && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-red-700 text-sm leading-snug">{err}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First + Last name row */}
            <div className="grid grid-cols-2 gap-3">
              {fields.slice(0, 2).map(({ name, label, type, placeholder, autoComplete, icon }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>
                  <div className={`relative rounded-xl border transition-all duration-150 ${focused === name ? "border-stone-400 shadow-sm ring-2 ring-stone-900/5" : "border-stone-200"} bg-white`}>
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg className={`w-4 h-4 transition-colors ${focused === name ? "text-stone-600" : "text-stone-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        {icon}
                      </svg>
                    </div>
                    <input
                      name={name}
                      type={type}
                      autoComplete={autoComplete}
                      placeholder={placeholder}
                      onFocus={() => setFocused(name)}
                      onBlur={() => setFocused(null)}
                      className="w-full pl-9 pr-3 py-3 bg-transparent text-stone-900 placeholder-stone-400 text-sm rounded-xl focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Username */}
            {fields.slice(2).map(({ name, label, type, placeholder, autoComplete, icon }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>
                <div className={`relative rounded-xl border transition-all duration-150 ${focused === name ? "border-stone-400 shadow-sm ring-2 ring-stone-900/5" : "border-stone-200"} bg-white`}>
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                    <svg className={`w-4 h-4 transition-colors ${focused === name ? "text-stone-600" : "text-stone-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      {icon}
                    </svg>
                  </div>
                  <input
                    name={name}
                    type={type}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    onFocus={() => setFocused(name)}
                    onBlur={() => setFocused(null)}
                    className="w-full pl-10 pr-4 py-3 bg-transparent text-stone-900 placeholder-stone-400 text-sm rounded-xl focus:outline-none"
                  />
                </div>
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
              <div className={`relative rounded-xl border transition-all duration-150 ${focused === "password" ? "border-stone-400 shadow-sm ring-2 ring-stone-900/5" : "border-stone-200"} bg-white`}>
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                  <svg className={`w-4 h-4 transition-colors ${focused === "password" ? "text-stone-600" : "text-stone-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  className="w-full pl-10 pr-11 py-3 bg-transparent text-stone-900 placeholder-stone-400 text-sm rounded-xl focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute inset-y-0 right-3.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-stone-900 hover:bg-stone-800 active:bg-stone-950 disabled:bg-stone-400 text-white font-medium text-sm py-3 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Sign in link */}
          <p className="text-center text-sm text-stone-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-stone-900 font-medium hover:underline underline-offset-2 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 flex items-center gap-5">
          {["Privacy", "Terms", "Security"].map((link) => (
            <button key={link} type="button" className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
              {link}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
