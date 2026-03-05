import { useContext, useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [err, setErr] = useState("");
  const { login, loading, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect (()=>{
    if(user && !loading){
      navigate("/dashboard")
    }

  },[user, loading, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const loginInfo = {
      username: formData.get("username"),
      password: formData.get("password"),
    };
    try {
      //send fetch req and wait for response
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginInfo),
      });

      const data = await res.json();
      if (!res.ok) {
        setErr(data.error);
        throw new Error(data.error);
      } 
      localStorage.setItem("token", data.token);
      console.log("logged in:", data.user);

      login(data.token); // updates context + localStorage
      navigate("/dashboard");
    } catch (err) {
      console.error(err.message);
    }

    // setLoading(false);
  };

  return (
    <div className="flex flex-col  max-w-xl mx-auto justify-center h-screen">
      <div className="text-red-500">{err}</div>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          name="username"
          type="text"
          className="w-full h-12 bg-white/20 border border-white/30"
        />
        <input
          type="text"
          name="password"
          className="w-full h-12 bg-white/20 border border-white/30"
        />

        <button className="bg-blue-600 h-14" disabled={loading} type="submit">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
