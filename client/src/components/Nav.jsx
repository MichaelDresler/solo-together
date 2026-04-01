import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import UserAvatar from "./UserAvatar";

export default function Nav() {
  const { pathname } = useLocation();
  const slicedPathname = "/" + pathname.split("/")[1];
  const { user, logout } = useContext(AuthContext);
  console.log(slicedPathname);

  const isEventsPage = slicedPathname === "/events";
  const isAuthenticated = !!user;

  const routes = [
    { name: "Dashboard", link: "/dashboard" },
    { name: "Discover", link: "/discover" },
    { name: "Profile", link: "/profile" },
  ];

  if (!isAuthenticated && isEventsPage) {
    return (
      <nav className="fixed  flex flex-row p-4 top-0 justify-between  w-full  bg-white border-b border-black/10">
        <h1 className="flex items-center font-bold w-full text-2xl text-black tracking-tight">
          SoloTogether
        </h1>

        <ul className="flex flex-row gap-2  w-full  justify-center space-x-4">
          {routes.map((route) => (
            <li className="flex  text-black/60 " key={route.name}>
              <Link
                className={`p-2.5  text-center rounded-md font-medium `}
                to={route.link}
              >
                {route.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="w-full flex items-center justify-end ">
          <Link
            className={`py-2 px-8 rounded-full font-semibold text-white  bg-[#CF5812] hover:bg-[#b35119] duration-200 `}
            to={"/login"}
          >
            login
          </Link>
        </div>
        {/* <Link
          className={`p-2.5  w-full rounded-md font-medium `}
          to={"/Register"}
        >
          Register
        </Link> */}
      </nav>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  //if logged in display this instead
  return (
    <nav className="sticky  flex flex-col p-4 top-0 text-white h-screen w-64 shrink-0  bg-black/90">
      <h1 className="font-bold text-2xl tracking-tight">SoloTogether</h1>
      <div className="mt-6 flex items-center gap-3 rounded-xl bg-white/5 p-3">
        <UserAvatar user={user} size={40} className="h-10 w-10" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="truncate text-xs text-white/60">@{user?.username}</p>
        </div>
      </div>
      <ul className="flex flex-col gap-2 pt-5 w-full">
        {routes.map((route) => (
          <li className="flex w-full" key={route.name}>
            <Link
              className={`p-2.5  w-full rounded-md font-medium ${slicedPathname === route.link ? "bg-orange-500/20 text-orange-500" : "text-white/60"}`}
              to={route.link}
            >
              {route.name}
            </Link>
          </li>
        ))}
      </ul>
      <button className="w-fit absolute bottom-8 " onClick={logout}>
        logout
      </button>
    </nav>
  );
}
