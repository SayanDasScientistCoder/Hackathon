const fallbackCatalogue = [
  {
    title: "Inception",
    domain: "Movie",
    platform: "Netflix",
    url: "https://www.netflix.com/title/70131314",
    description: "A cerebral sci-fi thriller about dreams, memory, and high-stakes strategy.",
    tags: ["sci-fi", "mind-bending", "thriller", "strategy", "cinematic"],
    moods: ["focused", "curious", "intense"]
  },
  {
    title: "Interstellar",
    domain: "Movie",
    platform: "Prime Video",
    url: "https://www.primevideo.com/",
    description: "An emotional space epic blending science, wonder, and human survival.",
    tags: ["space", "science", "cinematic", "emotional", "future"],
    moods: ["curious", "reflective", "hopeful"]
  },
  {
    title: "The Social Dilemma",
    domain: "Movie",
    platform: "Netflix",
    url: "https://www.netflix.com/",
    description: "A documentary-drama on algorithms, attention, and the social media economy.",
    tags: ["technology", "society", "documentary", "ai", "ethics"],
    moods: ["focused", "reflective", "serious"]
  },
  {
    title: "Time",
    domain: "Music",
    platform: "Spotify",
    url: "https://open.spotify.com/",
    description: "An orchestral piece with tension, grandeur, and emotional build-up.",
    tags: ["cinematic", "instrumental", "focus", "epic", "emotional"],
    moods: ["focused", "intense", "reflective"]
  },
  {
    title: "Midnight City",
    domain: "Music",
    platform: "Spotify",
    url: "https://open.spotify.com/",
    description: "A synth-driven electronic track with energy, nostalgia, and urban motion.",
    tags: ["electronic", "upbeat", "city", "nostalgia", "creative"],
    moods: ["energetic", "curious", "hopeful"]
  },
  {
    title: "Weightless",
    domain: "Music",
    platform: "YouTube Music",
    url: "https://music.youtube.com/",
    description: "A calming ambient track designed for relaxation and low-stress listening.",
    tags: ["ambient", "calm", "wellness", "instrumental", "peaceful"],
    moods: ["calm", "reflective", "hopeful"]
  },
  {
    title: "Lex Fridman Podcast: AI and Humanity",
    domain: "Podcast",
    platform: "Spotify",
    url: "https://open.spotify.com/",
    description: "A long-form conversation on artificial intelligence, philosophy, and the future.",
    tags: ["ai", "technology", "philosophy", "future", "deep-dive"],
    moods: ["curious", "focused", "reflective"]
  },
  {
    title: "The Daily: Big Tech's Next Race",
    domain: "Podcast",
    platform: "Apple Podcasts",
    url: "https://podcasts.apple.com/",
    description: "A concise news analysis episode on shifting technology competition and regulation.",
    tags: ["technology", "news", "business", "analysis", "society"],
    moods: ["focused", "serious", "curious"]
  },
  {
    title: "Huberman Lab: Sleep Toolkit",
    domain: "Podcast",
    platform: "Spotify",
    url: "https://open.spotify.com/",
    description: "Evidence-based advice on optimizing sleep, recovery, and daily energy.",
    tags: ["health", "science", "wellness", "habits", "performance"],
    moods: ["calm", "focused", "hopeful"]
  },
  {
    title: "AI Explained",
    domain: "Video",
    platform: "YouTube",
    url: "https://www.youtube.com/",
    description: "An accessible explainer video that breaks down AI trends and model behavior.",
    tags: ["ai", "education", "technology", "explainer", "future"],
    moods: ["curious", "focused", "hopeful"]
  },
  {
    title: "Tiny Desk Concert",
    domain: "Video",
    platform: "YouTube",
    url: "https://www.youtube.com/",
    description: "An intimate live performance session with strong musical storytelling.",
    tags: ["music", "live", "creative", "performance", "emotional"],
    moods: ["calm", "hopeful", "reflective"]
  },
  {
    title: "Every Frame a Painting",
    domain: "Video",
    platform: "YouTube",
    url: "https://www.youtube.com/",
    description: "A thoughtful visual essay exploring cinematic craft, pacing, and editing.",
    tags: ["cinematic", "education", "craft", "analysis", "creative"],
    moods: ["focused", "curious", "reflective"]
  },
  {
    title: "Hard Fork: This Week in AI",
    domain: "News",
    platform: "NYTimes",
    url: "https://www.nytimes.com/",
    description: "A technology news feature covering AI product launches, research, and public impact.",
    tags: ["ai", "news", "technology", "analysis", "society"],
    moods: ["curious", "focused", "serious"]
  },
  {
    title: "Latest Space Science Breakthrough",
    domain: "News",
    platform: "BBC",
    url: "https://www.bbc.com/news",
    description: "A science article summarizing recent discoveries in space exploration and astronomy.",
    tags: ["space", "science", "news", "future", "discovery"],
    moods: ["curious", "hopeful", "reflective"]
  },
  {
    title: "Global Wellness Trends",
    domain: "News",
    platform: "Medium",
    url: "https://medium.com/",
    description: "A feature article on mindful routines, health habits, and sustainable self-care.",
    tags: ["wellness", "health", "habits", "lifestyle", "calm"],
    moods: ["calm", "hopeful", "reflective"]
  }
];

