export async function geocodeAddress(address) {
  if (!address) {
    throw new Error("Address is required");
  }

  const url =
    `https://api.maptiler.com/geocoding/` +
    `${encodeURIComponent(address)}.json` +
    `?key=${process.env.MAPTILER_API_KEY}&limit=1`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Geocoding failed with status ${response.status}`);
  }

  const data = await response.json();
  const firstFeature = data.features?.[0];

  if (!firstFeature) {
    return null;
  }

  // MapTiler returns [lng, lat]
  const [lng, lat] = firstFeature.center;

  return {
    lat,
    lng,
    formattedAddress: firstFeature.place_name || address,
  };
}
