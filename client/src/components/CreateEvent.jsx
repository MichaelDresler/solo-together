import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { createAuthHeaders, getApiUrl } from "../lib/api";
import DateTimeDropdownField from "./DateTimeDropdownField";
import ImageUploadDropzone from "./ImageUploadDropzone";

const MAX_EVENT_IMAGE_FILE_SIZE = 5 * 1024 * 1024;

const emptyFormValues = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  addressLine1: "",
  city: "",
  stateOrProvince: "",
  postalCode: "",
  country: "",
  imageUrl: "",
  externalUrl: "",
};

function getTodayDateValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildLocationAddress(values) {
  return [
    values.addressLine1,
    values.city,
    values.stateOrProvince,
    values.postalCode,
    values.country,
  ]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ");
}

function buildDateTimeValue(date, time) {
  if (!date) {
    return "";
  }

  if (!time) {
    return date;
  }

  return `${date}T${time}`;
}

function getDateSelectionParts(value) {
  if (!value) {
    return { date: "", time: "" };
  }

  if (typeof value === "string") {
    const matchedDate = value.match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/);

    if (matchedDate) {
      return {
        date: matchedDate[1],
        time: matchedDate[2] || "",
      };
    }
  }

  const eventDate = new Date(value);

  if (Number.isNaN(eventDate.valueOf())) {
    return { date: "", time: "" };
  }

  return {
    date: eventDate.toISOString().slice(0, 10),
    time: eventDate.toISOString().slice(11, 16),
  };
}

function getInitialFormValues(initialValues) {
  const locationAddress = initialValues?.location?.address?.trim() || "";
  const today = getTodayDateValue();

  return {
    ...emptyFormValues,
    ...initialValues,
    addressLine1: initialValues?.addressLine1 || locationAddress,
    startDate: initialValues?.startDate || today,
    endDate: initialValues?.endDate || today,
    imageUrl: initialValues?.imageUrl || "",
  };
}

function getInitialDateTimeSelections(initialValues) {
  const today = getTodayDateValue();
  const startSelection = getDateSelectionParts(initialValues?.startDate);
  const endSelection = getDateSelectionParts(initialValues?.endDate);

  return {
    start: {
      date: startSelection.date || today,
      time: startSelection.time,
    },
    end: {
      date: endSelection.date || today,
      time: endSelection.time,
    },
  };
}

