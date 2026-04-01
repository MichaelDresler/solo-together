import ApiButton from "./ApiButton";
import { AuthContext } from "../context/AuthContext";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import GoingSoloButton from "./GoingSoloButton";
import UserAvatar from "./UserAvatar";
import { getUserDisplayName } from "../utils/avatar";

export default function EventCard({ event, refresh }) {
  const { user } = useContext(AuthContext);
  const owner = event.createdBy || event.userId;
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(event.imageUrl) && !imageError;

  function truncateWords(text, limit = 20) {
    const words = text.trim().split(/\s+/);

    if (words.length <= limit) return text;

    return words.slice(0, limit).join(" ") + "...";
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white p-5   ">
      {showImage ? (
        <img
          src={event.imageUrl}
          alt={event.title || "Event thumbnail"}
          onError={() => setImageError(true)}
          className="mb-4 h-80 w-full rounded-sm object-cover"
        />
      ) : (
        <div className="mb-4 flex h-80 w-full items-center justify-center rounded-lg bg-gray-100 text-center">
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
        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>

        <p className="text-sm leading-6 text-gray-600">
          {truncateWords(event.description)}
        </p>

        {owner && (
          <div className="flex items-center gap-3 rounded-xl bg-stone-50 px-3 py-2">
            <UserAvatar
              user={owner}
              size={32}
              className="h-8 w-8"
              textClassName="text-xs"
            />
            <div>
              <p className="text-xs uppercase tracking-wide text-stone-500">
                Host
              </p>
              <p className="text-sm font-medium text-stone-700">
                {getUserDisplayName(owner)}
              </p>
            </div>
          </div>
        )}

        <Link
          to={`/events/${event._id}`}
          className="inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Open Event Page
        </Link>
      </div>
      {user && (
        <div className="mt-4 space-y-3">
          <GoingSoloButton localEventId={event._id} onStatusChange={refresh} />

          <div className="flex justify-end">
            {user?.username === owner?.username && (
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
      )}
    </div>
  );
}