const moodOptions = ["curious", "focused", "energetic", "calm", "reflective", "hopeful", "intense", "serious"];
const domainOptions = [...new Set(fallbackCatalogue.map((item) => item.domain))];
const tagOptions = [...new Set(fallbackCatalogue.flatMap((item) => item.tags))].sort();
const profileLibrary = {
  builder: {
    label: "Aarav • AI builder",
    bio: "Builds side projects at night, follows AI launches, prefers explainers and practical deep dives.",
    moodBias: "focused",
    preferredDomains: ["Video", "Podcast", "News", "Movie"],
    favoriteTags: ["ai", "technology", "science", "future", "analysis", "education"],
    preferredPlatforms: ["YouTube", "Spotify", "The Verge", "Wired", "TMDB", "Netflix"],
    avoidedTags: ["lifestyle"],
    crossDomainWeight: 1.1
  },
  explorer: {
    label: "Mira • Culture explorer",
    bio: "Moves fluidly between music, cinema, and thoughtful essays with a taste for discovery.",
    moodBias: "reflective",
    preferredDomains: ["Movie", "Music", "Video", "News"],
    favoriteTags: ["cinematic", "creative", "emotional", "future", "space", "music"],
    preferredPlatforms: ["Spotify", "YouTube", "Prime Video", "TMDB", "BBC"],
    avoidedTags: ["business"],
    crossDomainWeight: 1.25
  },
  reset: {
    label: "Neel • Wellness learner",
    bio: "Looks for calm, science-backed content across wellness, routines, and mindful listening.",
    moodBias: "calm",
    preferredDomains: ["Podcast", "Music", "News", "Video"],
    favoriteTags: ["wellness", "health", "science", "habits", "calm", "peaceful"],
    preferredPlatforms: ["Spotify", "YouTube Music", "BBC", "Medium"],
    avoidedTags: ["thriller"],
    crossDomainWeight: 1.05
  }
};

const state = {
  profileId: "builder",
  mood: "curious",
  discovery: "balanced",
  selectedDomains: new Set(["Movie", "Music", "Podcast", "Video", "News"]),
  selectedTags: new Set(["ai", "technology", "science", "cinematic"])
};

const profileSelect = document.getElementById("profileSelect");
const moodSelect = document.getElementById("moodSelect");
const discoverySelect = document.getElementById("discoverySelect");
const domainChips = document.getElementById("domainChips");
const tagChips = document.getElementById("tagChips");
const profileSignals = document.getElementById("profileSignals");
const connectGoogleBtn = document.getElementById("connectGoogleBtn");
const profileImportStatus = document.getElementById("profileImportStatus");
const results = document.getElementById("results");
const resultTemplate = document.getElementById("resultTemplate");
const profileSummary = document.getElementById("profileSummary");
const itemCount = document.getElementById("itemCount");
const domainCount = document.getElementById("domainCount");
const modeLabel = document.getElementById("modeLabel");
const apiStatus = document.getElementById("apiStatus");

let liveCatalogue = [...fallbackCatalogue];
let importedProfileAvailable = false;

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getActiveProfile() {
  return profileLibrary[state.profileId];
}