export default function CreateEvent({
  mode = "create",
  initialValues = null,
  eventId = null,
}) {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const imageInputRef = useRef(null);
  const [formValues, setFormValues] = useState(() =>
    getInitialFormValues(initialValues),
  );
  const [dateTimeSelections, setDateTimeSelections] = useState(() =>
    getInitialDateTimeSelections(initialValues),
  );
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormValues(getInitialFormValues(initialValues));
    setDateTimeSelections(getInitialDateTimeSelections(initialValues));
    setSelectedImage(null);
  }, [initialValues]);

  useEffect(() => {
    if (!selectedImage) {
      setImagePreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setImagePreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const submitLabel = mode === "edit" ? "Save Changes" : "Create Event";
  const heading =
    mode === "edit" ? "Update Event Details" : "Basic Information";
  const description = useMemo(
    () =>
      mode === "edit"
        ? "Edit the event and keep the listing current."
        : "Add the core details people need before they decide to join.",
    [mode],
  );
  const previewImageUrl = imagePreviewUrl || formValues.imageUrl;

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
        [`${field}Date`]: buildDateTimeValue(
          nextFieldSelection.date,
          nextFieldSelection.time,
        ),
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
      const locationAddress = buildLocationAddress(formValues);

      Object.entries(formValues).forEach(([key, value]) => {
        body.append(key, value);
      });

      body.append(
        "location",
        JSON.stringify({
          address: locationAddress,
        }),
      );

      if (selectedImage) {
        body.append("image", selectedImage);
      }

      const isEditing = mode === "edit" && eventId;
      const endpoint = isEditing ? `/api/events/${eventId}` : "/api/events";
      const res = await fetch(getApiUrl(endpoint), {
        method: isEditing ? "PATCH" : "POST",
        headers: createAuthHeaders(token),
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || `Failed to ${isEditing ? "update" : "create"} event`,
        );
      }

      navigate(`/events/${data._id}`, {
        state: {
          toast: isEditing
            ? "Event updated successfully."
            : "Event created successfully.",
        },
      });
    } catch (submitError) {
      setError(
        submitError.message ||
          `Failed to ${mode === "edit" ? "update" : "create"} event`,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6  ">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Event Banner</h2>
          <p className="text-sm text-stone-600">
            Upload an image or paste a web image URL to help the event stand out
            in the feed.
          </p>
        </div>

        <ImageUploadDropzone
          inputRef={imageInputRef}
          previewImageUrl={previewImageUrl}
          isDragging={isDraggingImage}
          onOpen={() => imageInputRef.current?.click()}
          onKeyDown={handleImageKeyDown}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDraggingImage(true);
          }}
          onDragLeave={() => setIsDraggingImage(false)}
          onDrop={handleImageDrop}
          onInputChange={handleImageInputChange}
          previewAlt="Event preview"
          previewHint="Click or drop a new image here to replace the current banner."
        />

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">Image URL</span>
          <input
            type="url"
            name="imageUrl"
            value={formValues.imageUrl}
            onChange={handleChange}
            className="w-full rounded-xl  bg-black/5 px-4 py-3 text-sm outline-none transition focus:he-stone-500"
            placeholder="https://..."
          />
        </label>

        <div>
          <h2 className="text-lg font-semibold text-stone-900">{heading}</h2>
          <p className="text-sm text-stone-600">{description}</p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">Title</span>
          <input
            name="title"
            value={formValues.title}
            onChange={handleChange}
            required
            className="w-full rounded-xl  bg-black/5 px-4 py-3 text-sm outline-none transition focus:-stone-500"
            placeholder="Indie night at The Pearl"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">
            Description
          </span>
          <textarea
            name="description"
            value={formValues.description}
            onChange={handleChange}
            rows="5"
            className="w-full rounded-xl  bg-black/5 px-4 py-3 text-sm outline-none transition focus:-stone-500"
            placeholder="Share what the event is, who should come, and any useful context."
          />
        </label>
      </section>

      <section className="">
        <div className="space-y-2 pb-4">
          <h2 className="text-lg font-semibold text-stone-900">
            Date and Time
          </h2>
          <p className="text-sm text-stone-600">
            Start and end time are optional, but they improve event browsing.
          </p>
        </div>

        <div className="flex flex-col rounded-lg  p-1.5 gap-1 bg-black/5">
          <DateTimeDropdownField
            label="Start"
            dateValue={dateTimeSelections.start.date}
            timeValue={dateTimeSelections.start.time}
            onDateChange={(value) =>
              handleDateTimeSelection("start", "date", value)
            }
            onTimeChange={(value) =>
              handleDateTimeSelection("start", "time", value)
            }
          />

          <DateTimeDropdownField
            label="End"
            dateValue={dateTimeSelections.end.date}
            timeValue={dateTimeSelections.end.time}
            onDateChange={(value) =>
              handleDateTimeSelection("end", "date", value)
            }
            onTimeChange={(value) =>
              handleDateTimeSelection("end", "time", value)
            }
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">Address</span>
          <input
            name="addressLine1"
            value={formValues.addressLine1}
            onChange={handleChange}
            className="w-full rounded-xl  bg-black/5 px-4 py-3 text-sm outline-none transition focus:-stone-500"
            placeholder="123 Main Street"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">City</span>
          <input
            name="city"
            value={formValues.city}
            onChange={handleChange}
            className="w-full rounded-xl  bg-black/5 px-4 py-3 text-sm outline-none transition focus:-stone-500"
            placeholder="Vancouver"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">
            State / Province
          </span>
          <input
            name="stateOrProvince"
            value={formValues.stateOrProvince}
            onChange={handleChange}
            className="w-full rounded-xl  bg-black/5 px-4 py-3 text-sm outline-none transition focus:-stone-500"
            placeholder="BC"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">
            Postal Code
          </span>
          <input
            name="postalCode"
            value={formValues.postalCode}
            onChange={handleChange}
            className="w-full rounded-xl  bg-black/5 px-4 py-3 text-sm outline-none transition focus:-stone-500"
            placeholder="V6B 1A1"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">Country</span>
          <input
            name="country"
            value={formValues.country}
            onChange={handleChange}
            className="w-full rounded-xl  bg-black/5 px-4 py-3 text-sm outline-none transition focus:-stone-500"
            placeholder="Canada"
          />
        </label>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-stone-700">
            External URL
          </span>
          <input
            name="externalUrl"
            value={formValues.externalUrl}
            onChange={handleChange}
            className="w-full rounded-xl  bg-black/5 px-4 py-3 text-sm outline-none transition focus:-stone-500"
            placeholder="https://..."
          />
        </label>
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex justify-center rounded-lg w-full bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
