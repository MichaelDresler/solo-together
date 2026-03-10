import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ApiButton({
  method = "POST",
  endpoint,
  body,
  onSuccess,
  children,
  variant = "secondary",
  className = "",
}) {
  const { token } = useContext(AuthContext);

  async function handleClick() {
    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error(data?.error || "request failed");
        return;
      }

      if (onSuccess) onSuccess(data);
    } catch (e) {
      console.error("request failed", e);
    }
  }

  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]";

  const variants = {
    primary:
      "bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:ring-blue-500",

    secondary:
      "border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 focus:ring-blue-500",

    danger:
      "border border-red-400 bg-red-600 text-white hover:bg-red-700 hover:border-red-300 focus:ring-red-500",
  };

  return (
    <button
      onClick={handleClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}