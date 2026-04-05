const DEFAULT_BASE_URL = process.env.SEED_API_BASE_URL || "http://localhost:5001";
const DEMO_PASSWORD = "solotogether-demo-2026";
const EVENT_MARKER = "[Seed Demo]";
const INSTRUCTIONS_PATH = "docs/demo-seed.md";
const args = new Set(process.argv.slice(2));

const demoUsers = [
  { username: "avery.demo", firstName: "Avery", lastName: "Cole" },
  { username: "jordan.demo", firstName: "Jordan", lastName: "Nguyen" },
  { username: "morgan.demo", firstName: "Morgan", lastName: "Patel" },
  { username: "sydney.demo", firstName: "Sydney", lastName: "Lopez" },
  { username: "cameron.demo", firstName: "Cameron", lastName: "Brooks" },
  { username: "riley.demo", firstName: "Riley", lastName: "Kim" },
  { username: "taylor.demo", firstName: "Taylor", lastName: "James" },
  { username: "quinn.demo", firstName: "Quinn", lastName: "Rivera" },
  { username: "blake.demo", firstName: "Blake", lastName: "Foster" },
  { username: "devon.demo", firstName: "Devon", lastName: "Murphy" },
  { username: "harper.demo", firstName: "Harper", lastName: "Diaz" },
  { username: "logan.demo", firstName: "Logan", lastName: "Reed" },
];

