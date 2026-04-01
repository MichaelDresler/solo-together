import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import UserAvatar from "../components/UserAvatar";
import { createAuthHeaders, getApiUrl } from "../lib/api";

export default function Profile() {
  const { token, user, updateUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [formValues, setFormValues] = useState({ firstName: "", lastName: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [avatarMessage, setAvatarMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    let isActive = true;

    async function loadProfile() {
      setLoadingProfile(true);
      setError("");

      try {
        const res = await fetch(getApiUrl("/api/profile/me"), {
          headers: createAuthHeaders(token),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load profile.");
        }

        if (!isActive) return;

        setProfile(data.user);
        setFormValues({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
        });
      } catch (fetchError) {
        if (!isActive) return;
        setError(fetchError.message || "Failed to load profile.");
      } finally {
        if (isActive) {
          setLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [token]);

  useEffect(() => {
    if (!selectedFile) {
      setAvatarPreview("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setAvatarPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const displayedUser = useMemo(() => {
    return profile || user;
  }, [profile, user]);

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    setAvatarMessage("");
    setError("");
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage("");
    setError("");

    try {
      const res = await fetch(getApiUrl("/api/profile/me"), {
        method: "PATCH",
        headers: createAuthHeaders(token, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(formValues),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      setProfile(data.user);
      updateUser(data.user);
      setProfileMessage("Profile updated.");
    } catch (submitError) {
      setError(submitError.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAvatarSubmit(event) {
    event.preventDefault();

    if (!selectedFile) {
      setAvatarMessage("Choose an image before uploading.");
      return;
    }

    setUploadingAvatar(true);
    setAvatarMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const res = await fetch(getApiUrl("/api/profile/me/avatar"), {
        method: "PATCH",
        headers: createAuthHeaders(token),
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload avatar.");
      }

      setProfile(data.user);
      updateUser(data.user);
      setSelectedFile(null);
      setAvatarMessage("Avatar updated.");
    } catch (uploadError) {
      setError(uploadError.message || "Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  if (loadingProfile) {
    return <main className="w-full p-6">Loading profile...</main>;
  }

  return (
    <main className="w-full p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="New avatar preview"
                  className="h-32 w-32 rounded-full object-cover ring-4 ring-orange-100"
                />
              ) : (
                <UserAvatar
                  user={displayedUser}
                  size={128}
                  className="h-32 w-32 ring-4 ring-stone-100"
                  textClassName="text-3xl"
                />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
                Profile
              </p>
              <h1 className="text-3xl font-bold text-stone-900">
                {displayedUser?.firstName} {displayedUser?.lastName}
              </h1>
              <p className="text-sm text-stone-600">@{displayedUser?.username}</p>
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <form
            onSubmit={handleProfileSubmit}
            className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
          >
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-stone-900">Update Profile</h2>
              <p className="text-sm text-stone-600">
                Keep your display name current across the app.
              </p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">First name</span>
              <input
                name="firstName"
                value={formValues.firstName}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-stone-500"
                placeholder="First name"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">Last name</span>
              <input
                name="lastName"
                value={formValues.lastName}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-stone-500"
                placeholder="Last name"
              />
            </label>

            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>

            {profileMessage && (
              <p className="text-sm text-green-700">{profileMessage}</p>
            )}
          </form>

          <form
            onSubmit={handleAvatarSubmit}
            className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
          >
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-stone-900">Update Avatar</h2>
              <p className="text-sm text-stone-600">
                Upload a square-friendly image. JPG, PNG, GIF, and WebP work well.
              </p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">Avatar image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-stone-600 file:mr-4 file:rounded-lg file:border-0 file:bg-orange-100 file:px-4 file:py-2 file:font-medium file:text-orange-900 hover:file:bg-orange-200"
              />
            </label>

            <button
              type="submit"
              disabled={uploadingAvatar}
              className="inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {uploadingAvatar ? "Uploading..." : "Upload Avatar"}
            </button>

            {avatarMessage && (
              <p className="text-sm text-green-700">{avatarMessage}</p>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
