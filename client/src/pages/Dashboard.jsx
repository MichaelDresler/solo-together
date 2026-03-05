import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="text-white bg-amber-300 pt-24 ">
      <h1>Dashboard</h1>
      <p>Logged in as: {user?.username}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}