const eventBlueprints = [
  {
    owner: "avery.demo",
    title: "Coffee Walk and Book Swap",
    description: "Start the weekend with a casual coffee crawl and bring a book you are ready to trade.",
    locationName: "Revolver Coffee",
    addressLine1: "325 Cambie St",
    city: "Vancouver",
    stateOrProvince: "BC",
    postalCode: "V6B 2N4",
    country: "Canada",
    classification: "social",
    offsetDays: 2,
  },
  {
    owner: "avery.demo",
    title: "Sunset Seawall Run",
    description: "A no-pressure evening run with a cooldown hang by the water.",
    locationName: "Stanley Park Pavilion",
    addressLine1: "610 Pipeline Rd",
    city: "Vancouver",
    stateOrProvince: "BC",
    postalCode: "V6G 3E2",
    country: "Canada",
    classification: "fitness",
    offsetDays: 8,
  },
  {
    owner: "avery.demo",
    title: "Indie Film Double Feature",
    description: "Catch two indie films back to back and compare notes over late snacks.",
    locationName: "Rio Theatre",
    addressLine1: "1660 E Broadway",
    city: "Vancouver",
    stateOrProvince: "BC",
    postalCode: "V5N 1W1",
    country: "Canada",
    classification: "film",
    offsetDays: 18,
  },
  {
    owner: "jordan.demo",
    title: "Board Game Cafe Mixer",
    description: "Meet new people over fast cooperative games and a rotating snack table.",
    locationName: "Mox Boarding House Seattle",
    addressLine1: "5105 Leary Ave NW",
    city: "Seattle",
    stateOrProvince: "WA",
    postalCode: "98107",
    country: "USA",
    classification: "games",
    offsetDays: 3,
  },
  {
    owner: "jordan.demo",
    title: "Street Photography Walk",
    description: "An early evening photo walk focused on candid shots, neon signs, and city textures.",
    locationName: "Capitol Hill Station",
    addressLine1: "140 Broadway E",
    city: "Seattle",
    stateOrProvince: "WA",
    postalCode: "98102",
    country: "USA",
    classification: "art",
    offsetDays: 11,
  },
  {
    owner: "jordan.demo",
    title: "Late Night Dumpling Run",
    description: "A social dinner stop for anyone who wants to trade favorite spots and order family style.",
    locationName: "Din Tai Fung Pacific Place",
    addressLine1: "600 Pine St",
    city: "Seattle",
    stateOrProvince: "WA",
    postalCode: "98101",
    country: "USA",
    classification: "food",
    offsetDays: 25,
  },
  {
    owner: "morgan.demo",
    title: "Live Jazz and Dessert",
    description: "Listen to a local trio, grab dessert, and keep the evening low-key.",
    locationName: "The 1905",
    addressLine1: "830 N Shaver St",
    city: "Portland",
    stateOrProvince: "OR",
    postalCode: "97227",
    country: "USA",
    classification: "music",
    offsetDays: 4,
  },
  {
    owner: "morgan.demo",
    title: "Creative Writing Sprint",
    description: "Bring a notebook, write in short bursts, and share if you feel like it.",
    locationName: "Multnomah County Central Library",
    addressLine1: "801 SW 10th Ave",
    city: "Portland",
    stateOrProvince: "OR",
    postalCode: "97205",
    country: "USA",
    classification: "writing",
    offsetDays: 10,
  },
  {
    owner: "morgan.demo",
    title: "Sunday Vintage Market Browse",
    description: "A slow market browse with coffee breaks and optional lunch after.",
    locationName: "Portland Saturday Market",
    addressLine1: "2 SW Naito Pkwy",
    city: "Portland",
    stateOrProvince: "OR",
    postalCode: "97204",
    country: "USA",
    classification: "shopping",
    offsetDays: -5,
  },
  {
    owner: "sydney.demo",
    title: "Brunch Club Kickoff",
    description: "Try a new brunch spot and keep the conversation flowing with get-to-know-you prompts.",
    locationName: "Mildred's Temple Kitchen",
    addressLine1: "85 Hanna Ave",
    city: "Toronto",
    stateOrProvince: "ON",
    postalCode: "M6K 3S3",
    country: "Canada",
    classification: "food",
    offsetDays: 5,
  },
  {
    owner: "sydney.demo",
    title: "Museum Friday Lates",
    description: "Explore the exhibits after work and regroup for drinks nearby.",
    locationName: "Royal Ontario Museum",
    addressLine1: "100 Queens Park",
    city: "Toronto",
    stateOrProvince: "ON",
    postalCode: "M5S 2C6",
    country: "Canada",
    classification: "culture",
    offsetDays: 13,
  },
  {
    owner: "sydney.demo",
    title: "Pottery Paint Night",
    description: "Pick a piece, paint at your own pace, and compare final designs at the end.",
    locationName: "The Clay Room",
    addressLine1: "279 Danforth Ave",
    city: "Toronto",
    stateOrProvince: "ON",
    postalCode: "M4K 1N2",
    country: "Canada",
    classification: "art",
    offsetDays: 21,
  },
  {
    owner: "cameron.demo",
    title: "Open Mic Support Squad",
    description: "Show up together, cheer loudly, and make it easier to go solo to a first open mic.",
    locationName: "The Far Out Lounge",
    addressLine1: "8504 S Congress Ave",
    city: "Austin",
    stateOrProvince: "TX",
    postalCode: "78745",
    country: "USA",
    classification: "music",
    offsetDays: 6,
  },
  {
    owner: "cameron.demo",
    title: "Food Truck Friday Loop",
    description: "Walk a compact food truck route and split bites to try more spots.",
    locationName: "South Congress Hotel",
    addressLine1: "1603 S Congress Ave",
    city: "Austin",
    stateOrProvince: "TX",
    postalCode: "78704",
    country: "USA",
    classification: "food",
    offsetDays: 14,
  },
  {
    owner: "cameron.demo",
    title: "Night Market Meetup",
    description: "Take one loop for browsing and one for actual buying, then compare finds.",
    locationName: "Fareground Austin",
    addressLine1: "111 Congress Ave",
    city: "Austin",
    stateOrProvince: "TX",
    postalCode: "78701",
    country: "USA",
    classification: "market",
    offsetDays: 27,
  },
  {
    owner: "riley.demo",
    title: "Morning Hike and Pastries",
    description: "A beginner-friendly trail followed by pastries and an easy recovery hang.",
    locationName: "Twin Falls Trailhead",
    addressLine1: "41020 SE Homestead Valley Rd",
    city: "North Bend",
    stateOrProvince: "WA",
    postalCode: "98045",
    country: "USA",
    classification: "outdoors",
    offsetDays: 7,
  },
  {
    owner: "riley.demo",
    title: "Rooftop Sketch Session",
    description: "Bring your sketchbook and draw the skyline with prompts for loosening up.",
    locationName: "Olympic Sculpture Park",
    addressLine1: "2901 Western Ave",
    city: "Seattle",
    stateOrProvince: "WA",
    postalCode: "98121",
    country: "USA",
    classification: "art",
    offsetDays: 15,
  },
  {
    owner: "riley.demo",
    title: "Trivia Team Matchmaking",
    description: "Form teams on the spot so nobody has to walk into trivia alone.",
    locationName: "Stoup Brewing Capitol Hill",
    addressLine1: "1158 Broadway",
    city: "Seattle",
    stateOrProvince: "WA",
    postalCode: "98122",
    country: "USA",
    classification: "games",
    offsetDays: 22,
  },
  {
    owner: "taylor.demo",
    title: "Beginner Bouldering Session",
    description: "Warm up together, rotate routes, and celebrate tiny wins.",
    locationName: "Movement RiNo",
    addressLine1: "3201 Walnut St",
    city: "Denver",
    stateOrProvince: "CO",
    postalCode: "80205",
    country: "USA",
    classification: "fitness",
    offsetDays: 9,
  },
  {
    owner: "taylor.demo",
    title: "Poetry Reading Circle",
    description: "Bring one favorite poem to read aloud and one to leave with someone else.",
    locationName: "Tattered Cover Colfax",
    addressLine1: "2526 E Colfax Ave",
    city: "Denver",
    stateOrProvince: "CO",
    postalCode: "80206",
    country: "USA",
    classification: "writing",
    offsetDays: 16,
  },
  {
    owner: "taylor.demo",
    title: "Botanical Garden Wander",
    description: "A slow afternoon walk through the gardens with time for photos and benches.",
    locationName: "Denver Botanic Gardens",
    addressLine1: "1007 York St",
    city: "Denver",
    stateOrProvince: "CO",
    postalCode: "80206",
    country: "USA",
    classification: "outdoors",
    offsetDays: -12,
  },
  {
    owner: "quinn.demo",
    title: "Solo Traveler Story Swap",
    description: "Trade travel stories, misadventures, and favorite itineraries over drinks.",
    locationName: "Cindy's Rooftop",
    addressLine1: "12 S Michigan Ave",
    city: "Chicago",
    stateOrProvince: "IL",
    postalCode: "60603",
    country: "USA",
    classification: "social",
    offsetDays: 1,
  },
  {
    owner: "quinn.demo",
    title: "Record Store Crawl",
    description: "Hit three record stores in one afternoon and swap recommendations between stops.",
    locationName: "Reckless Records Wicker Park",
    addressLine1: "1532 N Milwaukee Ave",
    city: "Chicago",
    stateOrProvince: "IL",
    postalCode: "60622",
    country: "USA",
    classification: "music",
    offsetDays: 12,
  },
  {
    owner: "quinn.demo",
    title: "Community Garden Workday",
    description: "Do one hour of light work together and reward the effort with iced tea after.",
    locationName: "Garfield Park Conservatory",
    addressLine1: "300 N Central Park Ave",
    city: "Chicago",
    stateOrProvince: "IL",
    postalCode: "60624",
    country: "USA",
    classification: "community",
    offsetDays: 24,
  },
  {
    owner: "blake.demo",
    title: "Lunch Break Language Exchange",
    description: "Split the hour between casual conversation and a few targeted speaking prompts.",
    locationName: "San Francisco Main Library",
    addressLine1: "100 Larkin St",
    city: "San Francisco",
    stateOrProvince: "CA",
    postalCode: "94102",
    country: "USA",
    classification: "learning",
    offsetDays: 2,
  },
  {
    owner: "blake.demo",
    title: "Harbor Ferry Day Trip",
    description: "Take a low-effort ferry ride, explore for a bit, and come back before dinner.",
    locationName: "San Francisco Ferry Building",
    addressLine1: "1 Ferry Building",
    city: "San Francisco",
    stateOrProvince: "CA",
    postalCode: "94111",
    country: "USA",
    classification: "travel",
    offsetDays: 17,
  },
  {
    owner: "blake.demo",
    title: "After Work Tennis Rally",
    description: "Play friendly rallies with rotating partners and no pressure to be good.",
    locationName: "Goldman Tennis Center",
    addressLine1: "50 Bowling Green Dr",
    city: "San Francisco",
    stateOrProvince: "CA",
    postalCode: "94118",
    country: "USA",
    classification: "fitness",
    offsetDays: 29,
  },
  {
    owner: "devon.demo",
    title: "Quiet Coworking Sprint",
    description: "Show up with one task you have been avoiding and knock it out together.",
    locationName: "NeueHouse Hollywood",
    addressLine1: "6121 Sunset Blvd",
    city: "Los Angeles",
    stateOrProvince: "CA",
    postalCode: "90028",
    country: "USA",
    classification: "work",
    offsetDays: 3,
  },
  {
    owner: "devon.demo",
    title: "Beach Picnic at Golden Hour",
    description: "Pack your own picnic, join the blanket circle, and stay for sunset.",
    locationName: "Santa Monica Pier",
    addressLine1: "200 Santa Monica Pier",
    city: "Santa Monica",
    stateOrProvince: "CA",
    postalCode: "90401",
    country: "USA",
    classification: "outdoors",
    offsetDays: 19,
  },
  {
    owner: "devon.demo",
    title: "Mini Golf and Milkshakes",
    description: "Keep it playful with a short mini golf course and late-night milkshakes after.",
    locationName: "Castle Park Sherman Oaks",
    addressLine1: "4989 Sepulveda Blvd",
    city: "Sherman Oaks",
    stateOrProvince: "CA",
    postalCode: "91403",
    country: "USA",
    classification: "games",
    offsetDays: -3,
  },
  {
    owner: "harper.demo",
    title: "Farmers Market Breakfast Loop",
    description: "Build breakfast one stall at a time and compare the best finds.",
    locationName: "Union Square Greenmarket",
    addressLine1: "E 17th St and Union Square W",
    city: "New York",
    stateOrProvince: "NY",
    postalCode: "10003",
    country: "USA",
    classification: "food",
    offsetDays: 4,
  },
  {
    owner: "harper.demo",
    title: "Riverside Roller Skate Meetup",
    description: "Beginner-friendly skating with plenty of breaks and no judgement.",
    locationName: "Pier 62 Hudson River Park",
    addressLine1: "195 Hudson River Greenway",
    city: "New York",
    stateOrProvince: "NY",
    postalCode: "10014",
    country: "USA",
    classification: "fitness",
    offsetDays: 20,
  },
  {
    owner: "harper.demo",
    title: "Gallery Hop and Gelato",
    description: "Visit a cluster of galleries and decompress over gelato afterwards.",
    locationName: "Gagosian Chelsea",
    addressLine1: "520 W 21st St",
    city: "New York",
    stateOrProvince: "NY",
    postalCode: "10011",
    country: "USA",
    classification: "culture",
    offsetDays: 26,
  },
  {
    owner: "logan.demo",
    title: "Park Chess and Lemonade",
    description: "Bring a board if you have one and jump into casual games under the trees.",
    locationName: "Piedmont Park",
    addressLine1: "400 Park Dr NE",
    city: "Atlanta",
    stateOrProvince: "GA",
    postalCode: "30306",
    country: "USA",
    classification: "games",
    offsetDays: 6,
  },
  {
    owner: "logan.demo",
    title: "Live Podcast Listening Party",
    description: "Queue up a fan-favorite episode and spend the second half discussing it.",
    locationName: "Atlanta Tech Village",
    addressLine1: "3423 Piedmont Rd NE",
    city: "Atlanta",
    stateOrProvince: "GA",
    postalCode: "30305",
    country: "USA",
    classification: "media",
    offsetDays: 23,
  },
  {
    owner: "logan.demo",
    title: "Community Mural Walk",
    description: "Walk a mural route, take photos, and trade neighborhood recommendations.",
    locationName: "Krog Street Tunnel",
    addressLine1: "1 Krog St NE",
    city: "Atlanta",
    stateOrProvince: "GA",
    postalCode: "30307",
    country: "USA",
    classification: "art",
    offsetDays: 31,
  },
];

