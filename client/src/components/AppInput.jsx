export default function AppInput({ label, name, type }) {
  return (
    <div className="">
      <label className="text-black">{label}</label>
      <input
        name={name}
        type={type}
        className="w-full h-12 bg-black/2 border border-black/10 rounded-sm"
      />
    </div>
  );
}
