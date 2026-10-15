const titleEl = document.getElementById("leaderboard-title");
const listEl = document.getElementById("leaderboard-list");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// player id -> row elements, so rows persist between renders
const rows = new Map();
let winScore = 0;
let lastSignature = "";

export function setWinScore(score) {
  winScore = score;
  titleEl.textContent = `First to ${score} coins`;
  lastSignature = "";
}

function createRow() {
  const el = document.createElement("li");
  el.className = "score-row";

  const line = document.createElement("div");
  line.className = "score-line";
  const name = document.createElement("span");
  name.className = "score-name";
  const you = document.createElement("span");
  you.className = "score-you";
  you.textContent = "you";
  const value = document.createElement("span");
  value.className = "score-value";
  line.append(name, you, value);

  const pips = document.createElement("div");
  pips.className = "score-pips";
  pips.setAttribute("aria-hidden", "true");

  el.append(line, pips);
  return { el, name, you, value, pips, score: null };
}

function updatePips(row, score) {
  if (row.pips.childElementCount !== winScore) {
    row.pips.style.setProperty("--pip-count", winScore);
    row.pips.replaceChildren(
      ...Array.from({ length: winScore }, () => {
        const pip = document.createElement("span");
        pip.className = "pip";
        return pip;
      }),
    );
  }

  [...row.pips.children].forEach((pip, i) => {
    pip.classList.toggle("is-filled", i < score);
  });

  const earnedCoin = row.score !== null && score > row.score;
  if (earnedCoin && !reduceMotion.matches && score <= winScore) {
    row.pips.children[score - 1].animate(
      [{ transform: "scale(1.7)" }, { transform: "scale(1)" }],
      { duration: 320, easing: "cubic-bezier(.2, .8, .3, 1.4)" },
    );
  }
}

export function renderLeaderboard(players, currentPlayerId) {
  // players arrive every server tick; only touch the DOM when something changed
  const signature = `${currentPlayerId}|${winScore}|${players
    .map((player) => `${player.id}:${player.name}:${player.score}`)
    .join(",")}`;
  if (signature === lastSignature) return;
  lastSignature = signature;

  const sortedPlayers = [...players].sort((p1, p2) => p2.score - p1.score);
  const seen = new Set();

  for (const player of sortedPlayers) {
    let row = rows.get(player.id);
    if (!row) {
      row = createRow();
      rows.set(player.id, row);
    }

    const isCurrentPlayer = player.id === currentPlayerId;
    row.el.classList.toggle("is-self", isCurrentPlayer);
    row.you.hidden = !isCurrentPlayer;
    row.name.textContent = player.name;
    row.value.textContent = player.score;
    row.el.setAttribute(
      "aria-label",
      `${player.name}${isCurrentPlayer ? " (you)" : ""}: ${player.score} coins`,
    );
    updatePips(row, player.score);
    row.score = player.score;

    // appending an existing node moves it, which keeps rows in score order
    listEl.append(row.el);
    seen.add(player.id);
  }

  for (const [id, row] of rows) {
    if (!seen.has(id)) {
      row.el.remove();
      rows.delete(id);
    }
  }
}
