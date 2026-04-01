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

const state = {
  mood: "curious",
  discovery: "balanced",
  selectedDomains: new Set(["Movie", "Music", "Podcast", "Video", "News"]),
  selectedTags: new Set(["ai", "technology", "science", "cinematic"])
};

const moodSelect = document.getElementById("moodSelect");
const discoverySelect = document.getElementById("discoverySelect");
const domainChips = document.getElementById("domainChips");
const tagChips = document.getElementById("tagChips");
const results = document.getElementById("results");
const resultTemplate = document.getElementById("resultTemplate");
const profileSummary = document.getElementById("profileSummary");
const itemCount = document.getElementById("itemCount");
const domainCount = document.getElementById("domainCount");
const modeLabel = document.getElementById("modeLabel");
const apiStatus = document.getElementById("apiStatus");

let liveCatalogue = [...fallbackCatalogue];

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function renderSelects() {
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

function scoreItem(item) {
  let score = 0;
  const matchedTags = item.tags.filter((tag) => state.selectedTags.has(tag));
  const moodMatch = item.moods.includes(state.mood);
  const domainMatch = state.selectedDomains.has(item.domain);

  if (domainMatch) {
    score += 25;
  }

  if (moodMatch) {
    score += 22;
  }

  score += matchedTags.length * 12;

  if (state.discovery === "familiar") {
    score += domainMatch ? 10 : -12;
  }

  if (state.discovery === "adventurous") {
    score += domainMatch ? -4 : 14;
    if (item.domain === "Podcast" || item.domain === "News") {
      score += 6;
    }
  }

  if (item.tags.includes("ai") && state.selectedTags.has("technology")) {
    score += 4;
  }

  if (item.tags.includes("science") && state.selectedTags.has("space")) {
    score += 4;
  }

  const confidence = Math.min(98, Math.max(52, score));
  const reasonParts = [];
  if (matchedTags.length) {
    reasonParts.push(`${matchedTags.length} tag match${matchedTags.length > 1 ? "es" : ""}`);
  }
  if (moodMatch) {
    reasonParts.push(`${state.mood} mood fit`);
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
  profileSummary.innerHTML = `
    <strong>${titleCase(state.mood)}</strong> mood selected with
    <strong>${titleCase(state.discovery)}</strong> discovery mode.
    The engine is prioritizing <strong>${domains.join(", ")}</strong>
    and using metadata cues such as <strong>${tags.slice(0, 6).join(", ") || "general relevance"}</strong>
    to rank results across formats.
  `;
  itemCount.textContent = String(liveCatalogue.length);
  domainCount.textContent = String(domainOptions.length);
  modeLabel.textContent = discoverySelect.options[discoverySelect.selectedIndex].textContent;
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

  moodSelect.value = state.mood;
  discoverySelect.value = state.discovery;
  renderChips();
  updateRecommendations();
}

document.getElementById("recommendBtn").addEventListener("click", () => {
  updateRecommendations();
});
document.getElementById("surpriseBtn").addEventListener("click", surpriseMe);
moodSelect.addEventListener("change", (event) => {
  state.mood = event.target.value;
  updateSummary();
});
discoverySelect.addEventListener("change", (event) => {
  state.discovery = event.target.value;
  updateSummary();
});

renderSelects();
renderChips();
updateRecommendations();
