import { useState } from "react";

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const loginInfo = {
      username: formData.get("username"),
      password: formData.get("password"),
    };
    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginInfo),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }
      localStorage.setItem("token", data.token);
      console.log("logged in:", data.user);
    } catch (err) {
      console.error(err.message);
    }

      setLoading(false);
  };

  return (
    <div className="flex  items-center justify-center h-screen">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          name="username"
          type="text"
          className="w-100 h-12 bg-white/20 border border-white/30"
        />
        <input
          type="text"
          name="password"
          className="w-100 h-12 bg-white/20 border border-white/30"
        />

        <button disabled={loading} type="submit">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
