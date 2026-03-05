import { Outlet } from "react-router-dom";
import Nav from "../components/nav";

export default function RootLayout(){
    return(
        <div className="">
            <Nav/>
            <Outlet/>
        </div>
    )
}