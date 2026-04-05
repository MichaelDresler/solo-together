import { useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { canManageMembers } from "../lib/permissions";
import { AdminEventsSection } from "./AdminEvents";
import { AdminMembersSection } from "./AdminMembers";

const ADMIN_TABS = [
  { id: "members", label: "Members" },
  { id: "events", label: "Events" },
];

function getValidAdminTab(tab) {
  return ADMIN_TABS.some((item) => item.id === tab) ? tab : "members";
}

export default function Admin() {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = getValidAdminTab(searchParams.get("tab"));

  if (!canManageMembers(user)) {
    return (
      <main className="w-full p-6">
        <p className="text-red-600">
          You do not have permission to access admin tools.
        </p>
      </main>
    );
  }

  function handleTabChange(tab) {
    setSearchParams({ tab });
  }

  return (
    <main className="w-full p-6">
      <div className="mx-auto  bg space-y-6">
        <header className="space-y-2 bg max-w-6xl mx-auto ">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900">Admin</h1>

        </header>

        <div className=" border-b border-black/10 w-full ">
          <div className="flex  max-w-6xl gap-12 mx-auto">
            {ADMIN_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={` py-2 text-base border-b-2 font-medium transition ${
                    isActive
                      ? " border-black text-stone-900 "
                      : "text-stone-500 border-transparent hover:text-stone-800"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="max-w-6xl mx-auto">
          {activeTab === "events" ? (
            <AdminEventsSection />
          ) : (
            <AdminMembersSection />
          )}
        </div>
      </div>
    </main>
  );
}
