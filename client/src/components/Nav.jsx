import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import UserAvatar from "./UserAvatar";
import { getUserDisplayName } from "../utils/avatar";
import { canManageMembers } from "../lib/permissions";

export default function Nav({ onOpenSearch }) {
  const { pathname } = useLocation();
  const slicedPathname = "/" + pathname.split("/")[1];
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isAuthenticated = !!user;
  const showAdminLink = canManageMembers(user);

  const authenticatedRoutes = [
    { name: "Dashboard", link: "/dashboard" },
    {
      name: "Discover",
      link: "/discover",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 16 16">
          <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M2 7.997a5.997 5.997 0 1 1 11.995 0A5.997 5.997 0 0 1 2 7.997M7.997.5a7.497 7.497 0 1 0 0 14.995A7.497 7.497 0 0 0 7.997.5m3.323 5.084a.75.75 0 0 0-.91-.91l-3.548.888c-.64.16-1.14.66-1.3 1.3l-.888 3.549a.75.75 0 0 0 .91.91l3.548-.888c.64-.16 1.14-.66 1.3-1.3zM7.226 7.017l2.335-.584-.583 2.335a.29.29 0 0 1-.21.21l-2.335.584.584-2.336a.29.29 0 0 1 .21-.21"
          ></path>
        </svg>
      ),
    },
  ];

  const publicRoutes = [
    { name: "Home", link: "/" },
    { name: "Discover", link: "/discover" },
    { name: "Search", link: "/search" },
  ];

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

  if (!isAuthenticated && ["/", "/discover", "/search"].includes(slicedPathname)) {
    return (
      <nav className="fixed top-0 z-40 flex w-full flex-row justify-between border-b border-black/10 bg-white p-2">
        <h1 className="flex w-full items-center text-2xl font-bold tracking-tight text-black">
          SoloTogether
        </h1>

        <ul className="flex w-full flex-row justify-center gap-2 space-x-4">
          {publicRoutes.map((route) => (
            <li className="flex text-sm text-black/60" key={route.name}>
              <Link
                className="rounded-md p-2.5 flex flex-row text-center font-medium hover:text-black"
                to={route.link}
              >
                {route.icon}
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
    <nav className="fixed top-0 z-40 flex w-full items-center justify-between border-b border-black/10 bg-white  px-4">
      <h1 className="flex w-full items-center text-2xl font-bold tracking-tight text-black">
        SoloTogether
      </h1>

      <ul className="flex w-full flex-row justify-center gap-2 space-x-4">
        {authenticatedRoutes.map((route) => (
          <li className="flex text-sm text-black/60" key={route.name}>
            <Link
              className={`rounded-md p-2.5  flex flex-row  justify-center font-bold tracking-tight items-center gap-1 text-center hover:text-black ${
                slicedPathname === route.link
                  ? "text-[#CF5812]"
                  : "text-black/60"
              }`}
              to={route.link}
            >
              {route.icon}
              {route.name}
            </Link>
          </li>
        ))}
        <li className="flex text-sm text-black/60">
          <button
            type="button"
            onClick={onOpenSearch}
            className={`flex flex-row items-center justify-center gap-1 rounded-md p-2.5 text-center font-bold tracking-tight transition hover:text-black ${
              slicedPathname === "/search" ? "text-[#CF5812]" : "text-black/60"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="size-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0a7 7 0 0 1 14 0Z"
              />
            </svg>
            Search
          </button>
        </li>
      </ul>

      <div className="flex w-full items-center justify-end gap-1.5">
        <Link
          to="/create-event"
          className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-semibold text-stone-900 transition hover:text-black"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            className="size-4"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M7.25 3a.75.75 0 0 1 1.5 0v4.25H13a.75.75 0 0 1 0 1.5H8.75V13a.75.75 0 0 1-1.5 0V8.75H3a.75.75 0 0 1 0-1.5h4.25z"
            />
          </svg>
          <span className="tracking-tight text-black/60 hover:text-black duration-200">Create Event</span>
        </Link>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            className={`rounded-full p-2 transition  hover:bg-black/5 duration-400 cursor-pointer`}
          >
            <UserAvatar
              user={user}
              size={32}
              className="  border border-stone-200"
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
                <p className="truncate text-xs text-stone-500">
                  {user?.email || `@${user?.username}`}
                </p>
              </div>
            </div>

            <div className="mt-2 space-y-1">
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
              >
                View profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
              >
                Settings
              </Link>
              {showAdminLink ? (
                <>
                  <Link
                    to="/admin/events"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
                  >
                    Manage events
                  </Link>
                  <Link
                    to="/admin/members"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
                  >
                    Manage members
                  </Link>
                </>
              ) : null}
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