const attendancePlan = [
  { eventTitle: `${EVENT_MARKER} Coffee Walk and Book Swap`, attendees: ["jordan.demo", "quinn.demo", "harper.demo"] },
  { eventTitle: `${EVENT_MARKER} Sunset Seawall Run`, attendees: ["riley.demo", "taylor.demo"] },
  { eventTitle: `${EVENT_MARKER} Board Game Cafe Mixer`, attendees: ["avery.demo", "quinn.demo", "logan.demo", "blake.demo"] },
  { eventTitle: `${EVENT_MARKER} Street Photography Walk`, attendees: ["morgan.demo", "sydney.demo"] },
  { eventTitle: `${EVENT_MARKER} Live Jazz and Dessert`, attendees: ["cameron.demo", "harper.demo", "devon.demo"] },
  { eventTitle: `${EVENT_MARKER} Creative Writing Sprint`, attendees: ["taylor.demo", "logan.demo"] },
  { eventTitle: `${EVENT_MARKER} Brunch Club Kickoff`, attendees: ["avery.demo", "quinn.demo", "blake.demo"] },
  { eventTitle: `${EVENT_MARKER} Pottery Paint Night`, attendees: ["morgan.demo", "harper.demo"] },
  { eventTitle: `${EVENT_MARKER} Open Mic Support Squad`, attendees: ["sydney.demo", "riley.demo", "logan.demo"] },
  { eventTitle: `${EVENT_MARKER} Food Truck Friday Loop`, attendees: ["jordan.demo", "devon.demo"] },
  { eventTitle: `${EVENT_MARKER} Morning Hike and Pastries`, attendees: ["avery.demo", "cameron.demo", "harper.demo"] },
  { eventTitle: `${EVENT_MARKER} Trivia Team Matchmaking`, attendees: ["blake.demo", "quinn.demo", "devon.demo"] },
  { eventTitle: `${EVENT_MARKER} Beginner Bouldering Session`, attendees: ["riley.demo", "morgan.demo"] },
  { eventTitle: `${EVENT_MARKER} Solo Traveler Story Swap`, attendees: ["jordan.demo", "harper.demo", "logan.demo"] },
  { eventTitle: `${EVENT_MARKER} Lunch Break Language Exchange`, attendees: ["avery.demo", "sydney.demo", "taylor.demo"] },
  { eventTitle: `${EVENT_MARKER} Quiet Coworking Sprint`, attendees: ["morgan.demo", "quinn.demo"] },
  { eventTitle: `${EVENT_MARKER} Farmers Market Breakfast Loop`, attendees: ["cameron.demo", "riley.demo", "blake.demo"] },
  { eventTitle: `${EVENT_MARKER} Park Chess and Lemonade`, attendees: ["jordan.demo", "taylor.demo", "harper.demo"] },
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildAvatarUrl(username) {
  return `https://picsum.photos/seed/avatar-${slugify(username)}/512/512`;
}

function buildEventImageUrl(blueprint) {
  return `https://picsum.photos/seed/event-${slugify(blueprint.title)}-${slugify(
    blueprint.owner
  )}/1200/800`;
}

function buildEventPayload(blueprint) {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() + blueprint.offsetDays);
  start.setUTCHours(18, 30, 0, 0);

  const end = new Date(start);
  end.setUTCHours(end.getUTCHours() + 2);

  return {
    title: `${EVENT_MARKER} ${blueprint.title}`,
    description: `${blueprint.description} This is scripted demo content for local development.`,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    locationName: blueprint.locationName,
    addressLine1: blueprint.addressLine1,
    city: blueprint.city,
    stateOrProvince: blueprint.stateOrProvince,
    postalCode: blueprint.postalCode,
    country: blueprint.country,
    imageUrl: buildEventImageUrl(blueprint),
    externalUrl: "",
    classification: blueprint.classification,
  };
}