function renderSelects() {
  profileSelect.innerHTML = "";
  moodSelect.innerHTML = "";
  Object.entries(profileLibrary).forEach(([id, profile]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = profile.label;
    if (id === state.profileId) {
      option.selected = true;
    }
    profileSelect.appendChild(option);
  });

  moodOptions.forEach((mood) => {
    const option = document.createElement("option");
    option.value = mood;
    option.textContent = titleCase(mood);
    if (mood === state.mood) {
      option.selected = true;
    }
    moodSelect.appendChild(option);
  });
}

function ensureImportedProfile(profile) {
  profileLibrary.youtube_import = {
    label: profile.label || "Imported YouTube profile",
    bio: profile.bio || "Built from the signed-in user's YouTube subscriptions and channel metadata.",
    moodBias: profile.moodBias || "curious",
    preferredDomains: profile.preferredDomains || ["Video", "Podcast", "News", "Movie"],
    favoriteTags: profile.favoriteTags || ["technology", "education", "analysis"],
    preferredPlatforms: profile.preferredPlatforms || ["YouTube", "Spotify", "TMDB"],
    avoidedTags: profile.avoidedTags || [],
    crossDomainWeight: profile.crossDomainWeight || 1.18
  };
  importedProfileAvailable = true;
  renderSelects();
}

function syncStateFromProfile() {
  const profile = getActiveProfile();
  state.mood = profile.moodBias;
  state.selectedDomains = new Set(profile.preferredDomains);
  state.selectedTags = new Set(profile.favoriteTags.slice(0, 6));
  moodSelect.value = state.mood;
}

