import { useState } from "react";
import ApiButton from "./ApiButton";

export default function CreateEvent({ refresh }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Create Event</h2>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Title
          </label>

          <input
            className="
              w-full rounded-lg border border-gray-300
              px-3 py-2 text-sm
              outline-none
              transition
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
            "
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Description
          </label>

          <textarea
            rows="3"
            className="
              w-full rounded-lg border border-gray-300
              px-3 py-2 text-sm
              outline-none
              transition
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
            "
            placeholder="Describe your event..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <ApiButton
          method="POST"
          endpoint="http://localhost:5001/api/events"
          body={{ title, description }}
          variant="primary"
          onSuccess={() => {
            setTitle("");
            setDescription("");
            refresh();
          }}
        >
          Create Event
        </ApiButton>
      </div>
    </div>
  );
}
