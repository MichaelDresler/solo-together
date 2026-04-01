import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import GoingSoloButton from "../components/GoingSoloButton";
import UserAvatar from "../components/UserAvatar";
import { getUserDisplayName } from "../utils/avatar";

export default function EventDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(location.state?.toast || "");

  useEffect(() => {
    if (!location.state?.toast) return;
    navigate(location.pathname, { replace: true });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`http://localhost:5001/api/events/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load event");
          setEvent(null);
          return;
        }

        setEvent(data);
      } catch (error) {
        console.error(error);
        setError("Failed to load event");
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id, token]);

  if (loading) {
    return <main className="p-6 w-full">Loading event...</main>;
  }

  if (error || !event) {
    return (
      <main className="p-6 w-full">
        <p className="text-red-600">{error || "Event not found"}</p>
      </main>
    );
  }

  return (
    <main className="p-6 w-full">
      <div className="max-w-3xl space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {toast && (
          <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <span>{toast}</span>
            <button
              type="button"
              onClick={() => setToast("")}
              className="font-medium text-green-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title || "Event"}
            className="h-72 w-full rounded-lg object-cover"
          />
        ) : null}

        <div className="space-y-3">
          {(event.createdBy || event.userId) && (
            <div className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3">
              <UserAvatar
                user={event.createdBy || event.userId}
                size={48}
                className="h-12 w-12"
                textClassName="text-sm"
              />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  Event host
                </p>
                <p className="text-sm font-semibold text-stone-800">
                  {getUserDisplayName(event.createdBy || event.userId)}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gray-600">
              {event.source}
            </span>
          </div>

          <p className="text-sm text-gray-500">
            {event.startDate
              ? new Date(event.startDate).toLocaleString()
              : "Date and time unavailable"}
          </p>

          {event.endDate && (
            <p className="text-sm text-gray-500">
              Ends {new Date(event.endDate).toLocaleString()}
            </p>
          )}

          {event.classification && (
            <p className="text-sm font-medium text-stone-600">
              {event.classification}
            </p>
          )}

          <div className="space-y-1 text-sm text-gray-600">
            <p>
              {event.locationName || "Venue unavailable"}
              {event.city ? `, ${event.city}` : ""}
              {event.country ? `, ${event.country}` : ""}
            </p>
            {(event.addressLine1 || event.stateOrProvince || event.postalCode) && (
              <p>
                {[event.addressLine1, event.stateOrProvince, event.postalCode]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </div>

          <p className="text-sm leading-6 text-gray-700">
            {event.description || "No description available."}
          </p>

          {event.externalUrl && (
            <a
              href={event.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View Original Event
            </a>
          )}
        </div>

        <GoingSoloButton localEventId={event._id} />
      </div>
    </main>
  );
}
