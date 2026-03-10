import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";


export default function Dashboard() {
  const { user, logout, token } = useContext(AuthContext);

  return (
    <main className="p-6 space-y-8 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome, {user?.username}</h1>
      </div>

    </main>
  );
}
