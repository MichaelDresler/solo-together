import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";


export default function Nav() {

  const {pathname} = useLocation()
  const slicedPathname = "/" + pathname.split('/')[1]
  console.log(slicedPathname)



  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

const routes = [
  { name: "Dashboard", link: "/dashboard" },
  { name: "Events", link: "/events" },
];

  if (!user) return null;
  return (
    <nav className="sticky  flex flex-col p-4 top-0 text-white h-screen w-64 shrink-0  bg-black/90">
      <h1 className="font-bold text-2xl tracking-tight">SoloTogether</h1>
      <ul className="flex flex-col gap-2 pt-5 w-full">
        {routes.map((route) => (
          <li className="flex w-full"  key={route.name}>
            <Link className={`p-2.5  w-full rounded-md font-medium ${slicedPathname === route.link? "bg-orange-500/20 text-orange-500" : "text-white/60"}`} to={route.link}>{route.name}</Link>
          </li>
        ))}
      </ul>
      <button className="w-fit absolute bottom-8 " onClick={logout}>
        logout
      </button>
    </nav>
  );
}
