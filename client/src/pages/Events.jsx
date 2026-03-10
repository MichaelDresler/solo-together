import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import EventList from "../components/EventList";
import CreateEvent from "../components/CreateEvent";

export default function Events() {
  const { user, logout, token } = useContext(AuthContext);
  const [err, setErr] = useState("");
  const [events, setEvents] = useState([]);
  

  async function loadEvents() {
    try {
      setErr("");

      const res = await fetch("http://localhost:5001/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setErr(data.error || "failed to load events");
        return;
      }

      setEvents(data);
    } catch (e) {
      setErr("failed to load events");
      console.error(e);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <main className="p-6 space-y-8 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome, {user?.username}</h1>
      </div>

      {err && <p className="text-red-600">{err}</p>}

      {user && <CreateEvent refresh={loadEvents} />}

      <EventList events={events} refresh={loadEvents} />
    </main>
  );
}
