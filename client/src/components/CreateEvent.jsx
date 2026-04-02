import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { createAuthHeaders, getApiUrl } from "../lib/api";
import DateTimeDropdownField from "./DateTimeDropdownField";

const MAX_EVENT_IMAGE_FILE_SIZE = 5 * 1024 * 1024;

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
  externalUrl: "",
  classification: "",
};

const initialDateTimeSelections = {
  start: {
    date: "",
    time: "",
  },
  end: {
    date: "",
    time: "",
  },
};

function buildDateTimeValue(date, time) {
  if (!date) {
    return "";
  }

  if (!time) {
    return date;
  }

  return `${date}T${time}`;
}

export default function CreateEvent() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const imageInputRef = useRef(null);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [dateTimeSelections, setDateTimeSelections] = useState(initialDateTimeSelections);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedImage) {
      setImagePreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setImagePreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  function handleDateTimeSelection(field, part, value) {
    setDateTimeSelections((currentSelections) => {
      const nextFieldSelection = {
        ...currentSelections[field],
        [part]: value,
      };

      setFormValues((currentValues) => ({
        ...currentValues,
        [`${field}Date`]: buildDateTimeValue(nextFieldSelection.date, nextFieldSelection.time),
      }));

      return {
        ...currentSelections,
        [field]: nextFieldSelection,
      };
    });
  }

  function validateImageFile(file) {
    if (!file) {
      return "Choose an image to upload.";
    }

    if (!file.type?.startsWith("image/")) {
      return "Please choose a valid image file for your event banner.";
    }

    if (file.size > MAX_EVENT_IMAGE_FILE_SIZE) {
      return "Event banner must be 5MB or smaller.";
    }

    return "";
  }

  function setImageFile(file) {
    const validationError = validateImageFile(file);

    if (validationError) {
      setSelectedImage(null);
      setError(validationError);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      return;
    }

    setSelectedImage(file);
    setError("");
  }

  function handleImageInputChange(event) {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
  }

  function handleImageDrop(event) {
    event.preventDefault();
    setIsDraggingImage(false);
    const file = event.dataTransfer.files?.[0] || null;
    setImageFile(file);
  }

  function handleImageKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      imageInputRef.current?.click();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const body = new FormData();

      Object.entries(formValues).forEach(([key, value]) => {
        body.append(key, value);
      });

      if (selectedImage) {
        body.append("image", selectedImage);
      }

      const res = await fetch(getApiUrl("/api/events"), {
        method: "POST",
        headers: createAuthHeaders(token),
        body,
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

        <div className="grid gap-4 md:col-span-2">
          <DateTimeDropdownField
            label="Start"
            dateValue={dateTimeSelections.start.date}
            timeValue={dateTimeSelections.start.time}
            onDateChange={(value) => handleDateTimeSelection("start", "date", value)}
            onTimeChange={(value) => handleDateTimeSelection("start", "time", value)}
          />

          <DateTimeDropdownField
            label="End"
            dateValue={dateTimeSelections.end.date}
            timeValue={dateTimeSelections.end.time}
            onDateChange={(value) => handleDateTimeSelection("end", "date", value)}
            onTimeChange={(value) => handleDateTimeSelection("end", "time", value)}
          />
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
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-stone-700">Event banner</span>
              {selectedImage ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setError("");
                    if (imageInputRef.current) {
                      imageInputRef.current.value = "";
                    }
                  }}
                  className="text-sm font-medium text-stone-500 transition hover:text-stone-800"
                >
                  Remove image
                </button>
              ) : null}
            </div>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageInputChange}
              className="hidden"
            />

            <div
              role="button"
              tabIndex={0}
              onClick={() => imageInputRef.current?.click()}
              onKeyDown={handleImageKeyDown}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDraggingImage(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingImage(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                if (event.currentTarget.contains(event.relatedTarget)) {
                  return;
                }

                setIsDraggingImage(false);
              }}
              onDrop={handleImageDrop}
              className={`group relative overflow-hidden rounded-2xl border-2 border-dashed bg-stone-50 transition ${
                isDraggingImage
                  ? "border-orange-400 bg-orange-50"
                  : "border-stone-300 hover:border-stone-400 hover:bg-stone-100"
              }`}
            >
              {imagePreviewUrl ? (
                <div className="relative h-72 w-full">
                  <img
                    src={imagePreviewUrl}
                    alt="Event banner preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/70 to-transparent px-5 py-4 text-sm text-white">
                    {selectedImage?.name}
                  </div>
                </div>
              ) : (
                <div className="flex h-72 flex-col items-center justify-center gap-3 px-6 text-center">
                  <div className="flex size-14 items-center justify-center rounded-full bg-white text-stone-500 shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="size-6"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16V6m0 0l-3.5 3.5M12 6l3.5 3.5M5 18.5A2.5 2.5 0 0 1 2.5 16v-.5A2.5 2.5 0 0 1 5 13h1.2A6 6 0 0 1 17.83 11 3.5 3.5 0 0 1 19 17.86"
                      />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-stone-900">
                      Insert event banner
                    </p>
                    <p className="text-sm text-stone-600">
                      Drag an image here or click to choose one.
                    </p>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                      JPG, PNG, GIF, or WebP up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

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
