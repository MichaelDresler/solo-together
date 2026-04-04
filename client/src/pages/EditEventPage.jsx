import { useContext, useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import CreateEvent from "../components/CreateEvent";
import { AuthContext } from "../context/auth-context";
import { createAuthHeaders, getApiUrl } from "../lib/api";
import { canManageEvent } from "../lib/permissions";

export default function EditEventPage() {
  const { id } = useParams();
  const { token, user } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(getApiUrl(`/api/events/${id}`), {
          headers: createAuthHeaders(token),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load event");
        }

        setEvent(data);
      } catch (loadError) {
        setError(loadError.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id, token]);

  if (loading) {
    return <main className="w-full p-6">Loading event editor...</main>;
  }

  if (error) {
    return (
      <main className="w-full p-6">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  if (!canManageEvent(user, event)) {
    return <Navigate to={`/events/${id}`} replace />;
  }

  return (
    <main className="w-full p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-stone-900">Update Event</h1>
          <p className="max-w-2xl text-sm text-stone-600">
            Adjust the event details, banner, and location information.
          </p>
        </header>

        <CreateEvent mode="edit" initialValues={event} eventId={id} />
      </div>
    </main>
  );
}
