import { Outlet } from "react-router-dom";

export default function RootLayout(){
    return(
        <div className="bg-green-600">
            <Outlet/>
        </div>
    )
}