import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/auth-context";
import EventList from "../components/EventList";
import UserAvatar from "../components/UserAvatar";
import { createAuthHeaders, getApiUrl } from "../lib/api";
import { getUserDisplayName } from "../utils/avatar";

function sortEvents(events) {
  const now = Date.now();

  return [...events].sort((left, right) => {
    const leftTime = left?.startDate
      ? new Date(left.startDate).getTime()
      : Number.POSITIVE_INFINITY;
    const rightTime = right?.startDate
      ? new Date(right.startDate).getTime()
      : Number.POSITIVE_INFINITY;
    const leftUpcoming = Number.isFinite(leftTime) && leftTime >= now;
    const rightUpcoming = Number.isFinite(rightTime) && rightTime >= now;

    if (leftUpcoming !== rightUpcoming) {
      return leftUpcoming ? -1 : 1;
    }

    if (leftUpcoming && rightUpcoming) {
      return leftTime - rightTime;
    }

    if (!leftUpcoming && !rightUpcoming) {
      return rightTime - leftTime;
    }

    return 0;
  });
}

export default function Profile() {
  const { token, user } = useContext(AuthContext);
  const [createdEvents, setCreatedEvents] = useState([]);
  const [soloingEvents, setSoloingEvents] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  const displayedUser = user;

  useEffect(() => {
    if (!token) return;

    let isActive = true;

    async function loadProfileEvents() {
      setLoadingProfile(true);
      setError("");

      try {
        const res = await fetch(getApiUrl("/api/profile/me/events"), {
          headers: createAuthHeaders(token),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load profile.");
        }

        if (!isActive) return;

        setCreatedEvents(sortEvents(data.createdEvents || []));
        setSoloingEvents(sortEvents(data.soloingEvents || []));
      } catch (fetchError) {
        if (!isActive) return;
        setError(fetchError.message || "Failed to load profile.");
      } finally {
        if (isActive) {
          setLoadingProfile(false);
        }
      }
    }

    loadProfileEvents();

    return () => {
      isActive = false;
    };
  }, [refreshTick, token]);

  function refreshProfileEvents() {
    setRefreshTick((current) => current + 1);
  }

  if (loadingProfile) {
    return <main className="w-full p-6">Loading profile...</main>;
  }

  return (
    <main className="w-full  ">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <UserAvatar
              user={displayedUser}
              size={120}
              className="h-32 w-32 ring-4 ring-stone-100"
              textClassName="text-3xl"
            />

            <div className="space-y-1">

              <h1 className="text-3xl capitalize tracking-tight font-bold text-stone-900">
                {getUserDisplayName(displayedUser)}
              </h1>
              <p className="text-sm text-stone-600">@{displayedUser?.username}</p>
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="space-y-6  ">
          <div className="space-y-4 border-t py-8 border-black/15  ">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-stone-900">
                Hosting
              </h2>
              <p className="text-sm text-stone-600">
                These are the events you are currently hosting.
              </p>
            </div>

            {createdEvents.length > 0 ? (
              <EventList events={createdEvents} refresh={refreshProfileEvents} />
            ) : (
              <p className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-4 py-6 text-sm text-stone-600">
                You have not created any events yet.
              </p>
            )}
          </div>

          <div className="space-y-4 border-t pt-8 border-black/15 ">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-stone-900">
                Events You&apos;re Soloing
              </h2>
            </div>

            {soloingEvents.length > 0 ? (
              <EventList events={soloingEvents} refresh={refreshProfileEvents} />
            ) : (
              <p className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-4 py-6 text-sm text-stone-600">
                You are not marked as going solo to any events yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