async function requestJson(path, options = {}) {
  try {
    const response = await fetch(`${DEFAULT_BASE_URL}${path}`, options);
    const data = await response.json().catch(() => null);
    return { response, data };
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Unable to reach ${DEFAULT_BASE_URL}. Start the local backend first, then rerun the seed.`
      );
    }

    throw error;
  }
}

async function ensureUser(user) {
  const registerPayload = {
    email: `${user.username}@example.com`,
    username: user.username,
    password: DEMO_PASSWORD,
    firstName: user.firstName,
    lastName: user.lastName,
  };

  const registerAttempt = await requestJson("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registerPayload),
  });

  if (registerAttempt.response.ok) {
    return {
      created: true,
      token: registerAttempt.data.token,
      user: registerAttempt.data.user,
    };
  }

  if (registerAttempt.response.status !== 409) {
    throw new Error(
      `Failed to register ${user.username}: ${registerAttempt.data?.error || registerAttempt.response.status}`
    );
  }

  const loginAttempt = await requestJson("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `${user.username}@example.com`,
      password: DEMO_PASSWORD,
    }),
  });

  if (!loginAttempt.response.ok) {
    throw new Error(
      `Failed to login ${user.username}: ${loginAttempt.data?.error || loginAttempt.response.status}`
    );
  }

  return {
    created: false,
    token: loginAttempt.data.token,
    user: loginAttempt.data.user,
  };
}

async function syncUserProfile(user, token) {
  const updateResult = await requestJson("/api/profile/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: `${user.username}@example.com`,
      avatarUrl: buildAvatarUrl(user.username),
    }),
  });

  if (!updateResult.response.ok) {
    throw new Error(
      `Failed to update profile for ${user.username}: ${
        updateResult.data?.error || updateResult.response.status
      }`
    );
  }
}

async function resetAllEvents(token) {
  const resetResult = await requestJson("/api/admin/events", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!resetResult.response.ok) {
    throw new Error(
      `Failed to reset events: ${resetResult.data?.error || resetResult.response.status}`
    );
  }

  return {
    deletedEvents: resetResult.data?.deletedEvents || 0,
    deletedSoloAttendance: resetResult.data?.deletedSoloAttendance || 0,
  };
}

async function main() {
  if (args.has("--help") || args.has("-h")) {
    console.log("Reusable demo data seeder");
    console.log("");
    console.log("Usage:");
    console.log("  npm run seed:demo");
    console.log("  SEED_API_BASE_URL=http://localhost:5001 npm run seed:demo");
    console.log("");
    console.log(`Shared demo password: ${DEMO_PASSWORD}`);
    console.log(`Instructions: ${INSTRUCTIONS_PATH}`);
    return;
  }

  const userSummary = { created: 0, reused: 0, refreshed: 0 };
  const eventSummary = { created: 0 };
  const soloSummary = { created: 0 };
  const userSessions = new Map();
  const createdEvents = new Map();

  console.log(`Seeding demo data against ${DEFAULT_BASE_URL}`);

  for (const user of demoUsers) {
    const session = await ensureUser(user);
    userSessions.set(user.username, session);

    if (session.created) {
      userSummary.created += 1;
    } else {
      userSummary.reused += 1;
    }

    await syncUserProfile(user, session.token);
    userSummary.refreshed += 1;
  }

  const authSession = userSessions.get(demoUsers[0].username);
  const resetSummary = await resetAllEvents(authSession.token);

  for (const blueprint of eventBlueprints) {
    const payload = buildEventPayload(blueprint);
    const session = userSessions.get(blueprint.owner);
    const createResult = await requestJson("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!createResult.response.ok) {
      throw new Error(
        `Failed to create event "${payload.title}": ${createResult.data?.error || createResult.response.status}`
      );
    }

    createdEvents.set(payload.title, createResult.data);
    eventSummary.created += 1;
  }

  for (const plan of attendancePlan) {
    const targetEvent = createdEvents.get(plan.eventTitle);

    if (!targetEvent?._id) {
      throw new Error(`Could not find event for attendance plan: ${plan.eventTitle}`);
    }

    for (const username of plan.attendees) {
      const session = userSessions.get(username);
      const soloResult = await requestJson(`/api/events/${targetEvent._id}/solo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      if (!soloResult.response.ok) {
        throw new Error(
          `Failed to mark ${username} as going solo for "${plan.eventTitle}": ${
            soloResult.data?.error || soloResult.response.status
          }`
        );
      }

      soloSummary.created += 1;
    }
  }

  console.log("");
  console.log("Demo seed complete.");
  console.log(
    `Users: ${userSummary.created} created, ${userSummary.reused} reused, ${userSummary.refreshed} refreshed`
  );
  console.log(
    `Reset removed ${resetSummary.deletedEvents} events and ${resetSummary.deletedSoloAttendance} going solo links`
  );
  console.log(`Events recreated: ${eventSummary.created}`);
  console.log(`Going solo links recreated: ${soloSummary.created}`);
  console.log(`Credentials and instructions: ${INSTRUCTIONS_PATH}`);
  console.log(`Shared demo password: ${DEMO_PASSWORD}`);
}

main().catch((error) => {
  console.error("Demo seed failed.");
  console.error(error.message);
  process.exitCode = 1;
});
