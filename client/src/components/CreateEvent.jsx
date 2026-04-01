import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { createAuthHeaders, getApiUrl } from "../lib/api";

const initialFormValues = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  locationName: "",
  addressLine1: "",
  city: "",
  stateOrProvince: "",
  postalCode: "",
  country: "",
  imageUrl: "",
  externalUrl: "",
  classification: "",
};

export default function CreateEvent() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState(initialFormValues);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(getApiUrl("/api/events"), {
        method: "POST",
        headers: createAuthHeaders(token, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(formValues),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create event");
      }

      navigate(`/events/${data._id}`, {
        state: {
          toast: "Event created successfully.",
        },
      });
    } catch (submitError) {
      setError(submitError.message || "Failed to create event");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Basic Information</h2>
          <p className="text-sm text-stone-600">
            Add the core details people need before they decide to join.
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">Title</span>
          <input
            name="title"
            value={formValues.title}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-stone-500"
            placeholder="Indie night at The Pearl"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">Description</span>
          <textarea
            name="description"
            value={formValues.description}
            onChange={handleChange}
            rows="5"
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-stone-500"
            placeholder="Share what the event is, who should come, and any useful context."
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">Classification</span>
          <input
            name="classification"
            value={formValues.classification}
            onChange={handleChange}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-stone-500"
            placeholder="Concert, comedy, sports, meetup"
          />
        </label>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-stone-900">Date and Time</h2>
          <p className="text-sm text-stone-600">
            Start and end time are optional, but they improve event browsing.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:col-span-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Start</span>
            <input
              type="datetime-local"
              name="startDate"
              value={formValues.startDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-stone-500"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">End</span>
            <input
              type="datetime-local"
              name="endDate"
              value={formValues.endDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-stone-500"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Location</h2>
          <p className="text-sm text-stone-600">
            Address basics keep the event useful today and flexible for maps later.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Venue or location name</span>
            <input
              name="locationName"
              value={formValues.locationName}
              onChange={handleChange}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-stone-500"
              placeholder="The Pearl"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Address line 1</span>
            <input
              name="addressLine1"
              value={formValues.addressLine1}
              onChange={handleChange}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-stone-500"
              placeholder="881 Granville St"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">City</span>
            <input
              name="city"
              value={formValues.city}
              onChange={handleChange}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-stone-500"
              placeholder="Vancouver"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">State or province</span>
            <input
              name="stateOrProvince"
              value={formValues.stateOrProvince}
              onChange={handleChange}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-stone-500"
              placeholder="British Columbia"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Postal code</span>
            <input
              name="postalCode"
              value={formValues.postalCode}
              onChange={handleChange}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-stone-500"
              placeholder="V6Z 1A6"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Country</span>
            <input
              name="country"
              value={formValues.country}
              onChange={handleChange}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-stone-500"
              placeholder="Canada"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Links and Media</h2>
          <p className="text-sm text-stone-600">
            Optional links help the event page feel closer to imported Ticketmaster events.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Image URL</span>
            <input
              type="url"
              name="imageUrl"
              value={formValues.imageUrl}
              onChange={handleChange}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-stone-500"
              placeholder="https://..."
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">External URL</span>
            <input
              type="url"
              name="externalUrl"
              value={formValues.externalUrl}
              onChange={handleChange}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-stone-500"
              placeholder="https://..."
            />
          </label>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Creating..." : "Create Event"}
        </button>
      </div>
    </form>
  );
}
