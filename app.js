const inputs = [
  document.getElementById("text-1"),
  document.getElementById("text-2"),
  document.getElementById("text-3"),
  document.getElementById("text-4"),
  document.getElementById("text-5"),
  document.getElementById("text-6")
];

const exampleSelect = document.getElementById("example-select");
const buildMapBtn = document.getElementById("build-map");
const statusEl = document.getElementById("status");
const summaryEl = document.getElementById("summary");
const mapInner = document.getElementById("map-inner");
const mapEmpty = document.getElementById("map-empty-state");
const similarityTable = document.getElementById("similarity-table");
const notesText = document.getElementById("notes-text");

const COLORS = [
  "#f4a7b9",
  "#8fd0ff",
  "#b4f5c6",
  "#f7d27b",
  "#c3b8ff",
  "#ff9fb8"
];

const STOPWORDS = new Set([
  "the","a","an","to","and","or","of","for","on","in","at","is","are","was","were","this","that","it","my","our","your","with","from","by","as","be","can","do","how","what","why","when","where","which","who","will","would","should","could","about","into","over","under"
]);

// Three example sets for different scenarios
const EXAMPLE_SETS = {
  support: [
    "How do I reset my password?",
    "Steps to fix login issues.",
    "How can I update my billing information?",
    "Where can I see my previous invoices?",
    "Your app keeps logging me out every hour.",
    "I’m not receiving the verification email."
  ],
  product_vs_finance: [
    "New dashboard lets teams track adoption by segment.",
    "We shipped faster search and better filters for large workspaces.",
    "Quarterly revenue increased 12% year-over-year.",
    "Operating margin improved 3 points this quarter.",
    "We’re rolling out a redesigned settings page for admins.",
    "Cash flow from operations reached a new high this year."
  ],
  recipes: [
    "Healthy vegan pasta recipe.",
    "Quick vegetarian meal ideas for weeknights.",
    "Slow-cooked beef stew with red wine.",
    "10-minute avocado toast with chili flakes.",
    "High-protein breakfast smoothie with oats.",
    "Baked salmon with lemon and garlic."
  ]
};

const EXAMPLE_LABELS = {
  support: "Customer Support FAQs",
  product_vs_finance: "Product vs Finance Updates",
  recipes: "Recipes & Meal Ideas"
};

function setStatus(text) {
  statusEl.textContent = text || "";
}

function summaryIdle(text) {
  summaryEl.innerHTML = `
    <div class="summary-badge summary-badge-idle">
      ${text}
    </div>
  `;
}

function summaryOk(text) {
  summaryEl.innerHTML = `
    <div class="summary-badge summary-badge-ok">
      ${text}
    </div>
  `;
}

function summaryWarn(text) {
  summaryEl.innerHTML = `
    <div class="summary-badge summary-badge-warn">
      ${text}
    </div>
  `;
}

// Simple tokenization: lowercase, remove non-letters, split, drop stopwords
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !STOPWORDS.has(t));
}

// Build vocabulary and vectors
function buildVectors(texts) {
  const tokensList = texts.map((t) => tokenize(t));
  const vocabSet = new Set();
  tokensList.forEach((tokens) => {
    tokens.forEach((token) => vocabSet.add(token));
  });
  const vocab = Array.from(vocabSet);
  if (vocab.length === 0) {
    // All empty, return zero vectors
    return {
      vocab,
      vectors: texts.map(() => [])
    };
  }

  const vectors = tokensList.map((tokens) => {
    const vec = new Array(vocab.length).fill(0);
    tokens.forEach((token) => {
      const idx = vocab.indexOf(token);
      if (idx >= 0) vec[idx] += 1;
    });
    return vec;
  });

  return { vocab, vectors };
}

function cosineSim(v1, v2) {
  if (!v1.length || !v2.length) return 0;
  let dot = 0;
  let n1 = 0;
  let n2 = 0;
  for (let i = 0; i < v1.length; i++) {
    const a = v1[i];
    const b = v2[i];
    dot += a * b;
    n1 += a * a;
    n2 += b * b;
  }
  if (n1 === 0 || n2 === 0) return 0;
  return dot / (Math.sqrt(n1) * Math.sqrt(n2));
}

// Force-directed 2D layout based on similarity
function computeLayout(simMatrix, n) {
  if (n === 1) {
    return [{ x: 0.5, y: 0.5 }];
  }

  // Initialize points on a circle
  const points = [];
  const radius = 0.3;
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n;
    points.push({
      x: 0.5 + radius * Math.cos(angle),
      y: 0.5 + radius * Math.sin(angle)
    });
  }

  const iterations = 180;
  const k = 0.08;
  const dt = 0.7;

  for (let iter = 0; iter < iterations; iter++) {
    const forces = points.map(() => ({ fx: 0, fy: 0 }));

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const pi = points[i];
        const pj = points[j];
        let dx = pi.x - pj.x;
        let dy = pi.y - pj.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;

        const sim = simMatrix[i][j];
        // Map similarity to target distance: high sim -> closer
        const target = 0.25 + (1 - sim) * 0.6;

        const forceMag = (dist - target) * k;
        const fx = (dx / dist) * forceMag;
        const fy = (dy / dist) * forceMag;

        forces[i].fx -= fx;
        forces[i].fy -= fy;
        forces[j].fx += fx;
        forces[j].fy += fy;
      }
    }

    for (let i = 0; i < n; i++) {
      points[i].x += forces[i].fx * dt;
      points[i].y += forces[i].fy * dt;
    }
  }

  // Normalize into [0.08, 0.92] x [0.12, 0.88]
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  points.forEach((p) => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  return points.map((p) => ({
    x: 0.08 + ((p.x - minX) / rangeX) * 0.84,
    y: 0.12 + ((p.y - minY) / rangeY) * 0.76
  }));
}

