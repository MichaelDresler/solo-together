import ApiButton from "./ApiButton";
import { AuthContext } from "../context/AuthContext";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import GoingSoloButton from "./GoingSoloButton";

export default function EventCard({ event, refresh }) {
  const { user } = useContext(AuthContext);
  const owner = event.createdBy || event.userId;
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(event.imageUrl) && !imageError;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {showImage ? (
        <img
          src={event.imageUrl}
          alt={event.title || "Event thumbnail"}
          onError={() => setImageError(true)}
          className="mb-4 h-48 w-full rounded-lg object-cover"
        />
      ) : (
        <div className="mb-4 flex h-48 w-full items-center justify-center rounded-lg bg-gray-100 text-center">
          <div className="space-y-1 px-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {event.source || "event"}
            </p>
            <p className="text-sm font-semibold text-gray-700">
              No event image available
            </p>
          </div>
        </div>
      )}

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
{ user &&
      <div className="mt-4 space-y-3">
        <GoingSoloButton localEventId={event._id} />

        <div className="flex justify-end">
          {(user?.username === owner?.username) && (
            <ApiButton
              method="DELETE"
              endpoint={`http://localhost:5001/api/events/${event._id}`}
              variant="danger"
              onSuccess={refresh}
            >
              Delete
            </ApiButton>
          )}
        </div>
      </div>
}
    </div>
  );
}
