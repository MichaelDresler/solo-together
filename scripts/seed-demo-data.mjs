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
    locationName: "North Loop Coffee Club",
    city: "Vancouver",
    stateOrProvince: "BC",
    country: "Canada",
    classification: "social",
    offsetDays: 2,
  },
  {
    owner: "avery.demo",
    title: "Sunset Seawall Run",
    description: "A no-pressure evening run with a cooldown hang by the water.",
    locationName: "Stanley Park Seawall",
    city: "Vancouver",
    stateOrProvince: "BC",
    country: "Canada",
    classification: "fitness",
    offsetDays: 8,
  },
  {
    owner: "avery.demo",
    title: "Indie Film Double Feature",
    description: "Catch two indie films back to back and compare notes over late snacks.",
    locationName: "Rio Theatre",
    city: "Vancouver",
    stateOrProvince: "BC",
    country: "Canada",
    classification: "film",
    offsetDays: 18,
  },
  {
    owner: "jordan.demo",
    title: "Board Game Cafe Mixer",
    description: "Meet new people over fast cooperative games and a rotating snack table.",
    locationName: "Rain City Tabletop",
    city: "Seattle",
    stateOrProvince: "WA",
    country: "USA",
    classification: "games",
    offsetDays: 3,
  },
  {
    owner: "jordan.demo",
    title: "Street Photography Walk",
    description: "An early evening photo walk focused on candid shots, neon signs, and city textures.",
    locationName: "Capitol Hill Station",
    city: "Seattle",
    stateOrProvince: "WA",
    country: "USA",
    classification: "art",
    offsetDays: 11,
  },
  {
    owner: "jordan.demo",
    title: "Late Night Dumpling Run",
    description: "A social dinner stop for anyone who wants to trade favorite spots and order family style.",
    locationName: "Dumpling House",
    city: "Seattle",
    stateOrProvince: "WA",
    country: "USA",
    classification: "food",
    offsetDays: 25,
  },
  {
    owner: "morgan.demo",
    title: "Live Jazz and Dessert",
    description: "Listen to a local trio, grab dessert, and keep the evening low-key.",
    locationName: "Blue Note Lounge",
    city: "Portland",
    stateOrProvince: "OR",
    country: "USA",
    classification: "music",
    offsetDays: 4,
  },
  {
    owner: "morgan.demo",
    title: "Creative Writing Sprint",
    description: "Bring a notebook, write in short bursts, and share if you feel like it.",
    locationName: "Rose City Library",
    city: "Portland",
    stateOrProvince: "OR",
    country: "USA",
    classification: "writing",
    offsetDays: 10,
  },
  {
    owner: "morgan.demo",
    title: "Sunday Vintage Market Browse",
    description: "A slow market browse with coffee breaks and optional lunch after.",
    locationName: "Warehouse Market Hall",
    city: "Portland",
    stateOrProvince: "OR",
    country: "USA",
    classification: "shopping",
    offsetDays: -5,
  },
  {
    owner: "sydney.demo",
    title: "Brunch Club Kickoff",
    description: "Try a new brunch spot and keep the conversation flowing with get-to-know-you prompts.",
    locationName: "Golden Hour Kitchen",
    city: "Toronto",
    stateOrProvince: "ON",
    country: "Canada",
    classification: "food",
    offsetDays: 5,
  },
  {
    owner: "sydney.demo",
    title: "Museum Friday Lates",
    description: "Explore the exhibits after work and regroup for drinks nearby.",
    locationName: "City Museum",
    city: "Toronto",
    stateOrProvince: "ON",
    country: "Canada",
    classification: "culture",
    offsetDays: 13,
  },
  {
    owner: "sydney.demo",
    title: "Pottery Paint Night",
    description: "Pick a piece, paint at your own pace, and compare final designs at the end.",
    locationName: "Clay Corner Studio",
    city: "Toronto",
    stateOrProvince: "ON",
    country: "Canada",
    classification: "art",
    offsetDays: 21,
  },
  {
    owner: "cameron.demo",
    title: "Open Mic Support Squad",
    description: "Show up together, cheer loudly, and make it easier to go solo to a first open mic.",
    locationName: "Signal Room",
    city: "Austin",
    stateOrProvince: "TX",
    country: "USA",
    classification: "music",
    offsetDays: 6,
  },
  {
    owner: "cameron.demo",
    title: "Food Truck Friday Loop",
    description: "Walk a compact food truck route and split bites to try more spots.",
    locationName: "South Congress",
    city: "Austin",
    stateOrProvince: "TX",
    country: "USA",
    classification: "food",
    offsetDays: 14,
  },
  {
    owner: "cameron.demo",
    title: "Night Market Meetup",
    description: "Take one loop for browsing and one for actual buying, then compare finds.",
    locationName: "Riverside Night Market",
    city: "Austin",
    stateOrProvince: "TX",
    country: "USA",
    classification: "market",
    offsetDays: 27,
  },
  {
    owner: "riley.demo",
    title: "Morning Hike and Pastries",
    description: "A beginner-friendly trail followed by pastries and an easy recovery hang.",
    locationName: "Twin Falls Trailhead",
    city: "Seattle",
    stateOrProvince: "WA",
    country: "USA",
    classification: "outdoors",
    offsetDays: 7,
  },
  {
    owner: "riley.demo",
    title: "Rooftop Sketch Session",
    description: "Bring your sketchbook and draw the skyline with prompts for loosening up.",
    locationName: "Top Floor Commons",
    city: "Seattle",
    stateOrProvince: "WA",
    country: "USA",
    classification: "art",
    offsetDays: 15,
  },
  {
    owner: "riley.demo",
    title: "Trivia Team Matchmaking",
    description: "Form teams on the spot so nobody has to walk into trivia alone.",
    locationName: "Pine Street Taproom",
    city: "Seattle",
    stateOrProvince: "WA",
    country: "USA",
    classification: "games",
    offsetDays: 22,
  },
  {
    owner: "taylor.demo",
    title: "Beginner Bouldering Session",
    description: "Warm up together, rotate routes, and celebrate tiny wins.",
    locationName: "North Face Climbing Gym",
    city: "Denver",
    stateOrProvince: "CO",
    country: "USA",
    classification: "fitness",
    offsetDays: 9,
  },
  {
    owner: "taylor.demo",
    title: "Poetry Reading Circle",
    description: "Bring one favorite poem to read aloud and one to leave with someone else.",
    locationName: "Juniper Books",
    city: "Denver",
    stateOrProvince: "CO",
    country: "USA",
    classification: "writing",
    offsetDays: 16,
  },
  {
    owner: "taylor.demo",
    title: "Botanical Garden Wander",
    description: "A slow afternoon walk through the gardens with time for photos and benches.",
    locationName: "Denver Botanic Gardens",
    city: "Denver",
    stateOrProvince: "CO",
    country: "USA",
    classification: "outdoors",
    offsetDays: -12,
  },
  {
    owner: "quinn.demo",
    title: "Solo Traveler Story Swap",
    description: "Trade travel stories, misadventures, and favorite itineraries over drinks.",
    locationName: "Atlas Bar",
    city: "Chicago",
    stateOrProvince: "IL",
    country: "USA",
    classification: "social",
    offsetDays: 1,
  },
  {
    owner: "quinn.demo",
    title: "Record Store Crawl",
    description: "Hit three record stores in one afternoon and swap recommendations between stops.",
    locationName: "Wicker Park",
    city: "Chicago",
    stateOrProvince: "IL",
    country: "USA",
    classification: "music",
    offsetDays: 12,
  },
  {
    owner: "quinn.demo",
    title: "Community Garden Workday",
    description: "Do one hour of light work together and reward the effort with iced tea after.",
    locationName: "Green Patch Garden",
    city: "Chicago",
    stateOrProvince: "IL",
    country: "USA",
    classification: "community",
    offsetDays: 24,
  },
  {
    owner: "blake.demo",
    title: "Lunch Break Language Exchange",
    description: "Split the hour between casual conversation and a few targeted speaking prompts.",
    locationName: "Central Library Cafe",
    city: "San Francisco",
    stateOrProvince: "CA",
    country: "USA",
    classification: "learning",
    offsetDays: 2,
  },
  {
    owner: "blake.demo",
    title: "Harbor Ferry Day Trip",
    description: "Take a low-effort ferry ride, explore for a bit, and come back before dinner.",
    locationName: "Pier Ferry Terminal",
    city: "San Francisco",
    stateOrProvince: "CA",
    country: "USA",
    classification: "travel",
    offsetDays: 17,
  },
  {
    owner: "blake.demo",
    title: "After Work Tennis Rally",
    description: "Play friendly rallies with rotating partners and no pressure to be good.",
    locationName: "Mission Courts",
    city: "San Francisco",
    stateOrProvince: "CA",
    country: "USA",
    classification: "fitness",
    offsetDays: 29,
  },
  {
    owner: "devon.demo",
    title: "Quiet Coworking Sprint",
    description: "Show up with one task you have been avoiding and knock it out together.",
    locationName: "Common Room Workspace",
    city: "Los Angeles",
    stateOrProvince: "CA",
    country: "USA",
    classification: "work",
    offsetDays: 3,
  },
  {
    owner: "devon.demo",
    title: "Beach Picnic at Golden Hour",
    description: "Pack your own picnic, join the blanket circle, and stay for sunset.",
    locationName: "Santa Monica Beach",
    city: "Los Angeles",
    stateOrProvince: "CA",
    country: "USA",
    classification: "outdoors",
    offsetDays: 19,
  },
  {
    owner: "devon.demo",
    title: "Mini Golf and Milkshakes",
    description: "Keep it playful with a short mini golf course and late-night milkshakes after.",
    locationName: "Glow Putt",
    city: "Los Angeles",
    stateOrProvince: "CA",
    country: "USA",
    classification: "games",
    offsetDays: -3,
  },
  {
    owner: "harper.demo",
    title: "Farmers Market Breakfast Loop",
    description: "Build breakfast one stall at a time and compare the best finds.",
    locationName: "Union Square Market",
    city: "New York",
    stateOrProvince: "NY",
    country: "USA",
    classification: "food",
    offsetDays: 4,
  },
  {
    owner: "harper.demo",
    title: "Riverside Roller Skate Meetup",
    description: "Beginner-friendly skating with plenty of breaks and no judgement.",
    locationName: "Riverside Park",
    city: "New York",
    stateOrProvince: "NY",
    country: "USA",
    classification: "fitness",
    offsetDays: 20,
  },
  {
    owner: "harper.demo",
    title: "Gallery Hop and Gelato",
    description: "Visit a cluster of galleries and decompress over gelato afterwards.",
    locationName: "Chelsea Arts District",
    city: "New York",
    stateOrProvince: "NY",
    country: "USA",
    classification: "culture",
    offsetDays: 26,
  },
  {
    owner: "logan.demo",
    title: "Park Chess and Lemonade",
    description: "Bring a board if you have one and jump into casual games under the trees.",
    locationName: "Highland Park",
    city: "Atlanta",
    stateOrProvince: "GA",
    country: "USA",
    classification: "games",
    offsetDays: 6,
  },
  {
    owner: "logan.demo",
    title: "Live Podcast Listening Party",
    description: "Queue up a fan-favorite episode and spend the second half discussing it.",
    locationName: "Common House",
    city: "Atlanta",
    stateOrProvince: "GA",
    country: "USA",
    classification: "media",
    offsetDays: 23,
  },
  {
    owner: "logan.demo",
    title: "Community Mural Walk",
    description: "Walk a mural route, take photos, and trade neighborhood recommendations.",
    locationName: "Old Fourth Ward",
    city: "Atlanta",
    stateOrProvince: "GA",
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
    addressLine1: "",
    city: blueprint.city,
    stateOrProvince: blueprint.stateOrProvince,
    postalCode: "",
    country: blueprint.country,
    imageUrl: "",
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
      username: user.username,
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

function getEventOwnerUsername(event) {
  return (
    event?.createdBy?.username ||
    event?.userId?.username ||
    event?.createdBy ||
    event?.userId ||
    ""
  );
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

  const userSummary = { created: 0, reused: 0 };
  const eventSummary = { created: 0, reused: 0 };
  const soloSummary = { created: 0, reused: 0 };
  const userSessions = new Map();

  console.log(`Seeding demo data against ${DEFAULT_BASE_URL}`);

  for (const user of demoUsers) {
    const session = await ensureUser(user);
    userSessions.set(user.username, session);
    if (session.created) {
      userSummary.created += 1;
    } else {
      userSummary.reused += 1;
    }
  }

  const eventsResult = await requestJson("/api/events");
  if (!eventsResult.response.ok || !Array.isArray(eventsResult.data)) {
    throw new Error(
      `Failed to list events: ${eventsResult.data?.error || eventsResult.response.status}`
    );
  }

  const existingEvents = new Map();
  for (const event of eventsResult.data) {
    const ownerUsername = getEventOwnerUsername(event);
    existingEvents.set(`${event.title}::${ownerUsername}`, event);
  }

  for (const blueprint of eventBlueprints) {
    const payload = buildEventPayload(blueprint);
    const key = `${payload.title}::${blueprint.owner}`;

    if (existingEvents.has(key)) {
      eventSummary.reused += 1;
      continue;
    }

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

    existingEvents.set(key, createResult.data);
    eventSummary.created += 1;
  }

  const authSession = userSessions.get(demoUsers[0].username);

  for (const plan of attendancePlan) {
    const targetEvent = [...existingEvents.values()].find(
      (event) => event.title === plan.eventTitle
    );

    if (!targetEvent?._id) {
      throw new Error(`Could not find event for attendance plan: ${plan.eventTitle}`);
    }

    const attendeesResult = await requestJson(`/api/events/${targetEvent._id}/solo-attendees`, {
      headers: {
        Authorization: `Bearer ${authSession.token}`,
      },
    });

    if (!attendeesResult.response.ok || !Array.isArray(attendeesResult.data)) {
      throw new Error(
        `Failed to load attendees for "${plan.eventTitle}": ${attendeesResult.data?.error || attendeesResult.response.status}`
      );
    }

    const existingAttendees = new Set(
      attendeesResult.data
        .map((attendance) => attendance?.userId?.username)
        .filter(Boolean)
    );

    for (const username of plan.attendees) {
      if (existingAttendees.has(username)) {
        soloSummary.reused += 1;
        continue;
      }

      const session = userSessions.get(username);
      const soloResult = await requestJson(`/api/events/${targetEvent._id}/solo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      if (!soloResult.response.ok) {
        throw new Error(
          `Failed to mark ${username} as going solo for "${plan.eventTitle}": ${soloResult.data?.error || soloResult.response.status}`
        );
      }

      existingAttendees.add(username);
      soloSummary.created += 1;
    }
  }

  console.log("");
  console.log("Demo seed complete.");
  console.log(`Users: ${userSummary.created} created, ${userSummary.reused} reused`);
  console.log(`Events: ${eventSummary.created} created, ${eventSummary.reused} reused`);
  console.log(`Going solo links: ${soloSummary.created} created, ${soloSummary.reused} reused`);
  console.log(`Credentials and instructions: ${INSTRUCTIONS_PATH}`);
  console.log(`Shared demo password: ${DEMO_PASSWORD}`);
}

main().catch((error) => {
  console.error("Demo seed failed.");
  console.error(error.message);
  process.exitCode = 1;
});