// Build similarity matrix table
function renderSimilarityTable(labels, simMatrix) {
  const n = labels.length;
  if (n === 0) {
    similarityTable.innerHTML = "";
    return;
  }

  let html = "<thead><tr><th></th>";
  for (let j = 0; j < n; j++) {
    html += `<th>Text ${labels[j]}</th>`;
  }
  html += "</tr></thead><tbody>";

  for (let i = 0; i < n; i++) {
    html += `<tr><td class="row-header row-header-cell">Text ${labels[i]}</td>`;
    for (let j = 0; j < n; j++) {
      if (i === j) {
        html += `<td class="diagonal">1.00</td>`;
      } else {
        const val = simMatrix[i][j] ?? 0;
        html += `<td>${val.toFixed(2)}</td>`;
      }
    }
    html += "</tr>";
  }

  html += "</tbody>";
  similarityTable.innerHTML = html;

  // Add sticky row header class to first column cells
  const firstColCells = similarityTable.querySelectorAll("td.row-header-cell");
  firstColCells.forEach((cell) => {
    cell.classList.add("row-header");
  });
}

// Generate interpretation notes
function generateNotes(texts, simMatrix) {
  const n = texts.length;
  if (n < 2) {
    return "Add more texts to compare how similarity creates clusters on the map.";
  }

  let maxSim = -1;
  let maxPair = [0, 1];
  let minSim = 1;
  let minPair = [0, 1];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const s = simMatrix[i][j];
      if (s > maxSim) {
        maxSim = s;
        maxPair = [i, j];
      }
      if (s < minSim) {
        minSim = s;
        minPair = [i, j];
      }
    }
  }

  const labels = (idx) => `Text ${idx + 1}`;

  const notes = [];

  notes.push(
    `The most similar pair is ${labels(maxPair[0])} and ${labels(
      maxPair[1]
    )} (similarity ≈ ${maxSim.toFixed(
      2
    )}). They should appear close together on the map.`
  );

  notes.push(
    `The least similar pair is ${labels(minPair[0])} and ${labels(
      minPair[1]
    )} (similarity ≈ ${minSim.toFixed(
      2
    )}). They should appear farther apart.`
  );

  if (n >= 3) {
    notes.push(
      "Clusters indicate groups of texts that share vocabulary and topic; isolated points often represent outliers or distinct themes."
    );
  }

  notes.push(
    "In an interview, you can use this to explain embeddings as “turning meaning into coordinates,” then show how retrieval and semantic search build on that idea."
  );

  return notes.join(" ");
}

// Render points onto the map
function renderMap(texts, positions) {
  mapInner.innerHTML = "";
  if (mapEmpty && mapEmpty.parentNode) {
    mapEmpty.parentNode.removeChild(mapEmpty);
  }

  const n = texts.length;

  for (let i = 0; i < n; i++) {
    const p = positions[i];
    const pointEl = document.createElement("div");
    pointEl.className = "map-point";
    pointEl.style.left = (p.x * 100).toFixed(2) + "%";
    pointEl.style.top = (p.y * 100).toFixed(2) + "%";

    const dotEl = document.createElement("div");
    dotEl.className = "map-dot";
    dotEl.style.backgroundColor = COLORS[i % COLORS.length];

    const labelEl = document.createElement("div");
    labelEl.className = "map-label";
    labelEl.textContent = `Text ${i + 1}`;

    pointEl.appendChild(dotEl);
    pointEl.appendChild(labelEl);
    mapInner.appendChild(pointEl);
  }
}

// When the user selects an example, auto-load it into the inputs
exampleSelect.addEventListener("change", () => {
  const key = exampleSelect.value;

  if (!key) {
    setStatus("");
    summaryIdle("No map yet. Add 3–6 texts or select an example set, then click Build Map to see how they cluster.");
    return;
  }

  const set = EXAMPLE_SETS[key];
  const label = EXAMPLE_LABELS[key] || "example set";

  if (!set) {
    setStatus("Example set not found.");
    summaryWarn("Something went wrong loading that example set.");
    return;
  }

  set.forEach((text, idx) => {
    if (inputs[idx]) {
      inputs[idx].value = text;
    }
  });

  setStatus(`Loaded example set: ${label}. You can edit any text before building the map.`);
  summaryIdle(`Example set "${label}" loaded. Click Build Map to see how the texts cluster.`);
});

// Build map
buildMapBtn.addEventListener("click", () => {
  const texts = inputs
    .map((el) => (el.value || "").trim())
    .map((t) => t.replace(/\s+/g, " "))
    .filter((t) => t.length > 0);

  if (texts.length < 2) {
    setStatus("Please enter at least 2 texts.");
    summaryWarn("Need at least 2 texts to compute similarity.");
    return;
  }

  setStatus("");

  const { vectors } = buildVectors(texts);

  const n = texts.length;
  const simMatrix = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    simMatrix[i][i] = 1;
    for (let j = i + 1; j < n; j++) {
      const s = cosineSim(vectors[i], vectors[j]);
      simMatrix[i][j] = s;
      simMatrix[j][i] = s;
    }
  }

  const positions = computeLayout(simMatrix, n);
  renderMap(texts, positions);

  renderSimilarityTable(
    Array.from({ length: n }, (_, i) => i + 1),
    simMatrix
  );

  const notes = generateNotes(texts, simMatrix);
  notesText.textContent = notes;

  summaryOk(`Built a map for ${n} text${n > 1 ? "s" : ""}. Use distance to explain similarity.`);
});

// Initial summary
summaryIdle("No map yet. Add 3–6 texts or select an example set, then click Build Map to see how they cluster.");
