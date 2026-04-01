import CreateEvent from "../components/CreateEvent";

export default function CreateEventPage() {
  return (
    <main className="w-full p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
            New Event
          </p>
          <h1 className="text-3xl font-bold text-stone-900">Create Event</h1>
          <p className="max-w-2xl text-sm text-stone-600">
            Build a richer internal event with the same core information users expect from imported event listings.
          </p>
        </header>

        <CreateEvent />
      </div>
    </main>
  );
}