function createChip(label, selected, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `chip${selected ? " selected" : ""}`;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function renderChips() {
  domainChips.innerHTML = "";
  tagChips.innerHTML = "";

  domainOptions.forEach((domain) => {
    domainChips.appendChild(
      createChip(domain, state.selectedDomains.has(domain), () => {
        if (state.selectedDomains.has(domain)) {
          state.selectedDomains.delete(domain);
        } else {
          state.selectedDomains.add(domain);
        }
        if (state.selectedDomains.size === 0) {
          state.selectedDomains.add(domain);
        }
        renderChips();
        updateSummary();
      })
    );
  });

  tagOptions.forEach((tag) => {
    tagChips.appendChild(
      createChip(tag, state.selectedTags.has(tag), () => {
        if (state.selectedTags.has(tag)) {
          state.selectedTags.delete(tag);
        } else {
          state.selectedTags.add(tag);
        }
        renderChips();
        updateSummary();
      })
    );
  });
}

function renderProfileSignals() {
  const profile = getActiveProfile();
  profileSignals.innerHTML = "";
  [
    `Bias: ${profile.moodBias}`,
    ...profile.preferredDomains.slice(0, 3),
    ...profile.favoriteTags.slice(0, 4),
    ...profile.preferredPlatforms.slice(0, 2)
  ].forEach((signal) => {
    const span = document.createElement("span");
    span.className = "mini-tag";
    span.textContent = signal;
    profileSignals.appendChild(span);
  });
}

function scoreItem(item) {
  const profile = getActiveProfile();
  let score = 10;
  const matchedTags = item.tags.filter((tag) => state.selectedTags.has(tag));
  const profileTagMatches = item.tags.filter((tag) => profile.favoriteTags.includes(tag));
  const moodMatch = item.moods.includes(state.mood);
  const domainMatch = state.selectedDomains.has(item.domain);
  const platformMatch = profile.preferredPlatforms.includes(item.platform);
  const profileDomainMatch = profile.preferredDomains.includes(item.domain);
  const avoidedTagHit = item.tags.some((tag) => profile.avoidedTags.includes(tag));
  const descriptionTokens = `${item.title} ${item.description}`.toLowerCase();
  const profileConceptMatches = profile.favoriteTags.filter((tag) => descriptionTokens.includes(tag)).length;

  if (domainMatch) {
    score += 18;
  }

  if (profileDomainMatch) {
    score += 16;
  }

  if (moodMatch) {
    score += 14;
  }

  score += matchedTags.length * 8;
  score += profileTagMatches.length * 10;
  score += profileConceptMatches * 5;

  if (platformMatch) {
    score += 10;
  }

  if (avoidedTagHit) {
    score -= 18;
  }

  if (state.discovery === "familiar") {
    score += profileDomainMatch ? 12 : -10;
  }

  if (state.discovery === "adventurous") {
    score += profileDomainMatch ? -5 : Math.round(12 * profile.crossDomainWeight);
    if (item.domain !== profile.preferredDomains[0]) {
      score += 4;
    }
  }

  if (item.tags.includes("ai") && state.selectedTags.has("technology")) {
    score += 4;
  }

  if (item.tags.includes("science") && state.selectedTags.has("space")) {
    score += 4;
  }

  const confidence = Math.min(98, Math.max(54, Math.round(score)));
  const reasonParts = [];
  if (profileTagMatches.length) {
    reasonParts.push(`${profileTagMatches.length} profile interest match${profileTagMatches.length > 1 ? "es" : ""}`);
  }
  if (platformMatch) {
    reasonParts.push("preferred platform");
  }
  if (profileDomainMatch) {
    reasonParts.push("profile format fit");
  }
  if (matchedTags.length && !profileTagMatches.length) {
    reasonParts.push(`${matchedTags.length} active filter match${matchedTags.length > 1 ? "es" : ""}`);
  }
  if (moodMatch) {
    reasonParts.push(`${state.mood} profile mood`);
  }
  if (!domainMatch && state.discovery === "adventurous") {
    reasonParts.push("cross-domain stretch");
  }

  return {
    ...item,
    score,
    confidence,
    reason: reasonParts.join(" • ") || "broad profile match"
  };
}

function getRecommendations() {
  return liveCatalogue
    .map(scoreItem)
    .sort((left, right) => right.score - left.score)
    .slice(0, 8);
}

function renderResults() {
  const ranked = getRecommendations();
  results.innerHTML = "";

  ranked.forEach((item) => {
    const node = resultTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".domain-pill").textContent = item.domain;
    node.querySelector(".platform-name").textContent = item.platform;
    node.querySelector("h3").textContent = item.title;
    node.querySelector(".description").textContent = item.description;
    node.querySelector(".score-label").textContent = `${item.confidence}% match`;
    node.querySelector(".reason").textContent = item.reason;

    const tagRow = node.querySelector(".tag-row");
    item.tags.slice(0, 4).forEach((tag) => {
      const span = document.createElement("span");
      span.className = "mini-tag";
      span.textContent = tag;
      tagRow.appendChild(span);
    });

    const link = node.querySelector(".open-link");
    link.href = item.url;
    link.textContent = `Open on ${item.platform}`;

    results.appendChild(node);
  });
}

function updateSummary() {
  const tags = [...state.selectedTags];
  const domains = [...state.selectedDomains];
  const profile = getActiveProfile();
  profileSummary.innerHTML = `
    <strong>${profile.label}</strong> is active.
    ${profile.bio}
    The current profile leans <strong>${titleCase(state.mood)}</strong> with
    <strong>${titleCase(state.discovery)}</strong> discovery mode.
    Recommendations prioritize <strong>${domains.join(", ")}</strong>,
    favorite themes like <strong>${profile.favoriteTags.slice(0, 5).join(", ")}</strong>,
    and platforms such as <strong>${profile.preferredPlatforms.slice(0, 3).join(", ")}</strong>.
    Active session tags still refine ranking through <strong>${tags.slice(0, 6).join(", ") || "general relevance"}</strong>.
  `;
  itemCount.textContent = String(liveCatalogue.length);
  domainCount.textContent = String(domainOptions.length);
  modeLabel.textContent = discoverySelect.options[discoverySelect.selectedIndex].textContent;
}

async function fetchImportedProfile() {
  try {
    const response = await fetch("/api/profile");
    if (!response.ok) {
      throw new Error(`Profile request failed with ${response.status}`);
    }
    const payload = await response.json();
    if (payload.connected && payload.profile) {
      ensureImportedProfile(payload.profile);
      profileImportStatus.textContent = `Connected to Google/YouTube as ${payload.profile.label}.`;
      connectGoogleBtn.textContent = "Refresh imported profile";
      state.profileId = "youtube_import";
      profileSelect.value = state.profileId;
      syncStateFromProfile();
      renderChips();
      renderProfileSignals();
      return;
    }

    profileImportStatus.textContent = payload.configured
      ? "Connect Google / YouTube to import subscription-based interests."
      : "Add Google OAuth credentials in .env to enable YouTube profile import.";
  } catch (error) {
    profileImportStatus.textContent = "Could not load imported profile. Using local profile presets.";
  }
}

