import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useEffect } from "react";

export default function Nav() {
  const { user } = useContext(AuthContext);

  if (!user) return null;
  return <nav className="w-full fixed h-20 bg-amber-800">hello</nav>;
}
