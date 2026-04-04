import { useContext, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import GlobalSearchModal from "../components/GlobalSearchModal";
import Nav from "../components/Nav";

export default function RootLayout(){
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const initialQuery = useMemo(() => {
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get("q") || "";
    }, [location.search]);

    useEffect(() => {
        if (!user) {
            return undefined;
        }

        function isEditableTarget(target) {
            if (!(target instanceof HTMLElement)) {
                return false;
            }

            return (
                target.isContentEditable ||
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.tagName === "SELECT"
            );
        }

        function handleKeyDown(event) {
            if (isEditableTarget(event.target)) {
                return;
            }

            const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";

            if (!isShortcut) {
                return;
            }

            event.preventDefault();
            setIsSearchOpen(true);
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [user]);

    return(
        <>
            <div className="flex pt-20">
                <Nav onOpenSearch={() => setIsSearchOpen(true)} />
                <Outlet/>
            </div>
            {user ? (
                <GlobalSearchModal
                    key={`${initialQuery}:${isSearchOpen ? "open" : "closed"}`}
                    isOpen={isSearchOpen}
                    onClose={() => setIsSearchOpen(false)}
                    initialQuery={initialQuery}
                />
            ) : null}
        </>
    )
}
