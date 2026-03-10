import ApiButton from "./ApiButton";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

export default function EventCard({ event, refresh }) {
      const { user } = useContext(AuthContext);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {event.title}
        </h3>

        <p className="text-sm leading-6 text-gray-600">
          {event.description}
        </p>

        {event.userId && (
          <p className="text-xs text-gray-500">
            Created by {event.userId.username}
          </p>
        )}
      </div>

      <div className="mt-4 flex justify-end">
       {(user?.username === event.userId?.username) && <ApiButton
          method="DELETE"
          endpoint={`http://localhost:5001/api/events/${event._id}`}
          variant="danger"
          onSuccess={refresh}
        >
          Delete
        </ApiButton>}
      </div>
    </div>
  );
}