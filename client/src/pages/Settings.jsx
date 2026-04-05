import { useContext, useEffect, useMemo, useState } from "react";
import AvatarUploadModal from "../components/AvatarUploadModal";
import UserAvatar from "../components/UserAvatar";
import { AuthContext } from "../context/auth-context";
import { createAuthHeaders, getApiUrl } from "../lib/api";

const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;

export default function Settings() {
  const { token, user, updateUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  });
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
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
          username: data.user.username || "",
          email: data.user.email || "",
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

  function validateAvatarFile(file) {
    if (!file) {
      return "Choose an image before uploading.";
    }

    if (!file.type?.startsWith("image/")) {
      return "Please choose a valid image file for your avatar.";
    }

    if (file.size > MAX_AVATAR_FILE_SIZE) {
      return "Avatar image must be 5MB or smaller.";
    }

    return "";
  }

  function resetAvatarSelection() {
    setSelectedFile(null);
    setError("");
  }

  function handleFileChange(file) {
    const validationError = validateAvatarFile(file);

    if (validationError) {
      setSelectedFile(null);
      setError(validationError);
      return;
    }

    setSelectedFile(file || null);
    setAvatarMessage("");
    setError("");
  }

  function handleAvatarModalClose() {
    if (uploadingAvatar) {
      return;
    }

    setIsAvatarModalOpen(false);
    resetAvatarSelection();
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
      setIsAvatarModalOpen(false);
      setAvatarMessage("Avatar updated");
    } catch (uploadError) {
      setError(uploadError.message || "Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  if (loadingProfile) {
    return <main className="w-full p-6">Loading settings...</main>;
  }

  return (
    <main className="w-full p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="">
          <div className="">
            <h1 className="text-2xl font-semibold  text-black/90 tracking-tight">
              Settings
            </h1>

            <p className="text-base font-medium  text-black/60 tracking-normal">
              Choose how you are displayed as a host or guest.
            </p>
          </div>

           {(avatarMessage || profileMessage) && (
              <div className=" mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-xs ">
                {avatarMessage && (
                  <p className="text-sm text-green-800">{avatarMessage}</p>
                )}
                {!avatarMessage && profileMessage && (
                  <p className="text-sm text-green-800">{profileMessage}</p>
                )}


                 {/* <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
            <span>{toast}</span>
            <button
              type="button"
              onClick={() => setToast("")}
              className="font-semibold text-emerald-700 transition hover:text-emerald-900"
            >
              Dismiss
            </button>
          </div> */}



              </div>

              
            )}
        </header>

        {error && !isAvatarModalOpen && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid grid-cols-[1.75fr_1fr] gap-12">
          <form onSubmit={handleProfileSubmit} className="space-y-5 ">
            <div className="flex flex-row space-x-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">
                  First name
                </span>
                <input
                  name="firstName"
                  value={formValues.firstName}
                  onChange={handleInputChange}
                  className="w-full rounded-lg bg-black/5 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:bg-black/[0.07]"
                  placeholder="First name"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">
                  Last name
                </span>
                <input
                  name="lastName"
                  value={formValues.lastName}
                  onChange={handleInputChange}
                  className="w-full rounded-lg bg-black/5 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:bg-black/[0.07]"
                  placeholder="Last name"
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">Email</span>
              <input
                name="email"
                type="email"
                value={formValues.email}
                onChange={handleInputChange}
                className="w-full rounded-lg bg-black/5 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:bg-black/[0.07]"
                placeholder="you@example.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">
                Username
              </span>
              <input
                name="username"
                value={formValues.username}
                onChange={handleInputChange}
                className="w-full rounded-lg bg-black/5 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:bg-black/[0.07]"
                placeholder="jamie.kim"
              />
            </label>

            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex h-11 items-center justify-center rounded-full bg-green-700 squircle px-5 text-sm font-semibold text-white transition hover:bg-green-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </form>

           <div>
            <div className="">
              <div className="flex flex-row">
                <div
                  className="relative"
                  onClick={() => {
                    setAvatarMessage("");
                    setError("");
                    setIsAvatarModalOpen(true);
                  }}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="New avatar preview"
                      className="h-32 w-32 rounded-full object-cover ring-4 ring-white/20"
                    />
                  ) : (
                    <UserAvatar
                      user={displayedUser}
                      size={128}
                      className="cursor-pointer"
                      textClassName="text-3xl"
                    />
                  )}

                  <button
                    type="button"
                    aria-label="Edit profile photo"
                    onClick={() => {
                      setAvatarMessage("");
                      setError("");
                      setIsAvatarModalOpen(true);
                    }}
                    className="absolute bottom-1 right-1 inline-flex size-9 items-center justify-center rounded-full bg-black text-white shadow-lg transition hover:scale-[1.02] hover:bg-neutral-900 ring-2 ring-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-5"
                    >
                      <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

           
          </div>
        </section>

        {isAvatarModalOpen && (
          <AvatarUploadModal
            currentAvatarUrl={""}
            selectedFile={selectedFile}
            previewUrl={avatarPreview}
            uploading={uploadingAvatar}
            error={error}
            onClose={handleAvatarModalClose}
            onFileChange={handleFileChange}
            onSubmit={handleAvatarSubmit}
          />
        )}
      </div>
    </main>
  );
}
