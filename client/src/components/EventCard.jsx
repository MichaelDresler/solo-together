import ApiButton from "./ApiButton";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { Link } from "react-router-dom";
import GoingSoloButton from "./GoingSoloButton";

export default function EventCard({ event, refresh }) {
      const { user } = useContext(AuthContext);
      const owner = event.createdBy || event.userId;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {event.title}
        </h3>

        <p className="text-sm leading-6 text-gray-600">
          {event.description}
        </p>

        {owner && (
          <p className="text-xs text-gray-500">
            Created by {owner.username}
          </p>
        )}

        <Link
          to={`/events/${event._id}`}
          className="inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Open Event Page
        </Link>
      </div>

      <div className="mt-4 space-y-3">
       <GoingSoloButton localEventId={event._id} />

      <div className="flex justify-end">
       {(user?.username === owner?.username) && <ApiButton
          method="DELETE"
          endpoint={`http://localhost:5001/api/events/${event._id}`}
          variant="danger"
          onSuccess={refresh}
        >
          Delete
        </ApiButton>}
      </div>
      </div>
    </div>
  );
}