function setApiStatus(message, tone = "info") {
  apiStatus.textContent = message;
  apiStatus.classList.add("visible");
  apiStatus.style.color = tone === "warning" ? "#8a5a13" : "var(--muted)";
}

function normalizeApiItems(items) {
  return items
    .filter((item) => item && item.title && item.url)
    .map((item) => ({
      title: item.title,
      domain: item.domain,
      platform: item.platform,
      url: item.url,
      description: item.description || "No description available.",
      tags: Array.isArray(item.tags) && item.tags.length ? item.tags : ["general"],
      moods: Array.isArray(item.moods) && item.moods.length ? item.moods : [state.mood]
    }));
}

async function fetchLiveRecommendations() {
  const params = new URLSearchParams({
    mood: state.mood,
    discovery: state.discovery,
    domains: [...state.selectedDomains].join(","),
    tags: [...state.selectedTags].join(",")
  });

  const response = await fetch(`/api/recommendations?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }
  return response.json();
}

async function refreshCatalogue() {
  try {
    const payload = await fetchLiveRecommendations();
    const normalized = normalizeApiItems(payload.items || []);
    if (normalized.length) {
      liveCatalogue = normalized;
      const enabledSources = (payload.sources || []).join(", ") || "configured APIs";
      setApiStatus(`Showing live recommendations from ${enabledSources}.`);
      return;
    }

    liveCatalogue = [...fallbackCatalogue];
    setApiStatus("API endpoint responded, but no live items were returned. Showing fallback catalogue.", "warning");
  } catch (error) {
    liveCatalogue = [...fallbackCatalogue];
    setApiStatus("Live APIs are unavailable or not configured. Showing fallback catalogue for the demo.", "warning");
  }
}

async function updateRecommendations() {
  await refreshCatalogue();
  updateSummary();
  renderResults();
}

function surpriseMe() {
  const profileIds = Object.keys(profileLibrary);
  state.profileId = profileIds[Math.floor(Math.random() * profileIds.length)];
  state.mood = moodOptions[Math.floor(Math.random() * moodOptions.length)];
  state.discovery = ["balanced", "familiar", "adventurous"][Math.floor(Math.random() * 3)];
  state.selectedDomains = new Set(domainOptions.filter(() => Math.random() > 0.35));
  if (state.selectedDomains.size === 0) {
    state.selectedDomains.add(domainOptions[Math.floor(Math.random() * domainOptions.length)]);
  }
  state.selectedTags = new Set(tagOptions.filter(() => Math.random() > 0.78).slice(0, 6));
  if (state.selectedTags.size === 0) {
    state.selectedTags.add(tagOptions[Math.floor(Math.random() * tagOptions.length)]);
  }

  profileSelect.value = state.profileId;
  moodSelect.value = state.mood;
  discoverySelect.value = state.discovery;
  renderChips();
  renderProfileSignals();
  updateRecommendations();
}

profileSelect.addEventListener("change", (event) => {
  state.profileId = event.target.value;
  syncStateFromProfile();
  renderProfileSignals();
  renderChips();
  updateRecommendations();
});
document.getElementById("recommendBtn").addEventListener("click", () => {
  updateRecommendations();
});
document.getElementById("surpriseBtn").addEventListener("click", surpriseMe);
connectGoogleBtn.addEventListener("click", () => {
  window.location.href = "/auth/google/start";
});
moodSelect.addEventListener("change", (event) => {
  state.mood = event.target.value;
  updateSummary();
});
discoverySelect.addEventListener("change", (event) => {
  state.discovery = event.target.value;
  updateSummary();
});

renderSelects();
syncStateFromProfile();
renderChips();
renderProfileSignals();
fetchImportedProfile().finally(() => {
  updateRecommendations();
});
