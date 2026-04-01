import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import UserAvatar from "./UserAvatar";
import { getUserDisplayName } from "../utils/avatar";

export default function Nav() {
  const { pathname } = useLocation();
  const slicedPathname = "/" + pathname.split("/")[1];
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isEventsPage = slicedPathname === "/discover";
  const isAuthenticated = !!user;

  const authenticatedRoutes = [
    { name: "Dashboard", link: "/dashboard" },
    { name: "Discover", link: "/discover" },
  ];

  const publicRoutes = [{ name: "Discover", link: "/discover" }];

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  if (!isAuthenticated && isEventsPage) {
    return (
      <nav className="fixed top-0 z-40 flex w-full flex-row justify-between border-b border-black/10 bg-white p-2">
        <h1 className="flex w-full items-center text-2xl font-bold tracking-tight text-black">
          SoloTogether
        </h1>

        <ul className="flex w-full flex-row justify-center gap-2 space-x-4">
          {publicRoutes.map((route) => (
            <li className="flex text-sm text-black/60" key={route.name}>
              <Link
                className="rounded-md p-2.5 text-center font-medium hover:text-black"
                to={route.link}
              >
                {route.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex w-full items-center justify-end">
          <Link
            className="rounded-full bg-[#CF5812] px-8 py-2 font-semibold text-white duration-200 hover:bg-[#b35119]"
            to="/login"
          >
            login
          </Link>
        </div>
      </nav>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="fixed top-0 z-40 flex w-full items-center justify-between border-b border-black/10 bg-white p-2">
      <h1 className="flex w-full items-center text-2xl font-bold tracking-tight text-black">
        SoloTogether
      </h1>

      <ul className="flex w-full flex-row justify-center gap-2 space-x-4">
        {authenticatedRoutes.map((route) => (
          <li className="flex text-sm text-black/60" key={route.name}>
            <Link
              className={`rounded-md p-2.5 text-center font-medium hover:text-black ${
                slicedPathname === route.link ? "text-[#CF5812]" : "text-black/60"
              }`}
              to={route.link}
            >
              {route.name}
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex w-full items-center justify-end">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            className={`rounded-full p-1 transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#CF5812]/30 ${
              isMenuOpen ? "bg-stone-100" : "hover:bg-stone-100"
            }`}
          >
            <UserAvatar
              user={user}
              size={40}
              className="h-10 w-10 border border-stone-200"
              textClassName="text-sm"
            />
          </button>

          <div
            role="menu"
            className={`absolute right-0 top-full mt-3 w-72 origin-top-right rounded-2xl border border-stone-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.16)] transition-all duration-200 ${
              isMenuOpen
                ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                : "pointer-events-none -translate-y-1 scale-95 opacity-0"
            }`}
          >
            <div className="flex items-center gap-3 rounded-xl bg-stone-50 px-3 py-3">
              <UserAvatar
                user={user}
                size={48}
                className="h-12 w-12"
                textClassName="text-sm"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-stone-900">
                  {getUserDisplayName(user)}
                </p>
                <p className="truncate text-xs text-stone-500">@{user?.username}</p>
              </div>
            </div>

            <div className="mt-2 space-y-1">
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-900"
              >
                View profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-900"
              >
                Settings
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  logout();
                }}
                className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#CF5812] transition hover:bg-orange-50 hover:text-[#b35119]"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
