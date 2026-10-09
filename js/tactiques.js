
"use strict";

// ============================================
// TACTIX 0.11 — LABORATOIRE TACTIQUE
// Personnalisation des joueurs
// Compatible avec les carnets TACTIX 0.6
// ============================================

// ÉLÉMENTS DE LA PAGE

const pitch = document.getElementById("interactive-pitch");
const playersLayer = document.getElementById("players-layer");
const drawingLayer = document.getElementById("drawing-layer");

const tacticName = document.getElementById("team-name");
const tacticsList = document.getElementById("tactics-list");

const newButton = document.getElementById("new-tactic");
const resetButton = document.getElementById("reset-players");
const saveButton = document.getElementById("save-tactic");
const exportButton = document.getElementById("export-tactic");

const backupButton = document.getElementById("backup-notebook");
const restoreButton = document.getElementById("restore-notebook");
const restoreFileInput = document.getElementById("restore-file");

const toolButtons = document.querySelectorAll(
  ".drawing-tool[data-tool]"
);

const undoButton = document.getElementById("undo-drawing");
const clearButton = document.getElementById("clear-drawings");

const playerSelect = document.getElementById("player-select");
const playerNameInput = document.getElementById("player-name");
const playerNumberInput = document.getElementById("player-number");
const playerColorInput = document.getElementById("player-color");

// STOCKAGE

const STORAGE_KEY = "tactix-tactics";
const OLD_STORAGE_KEY = "tactix-tactic";

const BACKUP_FORMAT = "TACTIX_NOTEBOOK";
const BACKUP_VERSION = 1;

// JOUEURS PAR DÉFAUT

const defaultPlayers = [
  { id: 1, x: 50, y: 90, name: "", number: 1, color: "#efb52d" },
  { id: 2, x: 30, y: 72, name: "", number: 2, color: "#1776e8" },
  { id: 3, x: 70, y: 72, name: "", number: 3, color: "#1776e8" },
  { id: 4, x: 20, y: 50, name: "", number: 4, color: "#1776e8" },
  { id: 5, x: 50, y: 55, name: "", number: 5, color: "#1776e8" },
  { id: 6, x: 80, y: 50, name: "", number: 6, color: "#1776e8" },
  { id: 7, x: 35, y: 28, name: "", number: 7, color: "#1776e8" },
  { id: 8, x: 65, y: 28, name: "", number: 8, color: "#1776e8" }
 ];

// Football à 11 : formation 4-3-3.
const defaultPlayers11 = [
  { id: 1, x: 50, y: 91, name: "", number: 1, color: "#efb52d" },
  { id: 2, x: 15, y: 74, name: "", number: 2, color: "#1776e8" },
  { id: 3, x: 38, y: 77, name: "", number: 3, color: "#1776e8" },
  { id: 4, x: 62, y: 77, name: "", number: 4, color: "#1776e8" },
  { id: 5, x: 85, y: 74, name: "", number: 5, color: "#1776e8" },
  { id: 6, x: 28, y: 53, name: "", number: 6, color: "#1776e8" },
  { id: 7, x: 50, y: 56, name: "", number: 7, color: "#1776e8" },
  { id: 8, x: 72, y: 53, name: "", number: 8, color: "#1776e8" },
  { id: 9, x: 22, y: 28, name: "", number: 9, color: "#1776e8" },
  { id: 10, x: 50, y: 22, name: "", number: 10, color: "#1776e8" },
  { id: 11, x: 78, y: 28, name: "", number: 11, color: "#1776e8" }
];

let currentMode = 8;
const mode8Button = document.getElementById("mode-foot-8");
const mode11Button = document.getElementById("mode-foot-11");
const draftByMode = {};

function getDefaultPlayers() {
  return currentMode === 11 ? defaultPlayers11 : defaultPlayers;
}

function updateModeButtons() {
  [mode8Button, mode11Button].forEach((button, index) => {
    if (!button) return;
    const active = currentMode === (index === 0 ? 8 : 11);
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function refreshPlayerSelect() {
  playerSelect.innerHTML = "";
  for (let id = 1; id <= currentMode; id++) {
    const option = document.createElement("option");
    option.value = String(id);
    option.textContent = "Joueur " + id + (id === 1 ? " — Gardien" : "");
    playerSelect.appendChild(option);
  }
}

// TACTIX 0.9 — Compositions automatiques (gardien + lignes de jeu).
// Les noms, numéros, couleurs et tactiques enregistrées sont conservés.
const formationsByMode = {
  8: {
    "2-3-2": [2, 3, 2],
    "3-3-1": [3, 3, 1],
    "3-2-2": [3, 2, 2]
  },
  11: {
    "4-3-3": [4, 3, 3],
    "4-4-2": [4, 4, 2],
    "3-5-2": [3, 5, 2]
  }
};

const formationSelect = document.createElement("select");
formationSelect.id = "tactix-formation-select";
formationSelect.setAttribute("aria-label", "Choisir une composition tactique");
formationSelect.style.cssText = "padding:9px 12px;border-radius:8px;background:#142923;color:#fff;border:1px solid #7cf0ad;max-width:100%;font:inherit;cursor:pointer";

const formationLabel = document.createElement("label");
formationLabel.htmlFor = formationSelect.id;
formationLabel.textContent = "Composition : ";
formationLabel.style.cssText = "display:inline-flex;align-items:center;gap:9px;flex-wrap:wrap;font-weight:700;margin:8px 0";
formationLabel.appendChild(formationSelect);

const formationButton = document.createElement("button");
formationButton.type = "button";
formationButton.textContent = "Placer les joueurs";
formationButton.className = "drawing-tool";
formationButton.style.margin = "8px";

const formationToolbar = document.createElement("div");
formationToolbar.style.cssText = "display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:12px 0";
formationToolbar.appendChild(formationLabel);
formationToolbar.appendChild(formationButton);

if (mode8Button && mode8Button.parentElement) {
  mode8Button.parentElement.insertAdjacentElement("afterend", formationToolbar);
} else if (pitch && pitch.parentElement) {
  pitch.parentElement.insertBefore(formationToolbar, pitch);
}

function refreshFormations() {
  formationSelect.innerHTML = "";
  Object.keys(formationsByMode[currentMode]).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    formationSelect.appendChild(option);
  });
}

function applyFormation() {
  // La nouvelle mise en place devient la référence de la prochaine animation.
  if (typeof tactixAnimationStart !== "undefined") tactixAnimationStart = null;
  const lines = formationsByMode[currentMode][formationSelect.value];
  if (!lines || players.length !== currentMode) return;

  // Les lignes vont de la défense vers l'attaque ; le gardien reste en bas.
  const yByLine = [74, 53, 29];
  const positions = [{ x: 50, y: 91 }];
  lines.forEach((count, lineIndex) => {
    for (let index = 0; index < count; index++) {
      positions.push({
        x: 100 * (index + 1) / (count + 1),
        y: yByLine[lineIndex]
      });
    }
  });

  players = players.map((player, index) => ({
    ...player,
    x: positions[index].x,
    y: positions[index].y
  }));
  renderPlayers();
  updatePlayerEditor();
  // Le carnet ne change que lorsque l'utilisateur clique sur Enregistrer.
}

formationButton.addEventListener("click", applyFormation);

function changeMode(mode) {
  // La nouvelle mise en place devient la référence de la prochaine animation.
  if (typeof tactixAnimationStart !== "undefined") tactixAnimationStart = null;
  if (mode !== 8 && mode !== 11) return;
  if (mode === currentMode) return;

  draftByMode[currentMode] = {
    id: currentTacticId,
    name: tacticName.value,
    players: copyPlayers(players),
    drawings: copyDrawings(drawings)
  };
  currentMode = mode;
  const draft = draftByMode[mode];
  const firstSaved = tactics.find(tactic => tactic.players.length === mode);
  if (draft) {
    currentTacticId = draft.id;
    tacticName.value = draft.name;
    players = copyPlayers(draft.players);
    drawings = copyDrawings(draft.drawings);
  } else if (firstSaved) {
    currentTacticId = firstSaved.id;
    tacticName.value = firstSaved.name;
    players = copyPlayers(firstSaved.players);
    drawings = copyDrawings(firstSaved.drawings || []);
  } else {
    currentTacticId = null;
    tacticName.value = "Nouvelle tactique — Football à " + mode;
    players = copyPlayers(getDefaultPlayers());
    drawings = [];
  }
  drawingPreview = null;
  drawingPointerId = null;
  selectedPlayerId = 1;
  refreshPlayerSelect();
  refreshFormations();
  updateModeButtons();
  renderPlayers();
  renderDrawings();
  renderTacticsList();
  updatePlayerEditor();
  selectTool("move");
}

// ÉTAT DU LABORATOIRE

let tactics = [];
let currentTacticId = null;

let players = copyPlayers(defaultPlayers);
let drawings = [];

let activeTool = "move";
let drawingPreview = null;
let drawingPointerId = null;

let selectedPlayerId = 1;

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

function defaultColor(id) {
  return id === 1 ? "#efb52d" : "#1776e8";
}

function validColor(value) {
  return (
    typeof value === "string" &&
    /^#[0-9a-fA-F]{6}$/.test(value)
  );
}

function normalizePlayer(player) {
  return {
    id: player.id,
    x: player.x,
    y: player.y,
    name:
      typeof player.name === "string"
        ? player.name.slice(0, 24)
        : "",
    number:
      Number.isInteger(player.number) &&
      player.number >= 1 &&
      player.number <= 99
        ? player.number
        : player.id,
    color: validColor(player.color)
      ? player.color.toLowerCase()
      : defaultColor(player.id)
  };
}

function copyPlayers(source) {
  return source.map(player => normalizePlayer(player));
}

function copyDrawings(source) {
  return source.map(drawing => ({ ...drawing }));
}

function validPlayers(value) {
  if (!Array.isArray(value) || ![8, 11].includes(value.length)) {
    return false;
  }

  const ids = new Set();

  return value.every(player => {
    if (
      player === null ||
      typeof player !== "object" ||
      Array.isArray(player)
    ) {
      return false;
    }

    if (
      !Number.isInteger(player.id) ||
      player.id < 1 ||
      player.id > value.length ||
      ids.has(player.id)
    ) {
      return false;
    }

    ids.add(player.id);

    const positionValid =
      Number.isFinite(player.x) &&
      Number.isFinite(player.y) &&
      player.x >= 0 &&
      player.x <= 100 &&
      player.y >= 0 &&
      player.y <= 100;

    const nameValid =
      player.name === undefined ||
      (
        typeof player.name === "string" &&
        player.name.length <= 24
      );

    const numberValid =
      player.number === undefined ||
      (
        Number.isInteger(player.number) &&
        player.number >= 1 &&
        player.number <= 99
      );

    const colorValid =
      player.color === undefined ||
      validColor(player.color);

    return (
      positionValid &&
      nameValid &&
      numberValid &&
      colorValid
    );
  });
}

function validDrawings(value) {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every(drawing =>
    drawing !== null &&
    typeof drawing === "object" &&
    ["arrow", "pass", "zone", "curve", "curve-left", "curve-right"].includes(drawing.type) &&
    ["x1", "y1", "x2", "y2"].every(key =>
      Number.isFinite(drawing[key]) &&
      drawing[key] >= 0 &&
      drawing[key] <= 100
    )
  );
}

function validTactic(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.name === "string" &&
    value.name.length > 0 &&
    validPlayers(value.players) &&
    (
      value.drawings === undefined ||
      validDrawings(value.drawings)
    )
  );
}

function normalizeTactic(value) {
  return {
    id: value.id,
    name: value.name,
    players: copyPlayers(value.players),
    drawings: copyDrawings(value.drawings || [])
  };
}

function createId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2)
  );
}

function createUniqueId(usedIds) {
  let id;

  do {
    id = createId();
  } while (usedIds.has(id));

  usedIds.add(id);
  return id;
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function getPitchPoint(event) {
  const rect = pitch.getBoundingClientRect();

  return {
    x: clamp(
      ((event.clientX - rect.left) / rect.width) * 100,
      0,
      100
    ),
    y: clamp(
      ((event.clientY - rect.top) / rect.height) * 100,
      0,
      100
    )
  };
}

function getSelectedPlayer() {
  return players.find(
    player => player.id === selectedPlayerId
  );
}

function getTextColor(background) {
  const red = parseInt(background.slice(1, 3), 16);
  const green = parseInt(background.slice(3, 5), 16);
  const blue = parseInt(background.slice(5, 7), 16);

  const brightness =
    (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 155 ? "#17201a" : "#ffffff";
}

function sameTacticContent(first, second) {
  if (first.name !== second.name) {
    return false;
  }

  const firstPlayers = copyPlayers(first.players).sort(
    (a, b) => a.id - b.id
  );

  const secondPlayers = copyPlayers(second.players).sort(
    (a, b) => a.id - b.id
  );

  if (firstPlayers.length !== secondPlayers.length) return false;

  const samePlayers = firstPlayers.every((player, index) => {
    const other = secondPlayers[index];

    return (
      player.id === other.id &&
      player.x === other.x &&
      player.y === other.y &&
      player.name === other.name &&
      player.number === other.number &&
      player.color === other.color
    );
  });

  if (!samePlayers) {
    return false;
  }

  const firstDrawings = first.drawings || [];
  const secondDrawings = second.drawings || [];

  if (firstDrawings.length !== secondDrawings.length) {
    return false;
  }

  return firstDrawings.every((drawing, index) => {
    const other = secondDrawings[index];

    return (
      drawing.type === other.type &&
      drawing.x1 === other.x1 &&
      drawing.y1 === other.y1 &&
      drawing.x2 === other.x2 &&
      drawing.y2 === other.y2
    );
  });
}

// ============================================
// PERSONNALISATION DES JOUEURS
// ============================================

function updatePlayerEditor() {
  const player = getSelectedPlayer();

  if (!player) {
    return;
  }

  playerSelect.value = String(player.id);
  playerNameInput.value = player.name;
  playerNumberInput.value = String(player.number);
  playerColorInput.value = player.color;

  updatePlayerOptions();
}

function updatePlayerOptions() {
  players.forEach(player => {
    const option = playerSelect.querySelector(
      'option[value="' + player.id + '"]'
    );

    if (!option) {
      return;
    }

    const role = player.id === 1 ? " — Gardien" : "";
    const name = player.name ? " — " + player.name : "";

    option.textContent =
      "Joueur " + player.id + role + name;
  });
}

function selectPlayer(id) {
  if (!Number.isInteger(id) || id < 1 || id > currentMode) {
    return;
  }

  selectedPlayerId = id;
  updatePlayerEditor();
  renderPlayers();
}

playerSelect.addEventListener("change", () => {
  selectPlayer(Number(playerSelect.value));
});

playerNameInput.addEventListener("input", () => {
  const player = getSelectedPlayer();

  if (!player) {
    return;
  }

  player.name = playerNameInput.value.slice(0, 24);
  updatePlayerOptions();
  renderPlayers();
});

playerNumberInput.addEventListener("input", () => {
  const player = getSelectedPlayer();

  if (!player) {
    return;
  }

  const number = Number(playerNumberInput.value);

  if (
    Number.isInteger(number) &&
    number >= 1 &&
    number <= 99
  ) {
    player.number = number;
    renderPlayers();
  }
});

playerNumberInput.addEventListener("change", () => {
  const player = getSelectedPlayer();

  if (!player) {
    return;
  }

  const number = Number(playerNumberInput.value);

  player.number =
    Number.isInteger(number)
      ? clamp(number, 1, 99)
      : player.id;

  playerNumberInput.value = String(player.number);
  renderPlayers();
});

playerColorInput.addEventListener("input", () => {
  const player = getSelectedPlayer();

  if (!player || !validColor(playerColorInput.value)) {
    return;
  }

  player.color = playerColorInput.value.toLowerCase();
  renderPlayers();
});

// ============================================
// AFFICHAGE ET DÉPLACEMENT DES JOUEURS
// ============================================

function renderPlayers() {
  playersLayer.innerHTML = "";

  players.forEach(player => {
    const element = document.createElement("div");

    element.className =
      "tactic-player" +
      (player.id === 1 ? " goalkeeper" : "");

    element.style.left = player.x + "%";
    element.style.top = player.y + "%";
    element.style.backgroundColor = player.color;
    element.style.color = getTextColor(player.color);

    element.textContent = String(player.number);

    const playerDescription =
      (player.id === 1 ? "Gardien" : "Joueur") +
      " numéro " +
      player.number +
      (player.name ? ", " + player.name : "");

    element.setAttribute(
      "aria-label",
      playerDescription
    );

    element.title = playerDescription;

    // Afficher le prénom sous le joueur.
    if (player.name) {
      const nameLabel = document.createElement("span");

      nameLabel.className = "tactic-player-name";
      nameLabel.textContent = player.name;

      // Styles autonomes pour que le prénom
      // apparaisse même avec un ancien CSS.
      nameLabel.style.position = "absolute";
      nameLabel.style.top = "calc(100% + 4px)";
      nameLabel.style.left = "50%";
      nameLabel.style.transform = "translateX(-50%)";
      nameLabel.style.background = "rgba(11,20,18,.88)";
      nameLabel.style.color = "#ffffff";
      nameLabel.style.padding = "2px 5px";
      nameLabel.style.borderRadius = "5px";
      nameLabel.style.fontSize = "10px";
      nameLabel.style.fontWeight = "700";
      nameLabel.style.whiteSpace = "nowrap";
      nameLabel.style.pointerEvents = "none";

      element.appendChild(nameLabel);
    }

    element.addEventListener("pointerdown", event => {
      if (activeTool !== "move") {
        return;
      }

      if (
        event.pointerType === "mouse" &&
        event.button !== 0
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      // Cliquer sur un joueur le sélectionne
      // dans le panneau de personnalisation.
      if (selectedPlayerId !== player.id) {
        selectedPlayerId = player.id;
        updatePlayerEditor();
      }

      element.setPointerCapture(event.pointerId);

      function movePlayer(moveEvent) {
        if (moveEvent.pointerId !== event.pointerId) {
          return;
        }

        const point = getPitchPoint(moveEvent);

        player.x = clamp(point.x, 5, 95);
        player.y = clamp(point.y, 4, 96);

        element.style.left = player.x + "%";
        element.style.top = player.y + "%";
      }

      function stopMoving(stopEvent) {
        if (stopEvent.pointerId !== event.pointerId) {
          return;
        }

        element.removeEventListener(
          "pointermove",
          movePlayer
        );

        element.removeEventListener(
          "pointerup",
          stopMoving
        );

        element.removeEventListener(
          "pointercancel",
          stopMoving
        );
      }

      element.addEventListener(
        "pointermove",
        movePlayer
      );

      element.addEventListener(
        "pointerup",
        stopMoving
      );

      element.addEventListener(
        "pointercancel",
        stopMoving
      );
    });

    playersLayer.appendChild(element);
  });
}

// ============================================
// OUTILS DE DESSIN
// ============================================

// TACTIX 0.11 — Deux directions de courbure, sans modifier index.html.
const curvedCrossButtons = [
  { tool: "curve-left", label: "↶ Centre courbé gauche" },
  { tool: "curve-right", label: "↷ Centre courbé droit" }
].map(({ tool, label }) => {
  const existing = document.querySelector(`.drawing-tool[data-tool="${tool}"]`);
  if (existing) return existing;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "drawing-tool";
  button.dataset.tool = tool;
  button.textContent = label;
  button.setAttribute("aria-pressed", "false");
  const lastToolButton = document.querySelector(".drawing-tool[data-tool='zone']") ||
    document.querySelector(".drawing-tool[data-tool='pass']");
  if (lastToolButton) lastToolButton.insertAdjacentElement("afterend", button);
  return button;
});
const allToolButtons = [...new Set([...toolButtons, ...curvedCrossButtons])];

function isCurvedDrawing(drawing) {
  return ["curve", "curve-left", "curve-right"].includes(drawing.type);
}

// Courbe de Bézier quadratique : gauche/droite par rapport au trajet du ballon.
function getCurveControl(drawing) {
  const dx = drawing.x2 - drawing.x1;
  const dy = drawing.y2 - drawing.y1;
  const bend = 0.28;
  const side = drawing.type === "curve-left" ? -1
    : drawing.type === "curve-right" ? 1
    : (drawing.x1 <= 50 ? 1 : -1); // Compatibilité TACTIX 0.10.
  return {
    x: (drawing.x1 + drawing.x2) / 2 - dy * bend * side,
    y: (drawing.y1 + drawing.y2) / 2 + dx * bend * side
  };
}

function selectTool(tool) {
  activeTool = tool;

  allToolButtons.forEach(button => {
    const selected = button.dataset.tool === tool;

    button.classList.toggle("active", selected);
    button.setAttribute(
      "aria-pressed",
      String(selected)
    );
  });

  pitch.classList.toggle(
    "drawing-mode",
    tool !== "move"
  );
}

allToolButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectTool(button.dataset.tool);
  });
});

function createSvgElement(tag, attributes) {
  const element = document.createElementNS(
    "http://www.w3.org/2000/svg",
    tag
  );

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
}

function createLineDrawing(drawing) {
  const isPass = drawing.type === "pass";
  const color = isPass ? "#ffffff" : "#ffdf63";

  const group = createSvgElement("g", {});

  const line = createSvgElement("line", {
    x1: drawing.x1,
    y1: drawing.y1,
    x2: drawing.x2,
    y2: drawing.y2,
    stroke: color,
    "stroke-width": 0.8,
    "stroke-linecap": "round",
    "stroke-dasharray": isPass ? "2 1.4" : "none",
    "vector-effect": "non-scaling-stroke"
  });

  const dx = drawing.x2 - drawing.x1;
  const dy = drawing.y2 - drawing.y1;

  const angle = Math.atan2(dy, dx);
  const arrowLength = 3;
  const arrowWidth = 1.6;

  const baseX =
    drawing.x2 - Math.cos(angle) * arrowLength;

  const baseY =
    drawing.y2 - Math.sin(angle) * arrowLength;

  const leftX =
    baseX + Math.sin(angle) * arrowWidth;

  const leftY =
    baseY - Math.cos(angle) * arrowWidth;

  const rightX =
    baseX - Math.sin(angle) * arrowWidth;

  const rightY =
    baseY + Math.cos(angle) * arrowWidth;

  const arrowHead = createSvgElement("polygon", {
    points:
      `${drawing.x2},${drawing.y2} ` +
      `${leftX},${leftY} ` +
      `${rightX},${rightY}`,
    fill: color
  });

  group.appendChild(line);
  group.appendChild(arrowHead);

  return group;
}

function createCurvedDrawing(drawing) {
  const control = getCurveControl(drawing);
  const color = "#ffdf63";
  const group = createSvgElement("g", {});
  const path = createSvgElement("path", {
    d: `M ${drawing.x1} ${drawing.y1} Q ${control.x} ${control.y} ${drawing.x2} ${drawing.y2}`,
    fill: "none",
    stroke: color,
    "stroke-width": 0.8,
    "stroke-linecap": "round",
    "vector-effect": "non-scaling-stroke"
  });
  // Tangente au point d'arrivée, pour orienter la pointe correctement.
  const angle = Math.atan2(drawing.y2 - control.y, drawing.x2 - control.x);
  const length = 3;
  const width = 1.6;
  const bx = drawing.x2 - Math.cos(angle) * length;
  const by = drawing.y2 - Math.sin(angle) * length;
  const arrowHead = createSvgElement("polygon", {
    points: `${drawing.x2},${drawing.y2} ${bx + Math.sin(angle) * width},${by - Math.cos(angle) * width} ${bx - Math.sin(angle) * width},${by + Math.cos(angle) * width}`,
    fill: color
  });
  group.appendChild(path);
  group.appendChild(arrowHead);
  return group;
}

function createZoneDrawing(drawing) {
  const x = Math.min(drawing.x1, drawing.x2);
  const y = Math.min(drawing.y1, drawing.y2);

  const width = Math.abs(drawing.x2 - drawing.x1);
  const height = Math.abs(drawing.y2 - drawing.y1);

  return createSvgElement("rect", {
    x,
    y,
    width,
    height,
    fill: "#7cf0ad",
    "fill-opacity": 0.18,
    stroke: "#7cf0ad",
    "stroke-width": 0.7,
    "stroke-dasharray": "2 1",
    "vector-effect": "non-scaling-stroke"
  });
}

function renderDrawings() {
  drawingLayer.innerHTML = "";

  drawings.forEach(drawing => {
    const element =
      drawing.type === "zone"
        ? createZoneDrawing(drawing)
        : isCurvedDrawing(drawing)
          ? createCurvedDrawing(drawing)
          : createLineDrawing(drawing);

    drawingLayer.appendChild(element);
  });

  if (drawingPreview) {
    const previewElement =
      drawingPreview.type === "zone"
        ? createZoneDrawing(drawingPreview)
        : isCurvedDrawing(drawingPreview)
          ? createCurvedDrawing(drawingPreview)
          : createLineDrawing(drawingPreview);

    previewElement.setAttribute("opacity", "0.6");
    drawingLayer.appendChild(previewElement);
  }
}

// COMMENCER UN DESSIN

pitch.addEventListener("pointerdown", event => {
  if (activeTool === "move") {
    return;
  }

  if (drawingPointerId !== null) {
    return;
  }

  if (
    event.pointerType === "mouse" &&
    event.button !== 0
  ) {
    return;
  }

  event.preventDefault();

  drawingPointerId = event.pointerId;

  const start = getPitchPoint(event);

  drawingPreview = {
    type: activeTool,
    x1: start.x,
    y1: start.y,
    x2: start.x,
    y2: start.y
  };

  pitch.setPointerCapture(event.pointerId);
  renderDrawings();
});

// APERÇU DU DESSIN

pitch.addEventListener("pointermove", event => {
  if (event.pointerId !== drawingPointerId) {
    return;
  }

  if (!drawingPreview) {
    return;
  }

  const point = getPitchPoint(event);

  drawingPreview.x2 = point.x;
  drawingPreview.y2 = point.y;

  renderDrawings();
});

// TERMINER UN DESSIN

pitch.addEventListener("pointerup", event => {
  if (event.pointerId !== drawingPointerId) {
    return;
  }

  if (!drawingPreview) {
    return;
  }

  const point = getPitchPoint(event);

  drawingPreview.x2 = point.x;
  drawingPreview.y2 = point.y;

  const distance = Math.hypot(
    drawingPreview.x2 - drawingPreview.x1,
    drawingPreview.y2 - drawingPreview.y1
  );

  if (distance > 2) {
    drawings.push({ ...drawingPreview });
  }

  drawingPreview = null;
  drawingPointerId = null;

  renderDrawings();
});

// ANNULER UN DESSIN INTERROMPU

pitch.addEventListener("pointercancel", event => {
  if (event.pointerId !== drawingPointerId) {
    return;
  }

  drawingPreview = null;
  drawingPointerId = null;

  renderDrawings();
});

// ANNULER LE DERNIER DESSIN

undoButton.addEventListener("click", () => {
  drawings.pop();
  renderDrawings();
});

// EFFACER LES DESSINS

clearButton.addEventListener("click", () => {
  if (drawings.length === 0) {
    return;
  }

  const confirmed = confirm(
    "Effacer tous les dessins de cette tactique ?"
  );

  if (!confirmed) {
    return;
  }

  drawings = [];
  renderDrawings();
});

// ============================================
// CARNET TACTIQUE
// ============================================

function saveNotebook() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(tactics)
    );

    return true;
  } catch (error) {
    console.error(
      "Erreur de sauvegarde :",
      error
    );

    alert("Impossible d'enregistrer le carnet.");
    return false;
  }
}

function renderTacticsList() {
  tacticsList.innerHTML = "";

  const visibleTactics = tactics.filter(tactic => tactic.players.length === currentMode);

  if (visibleTactics.length === 0) {
    const message = document.createElement("p");

    message.textContent =
      "Aucune tactique enregistrée pour le moment.";

    tacticsList.appendChild(message);
    return;
  }

  visibleTactics.forEach(tactic => {
    const item = document.createElement("div");

    item.className = "tactic-list-item";

    if (tactic.id === currentTacticId) {
      item.classList.add("selected");
    }

    const openButton =
      document.createElement("button");

    openButton.type = "button";
    openButton.className = "tactic-open-button";
    openButton.textContent = tactic.name;

    openButton.addEventListener("click", () => {
      openTactic(tactic.id);
    });

    const deleteButton =
      document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "tactic-delete-button";

    deleteButton.textContent = "✕";
    deleteButton.title = "Supprimer cette tactique";

    deleteButton.setAttribute(
      "aria-label",
      "Supprimer " + tactic.name
    );

    deleteButton.addEventListener("click", () => {
      deleteTactic(tactic.id);
    });

    item.appendChild(openButton);
    item.appendChild(deleteButton);

    tacticsList.appendChild(item);
  });
}

function openTactic(id) {
  // La nouvelle mise en place devient la référence de la prochaine animation.
  if (typeof tactixAnimationStart !== "undefined") tactixAnimationStart = null;
  const tactic = tactics.find(
    item => item.id === id
  );

  if (!tactic || tactic.players.length !== currentMode) {
    return;
  }

  currentTacticId = tactic.id;

  tacticName.value = tactic.name;
  players = copyPlayers(tactic.players);
  drawings = copyDrawings(tactic.drawings || []);

  drawingPreview = null;
  drawingPointerId = null;

  selectedPlayerId = 1;

  renderPlayers();
  renderDrawings();
  renderTacticsList();
  updatePlayerEditor();

  selectTool("move");
}

function newTactic() {
  // La nouvelle mise en place devient la référence de la prochaine animation.
  if (typeof tactixAnimationStart !== "undefined") tactixAnimationStart = null;
  currentTacticId = null;

  tacticName.value = "Nouvelle tactique — Football à " + currentMode;
  players = copyPlayers(getDefaultPlayers());
  drawings = [];

  drawingPreview = null;
  drawingPointerId = null;

  selectedPlayerId = 1;

  renderPlayers();
  renderDrawings();
  renderTacticsList();
  updatePlayerEditor();

  selectTool("move");

  tacticName.focus();
  tacticName.select();
}

function saveCurrentTactic() {
  const name =
    tacticName.value.trim() ||
    "Tactique sans nom";

  const existing = tactics.find(
    item => item.id === currentTacticId
  );

  const previousTactics =
    tactics.map(normalizeTactic);

  const previousId = currentTacticId;

  if (existing) {
    existing.name = name;
    existing.players = copyPlayers(players);
    existing.drawings = copyDrawings(drawings);
  } else {
    const usedIds = new Set(
      tactics.map(item => item.id)
    );

    const newEntry = {
      id: createUniqueId(usedIds),
      name,
      players: copyPlayers(players),
      drawings: copyDrawings(drawings)
    };

    tactics.push(newEntry);
    currentTacticId = newEntry.id;
  }

  if (saveNotebook()) {
    renderTacticsList();

    alert(
      "Tactique, dessins et joueurs enregistrés !"
    );
  } else {
    tactics = previousTactics;
    currentTacticId = previousId;
  }
}

function deleteTactic(id) {
  const tactic = tactics.find(
    item => item.id === id
  );

  if (!tactic) {
    return;
  }

  const confirmed = confirm(
    'Supprimer définitivement la tactique "' +
    tactic.name +
    '" ?'
  );

  if (!confirmed) {
    return;
  }

  const previousTactics = tactics;

  tactics = tactics.filter(
    item => item.id !== id
  );

  if (!saveNotebook()) {
    tactics = previousTactics;
    return;
  }

  if (currentTacticId === id) {
    currentTacticId = null;

    tacticName.value = "Nouvelle tactique — Football à " + currentMode;

    players = copyPlayers(getDefaultPlayers());
    drawings = [];

    selectedPlayerId = 1;

    renderPlayers();
    renderDrawings();
    updatePlayerEditor();
  }

  renderTacticsList();
}

function resetPlayers() {
  // La nouvelle mise en place devient la référence de la prochaine animation.
  if (typeof tactixAnimationStart !== "undefined") tactixAnimationStart = null;
  const confirmed = confirm(
    "Remettre les joueurs à leurs positions de départ ?\n\n" +
    "Les prénoms, numéros et couleurs seront conservés."
  );

  if (!confirmed) {
    return;
  }

  players = players.map(player => {
    const original = getDefaultPlayers().find(
      item => item.id === player.id
    );

    return {
      ...player,
      x: original.x,
      y: original.y
    };
  });

  renderPlayers();
  updatePlayerEditor();
}

// ============================================
// EXPORTATION EN IMAGE PNG
// ============================================

function exportTacticAsPng() {
  const canvas = document.createElement("canvas");

  const width = 1000;
  const height = 1500;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    alert("Impossible de créer l'image.");
    return;
  }

  const fieldX = 80;
  const fieldY = 190;
  const fieldW = 840;
  const fieldH = 1167;

  // FOND GÉNÉRAL

  ctx.fillStyle = "#0b1412";
  ctx.fillRect(0, 0, width, height);

  // TITRE

  const name =
    tacticName.value.trim() ||
    "Ma tactique";

  ctx.fillStyle = "#7cf0ad";
  ctx.font = "bold 30px Arial";
  ctx.fillText("TACTIX", fieldX, 75);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 38px Arial";

  const displayName =
    name.length > 35
      ? name.slice(0, 32) + "..."
      : name;

  ctx.fillText(displayName, fieldX, 130);

  // PELOUSE

  const stripeHeight = fieldH / 8;

  for (let i = 0; i < 8; i++) {
    ctx.fillStyle =
      i % 2 === 0 ? "#245d3c" : "#2c7048";

    ctx.fillRect(
      fieldX,
      fieldY + i * stripeHeight,
      fieldW,
      stripeHeight
    );
  }

  // LIGNES DU TERRAIN

  ctx.strokeStyle = "#c1e4c8";
  ctx.lineWidth = 5;

  ctx.strokeRect(
    fieldX,
    fieldY,
    fieldW,
    fieldH
  );

  ctx.beginPath();

  ctx.moveTo(
    fieldX,
    fieldY + fieldH / 2
  );

  ctx.lineTo(
    fieldX + fieldW,
    fieldY + fieldH / 2
  );

  ctx.stroke();

  // CERCLE CENTRAL

  ctx.beginPath();

  ctx.ellipse(
    fieldX + fieldW / 2,
    fieldY + fieldH / 2,
    fieldW * 0.13,
    fieldH * 0.13 * (fieldW / fieldH),
    0,
    0,
    Math.PI * 2
  );

  ctx.stroke();

  // SURFACES

  const boxX = fieldX + fieldW * 0.2;
  const boxW = fieldW * 0.6;
  const boxH = fieldH * 0.16;

  ctx.strokeRect(
    boxX,
    fieldY,
    boxW,
    boxH
  );

  ctx.strokeRect(
    boxX,
    fieldY + fieldH - boxH,
    boxW,
    boxH
  );

  function px(x) {
    return fieldX + (x / 100) * fieldW;
  }

  function py(y) {
    return fieldY + (y / 100) * fieldH;
  }

  // LIMITER LES DESSINS AU TERRAIN

  ctx.save();

  ctx.beginPath();
  ctx.rect(fieldX, fieldY, fieldW, fieldH);
  ctx.clip();

  // DESSINS

  drawings.forEach(drawing => {
    const x1 = px(drawing.x1);
    const y1 = py(drawing.y1);
    const x2 = px(drawing.x2);
    const y2 = py(drawing.y2);

    if (drawing.type === "zone") {
      const left = Math.min(x1, x2);
      const top = Math.min(y1, y2);
      const zoneWidth = Math.abs(x2 - x1);
      const zoneHeight = Math.abs(y2 - y1);

      ctx.fillStyle =
        "rgba(124, 240, 173, 0.18)";

      ctx.strokeStyle = "#7cf0ad";
      ctx.lineWidth = 4;

      ctx.setLineDash([14, 9]);

      ctx.fillRect(
        left,
        top,
        zoneWidth,
        zoneHeight
      );

      ctx.strokeRect(
        left,
        top,
        zoneWidth,
        zoneHeight
      );

      ctx.setLineDash([]);
      return;
    }

    if (isCurvedDrawing(drawing)) {
      const control = getCurveControl(drawing);
      const cx = px(control.x);
      const cy = py(control.y);
      ctx.strokeStyle = "#ffdf63";
      ctx.fillStyle = "#ffdf63";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cx, cy, x2, y2);
      ctx.stroke();
      const angle = Math.atan2(y2 - cy, x2 - cx);
      const bx = x2 - Math.cos(angle) * 26;
      const by = y2 - Math.sin(angle) * 26;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(bx + Math.sin(angle) * 13, by - Math.cos(angle) * 13);
      ctx.lineTo(bx - Math.sin(angle) * 13, by + Math.cos(angle) * 13);
      ctx.closePath();
      ctx.fill();
      return;
    }

    const isPass = drawing.type === "pass";

    const color =
      isPass ? "#ffffff" : "#ffdf63";

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 7;
    ctx.lineCap = "round";

    ctx.setLineDash(
      isPass ? [18, 12] : []
    );

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.setLineDash([]);

    const angle = Math.atan2(
      y2 - y1,
      x2 - x1
    );

    const arrowLength = 26;
    const arrowWidth = 13;

    const baseX =
      x2 - Math.cos(angle) * arrowLength;

    const baseY =
      y2 - Math.sin(angle) * arrowLength;

    const leftX =
      baseX + Math.sin(angle) * arrowWidth;

    const leftY =
      baseY - Math.cos(angle) * arrowWidth;

    const rightX =
      baseX - Math.sin(angle) * arrowWidth;

    const rightY =
      baseY + Math.cos(angle) * arrowWidth;

    ctx.beginPath();

    ctx.moveTo(x2, y2);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();
    ctx.fill();
  });

  // JOUEURS PERSONNALISÉS

  players.forEach(player => {
    const x = px(player.x);
    const y = py(player.y);

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      24,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = player.color;
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = getTextColor(player.color);

    ctx.font = "bold 22px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
      String(player.number),
      x,
      y + 1
    );

    // Prénom sous le joueur.
    if (player.name) {
      ctx.font = "bold 19px Arial";

      const labelWidth = Math.min(
        180,
        ctx.measureText(player.name).width + 20
      );

      const labelX = clamp(
        x - labelWidth / 2,
        fieldX + 3,
        fieldX + fieldW - labelWidth - 3
      );

      const labelY = clamp(
        y + 32,
        fieldY + 4,
        fieldY + fieldH - 28
      );

      ctx.fillStyle = "rgba(11,20,18,0.9)";

      ctx.fillRect(
        labelX,
        labelY,
        labelWidth,
        27
      );

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(
        player.name,
        labelX + labelWidth / 2,
        labelY + 14,
        labelWidth - 10
      );
    }
  });

  ctx.restore();

  // SIGNATURE

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#95aa9e";
  ctx.font = "20px Arial";

  ctx.fillText(
    "Créé avec TACTIX — Football Studio",
    fieldX,
    1425
  );

  // NOM DU FICHIER

  const safeName = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "tactique";

  const fileName =
    "TACTIX-" + safeName + ".png";

  // TÉLÉCHARGEMENT

  canvas.toBlob(blob => {
    if (!blob) {
      alert(
        "Impossible de générer le fichier PNG."
      );
      return;
    }

    downloadBlob(blob, fileName);
  }, "image/png");
}

// ============================================
// TÉLÉCHARGEMENT DE FICHIERS
// ============================================

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 10000);
}

// ============================================
// SAUVEGARDE COMPLÈTE DU CARNET
// ============================================

function backupNotebook() {
  if (tactics.length === 0) {
    alert(
      "Ton carnet ne contient aucune tactique enregistrée."
    );
    return;
  }

  const backup = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    tactics: tactics.map(normalizeTactic)
  };

  const json = JSON.stringify(backup, null, 2);

  const blob = new Blob(
    [json],
    {
      type: "application/json;charset=utf-8"
    }
  );

  const date = new Date()
    .toISOString()
    .slice(0, 10);

  const fileName =
    "TACTIX-sauvegarde-" + date + ".json";

  downloadBlob(blob, fileName);
}

// ============================================
// RESTAURATION DU CARNET
// ============================================

function restoreNotebookFromFile(file) {
  if (!file) {
    return;
  }

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  if (file.size > MAX_FILE_SIZE) {
    alert(
      "Ce fichier est trop volumineux pour une sauvegarde TACTIX."
    );
    return;
  }

  const reader = new FileReader();

  reader.onerror = () => {
    alert(
      "Impossible de lire le fichier sélectionné."
    );
  };

  reader.onload = () => {
    let backup;

    try {
      backup = JSON.parse(reader.result);
    } catch (error) {
      alert(
        "Le fichier sélectionné n'est pas un JSON valide."
      );
      return;
    }

    // VÉRIFICATION DU FORMAT

    if (
      !backup ||
      typeof backup !== "object" ||
      Array.isArray(backup) ||
      backup.format !== BACKUP_FORMAT ||
      backup.version !== BACKUP_VERSION ||
      !Array.isArray(backup.tactics)
    ) {
      alert(
        "Ce fichier n'est pas une sauvegarde TACTIX compatible."
      );
      return;
    }

    // VÉRIFICATION DE TOUTES LES TACTIQUES

    if (!backup.tactics.every(validTactic)) {
      alert(
        "La sauvegarde contient des tactiques invalides.\n" +
        "Aucune donnée n'a été importée."
      );
      return;
    }

    if (backup.tactics.length === 0) {
      alert(
        "Cette sauvegarde ne contient aucune tactique."
      );
      return;
    }

    // PRÉPARATION DES DONNÉES

    const importedTactics =
      backup.tactics.map(normalizeTactic);

    const usedIds = new Set(
      tactics.map(tactic => tactic.id)
    );

    const additions = [];
    let skippedDuplicates = 0;

    importedTactics.forEach(imported => {
      const existing = tactics.find(
        tactic => tactic.id === imported.id
      );

      const alreadyPrepared = additions.find(
        tactic => tactic.id === imported.id
      );

      const sameIdTactic =
        existing || alreadyPrepared;

      if (
        sameIdTactic &&
        sameTacticContent(sameIdTactic, imported)
      ) {
        skippedDuplicates++;
        return;
      }

      if (usedIds.has(imported.id)) {
        imported.id = createUniqueId(usedIds);
      } else {
        usedIds.add(imported.id);
      }

      additions.push(imported);
    });

    if (additions.length === 0) {
      alert(
        "Toutes les tactiques de cette sauvegarde " +
        "sont déjà présentes dans ton carnet.\n\n" +
        "Aucun doublon n'a été ajouté."
      );
      return;
    }

    // CONFIRMATION AVANT MODIFICATION

    const message =
      "Sauvegarde TACTIX vérifiée.\n\n" +
      "Tactiques à ajouter : " +
      additions.length +
      "\n" +
      "Doublons ignorés : " +
      skippedDuplicates +
      "\n\n" +
      "Tes tactiques actuelles seront conservées.\n\n" +
      "Confirmer la restauration ?";

    if (!confirm(message)) {
      return;
    }

    // ENREGISTREMENT AVEC RETOUR ARRIÈRE

    const previousTactics = tactics;

    tactics = [
      ...tactics,
      ...additions
    ];

    if (!saveNotebook()) {
      tactics = previousTactics;
      return;
    }

    renderTacticsList();

    alert(
      "Restauration terminée !\n\n" +
      additions.length +
      " tactique(s) ajoutée(s).\n" +
      skippedDuplicates +
      " doublon(s) ignoré(s).\n\n" +
      "Tes anciennes tactiques ont été conservées."
    );
  };

  reader.readAsText(file, "UTF-8");
}

// ============================================
// CHARGEMENT DES SAUVEGARDES LOCALES
// ============================================

function loadNotebook() {
  try {
    const savedData =
      localStorage.getItem(STORAGE_KEY);

    if (savedData !== null) {
      const saved = JSON.parse(savedData);

      if (Array.isArray(saved)) {
        tactics = saved
          .filter(validTactic)
          .map(normalizeTactic);
      }

      return;
    }

    // RÉCUPÉRER L'ANCIENNE TACTIQUE

    const oldData =
      localStorage.getItem(OLD_STORAGE_KEY);

    if (!oldData) {
      return;
    }

    const oldTactic = JSON.parse(oldData);

    if (
      oldTactic &&
      validPlayers(oldTactic.players)
    ) {
      tactics.push({
        id: createId(),
        name:
          typeof oldTactic.name === "string"
            ? oldTactic.name
            : "Ma première tactique U11",
        players: copyPlayers(oldTactic.players),
        drawings: []
      });

      saveNotebook();
    }
  } catch (error) {
    console.warn(
      "Impossible de charger le carnet tactique :",
      error
    );
  }
}

// ============================================
// BOUTONS
// ============================================

newButton.addEventListener(
  "click",
  newTactic
);

resetButton.addEventListener(
  "click",
  resetPlayers
);

saveButton.addEventListener(
  "click",
  saveCurrentTactic
);

exportButton.addEventListener(
  "click",
  exportTacticAsPng
);

backupButton.addEventListener(
  "click",
  backupNotebook
);

restoreButton.addEventListener("click", () => {
  restoreFileInput.value = "";
  restoreFileInput.click();
});

restoreFileInput.addEventListener("change", event => {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  restoreNotebookFromFile(file);
});

// ============================================
// DÉMARRAGE DE TACTIX
// ============================================

loadNotebook();
refreshPlayerSelect();
refreshFormations();
updateModeButtons();
if (mode8Button) mode8Button.addEventListener("click", () => changeMode(8));
if (mode11Button) mode11Button.addEventListener("click", () => changeMode(11));

if (tactics.some(tactic => tactic.players.length === 8)) {
  openTactic(tactics.find(tactic => tactic.players.length === 8).id);
} else {
  renderPlayers();
  renderDrawings();
  renderTacticsList();
  updatePlayerEditor();
  selectTool("move");
}


// TACTIX — Ballon déplaçable et animation des passes.
// Le ballon est indépendant des joueurs et reste sur le terrain.
let tactixBall = { x: 50, y: 48 };
const tactixBallElement = document.createElement("div");
tactixBallElement.id = "tactix-ball";
tactixBallElement.textContent = "⚽";
tactixBallElement.title = "Déplacer le ballon";
tactixBallElement.setAttribute("aria-label", "Ballon déplaçable");
tactixBallElement.style.cssText = "display:none;position:absolute;z-index:5;left:50%;top:48%;transform:translate(-50%,-50%);font-size:28px;line-height:1;cursor:grab;touch-action:none;user-select:none;filter:drop-shadow(0 2px 2px #000a);";
pitch.appendChild(tactixBallElement);
function renderTactixBall() {
  tactixBallElement.style.left = tactixBall.x + "%";
  tactixBallElement.style.top = tactixBall.y + "%";
}
tactixBallElement.addEventListener("pointerdown", event => {
  if (activeTool !== "move" || (event.pointerType === "mouse" && event.button !== 0)) return;
  event.preventDefault();
  event.stopPropagation();
  tactixBallElement.setPointerCapture(event.pointerId);
  tactixBallElement.style.cursor = "grabbing";
  const moveBall = e => {
    if (e.pointerId !== event.pointerId) return;
    const point = getPitchPoint(e);
    tactixBall.x = clamp(point.x, 3, 97);
    tactixBall.y = clamp(point.y, 3, 97);
    renderTactixBall();
  };
  const stopBall = e => {
    if (e.pointerId !== event.pointerId) return;
    tactixBallElement.removeEventListener("pointermove", moveBall);
    tactixBallElement.removeEventListener("pointerup", stopBall);
    tactixBallElement.removeEventListener("pointercancel", stopBall);
    tactixBallElement.style.cursor = "grab";
  };
  tactixBallElement.addEventListener("pointermove", moveBall);
  tactixBallElement.addEventListener("pointerup", stopBall);
  tactixBallElement.addEventListener("pointercancel", stopBall);
});

// Afficher ou masquer le ballon à la demande (absent au démarrage).
const toggleBallButton = document.createElement("button");
toggleBallButton.type = "button";
toggleBallButton.className = "drawing-tool";
toggleBallButton.textContent = "⚽ Afficher le ballon";
toggleBallButton.title = "Ajouter ou masquer le ballon sur le terrain";
toggleBallButton.setAttribute("aria-pressed", "false");
const passToolButton = document.querySelector('.drawing-tool[data-tool="pass"]');
if (passToolButton && passToolButton.parentElement) {
  passToolButton.insertAdjacentElement("afterend", toggleBallButton);
} else if (pitch.parentElement) {
  pitch.parentElement.insertBefore(toggleBallButton, pitch);
}
let tactixBallVisible = false;
toggleBallButton.addEventListener("click", () => {
  tactixBallVisible = !tactixBallVisible;
  tactixBallElement.style.display = tactixBallVisible ? "block" : "none";
  toggleBallButton.textContent = tactixBallVisible ? "⚽ Masquer le ballon" : "⚽ Afficher le ballon";
  toggleBallButton.setAttribute("aria-pressed", String(tactixBallVisible));
});

// TACTIX — Équipe adverse (rouge), mobile et animable.
let tactixOpponentsVisible = false;
let tactixOpponents = [];
const tactixOpponentsLayer = document.createElement("div");
tactixOpponentsLayer.id = "tactix-opponents-layer";
tactixOpponentsLayer.style.cssText = "position:absolute;inset:0;pointer-events:none;z-index:4;";
pitch.appendChild(tactixOpponentsLayer);

function tactixMakeOpponents() {
  const source = currentMode === 11 ? defaultPlayers11 : defaultPlayers;
  return source.map(player => ({
    id: player.id,
    x: player.x,
    y: clamp(100 - player.y, 4, 96),
    name: "",
    number: player.number,
    color: "#e34848"
  }));
}

function tactixRenderOpponents() {
  tactixOpponentsLayer.innerHTML = "";
  if (!tactixOpponentsVisible) return;
  tactixOpponents.forEach(opponent => {
    const element = document.createElement("div");
    element.className = "tactic-player";
    element.textContent = String(opponent.number);
    element.title = "Adversaire n°" + opponent.number;
    element.setAttribute("aria-label", element.title);
    element.style.cssText = "position:absolute;pointer-events:auto;touch-action:none;cursor:grab;";
    element.style.left = opponent.x + "%";
    element.style.top = opponent.y + "%";
    element.style.backgroundColor = opponent.color;
    element.style.color = "#fff";
    element.style.border = "2px solid #fff";
    element.addEventListener("pointerdown", event => {
      if (activeTool !== "move" || (event.pointerType === "mouse" && event.button !== 0)) return;
      event.preventDefault();
      event.stopPropagation();
      element.setPointerCapture(event.pointerId);
      element.style.cursor = "grabbing";
      const move = e => {
        if (e.pointerId !== event.pointerId) return;
        const point = getPitchPoint(e);
        opponent.x = clamp(point.x, 5, 95);
        opponent.y = clamp(point.y, 4, 96);
        element.style.left = opponent.x + "%";
        element.style.top = opponent.y + "%";
      };
      const stop = e => {
        if (e.pointerId !== event.pointerId) return;
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerup", stop);
        element.removeEventListener("pointercancel", stop);
        element.style.cursor = "grab";
      };
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerup", stop);
      element.addEventListener("pointercancel", stop);
    });
    tactixOpponentsLayer.appendChild(element);
  });
}

const tactixOpponentsButton = document.createElement("button");
tactixOpponentsButton.type = "button";
tactixOpponentsButton.className = "drawing-tool";
tactixOpponentsButton.textContent = "+ Ajouter l'équipe adverse";
tactixOpponentsButton.setAttribute("aria-pressed", "false");
formationToolbar.appendChild(tactixOpponentsButton);
tactixOpponentsButton.addEventListener("click", () => {
  tactixOpponentsVisible = !tactixOpponentsVisible;
  if (tactixOpponentsVisible && tactixOpponents.length !== currentMode) {
    tactixOpponents = tactixMakeOpponents();
  }
  tactixOpponentsButton.textContent = tactixOpponentsVisible
    ? "Masquer l'équipe adverse" : "+ Ajouter l'équipe adverse";
  tactixOpponentsButton.setAttribute("aria-pressed", String(tactixOpponentsVisible));
  tactixRenderOpponents();
});

// Les changements de mode adaptent également le nombre d'adversaires.
[mode8Button, mode11Button].forEach(button => {
  if (!button) return;
  button.addEventListener("click", () => {
    tactixOpponents = tactixMakeOpponents();
    tactixRenderOpponents();
    tactixAnimationStart = null;
  });
});

// ============================================
// TACTIX — ANIMATION DES FLÈCHES DE DÉPLACEMENT
// ============================================
// Les flèches « Déplacement » sont liées au joueur situé à leur départ.
// Un bouton permet de rejouer les courses sans supprimer les dessins.
const animateMovesButton = document.createElement("button");
animateMovesButton.type = "button";
animateMovesButton.className = "drawing-tool";
animateMovesButton.textContent = "▶ Animer les déplacements";
animateMovesButton.title = "Faire courir les joueurs le long de leurs flèches de déplacement";

const movementToolbar = document.querySelector('.drawing-toolbar:has(.drawing-tool[data-tool="arrow"])');
const movementArrowButton = document.querySelector('.drawing-tool[data-tool="arrow"]');
if (movementToolbar) {
  movementToolbar.appendChild(animateMovesButton);
} else if (movementArrowButton && movementArrowButton.parentElement) {
  movementArrowButton.insertAdjacentElement("afterend", animateMovesButton);
}

// Les positions mémorisées correspondent au début de la dernière animation.
let tactixAnimationStart = null;
const resetAnimationButton = document.createElement("button");
resetAnimationButton.type = "button";
resetAnimationButton.className = "drawing-tool";
resetAnimationButton.textContent = "↩ Replacer les joueurs";
resetAnimationButton.title = "Revenir aux positions d'avant la dernière animation";
resetAnimationButton.disabled = false;
animateMovesButton.insertAdjacentElement("afterend", resetAnimationButton);

let tactixMovementAnimation = null;
animateMovesButton.addEventListener("click", () => {
  if (tactixMovementAnimation !== null) {
    cancelAnimationFrame(tactixMovementAnimation);
    tactixMovementAnimation = null;
  }

  // Animer les courses, les passes et les centres courbés.
  const movementArrows = drawings.filter(d => d.type === "arrow");
  const animationPlayers = [
    ...players.map(player => ({ player, team: "home" })),
    ...(tactixOpponentsVisible ? tactixOpponents.map(player => ({ player, team: "away" })) : [])
  ];
  const availablePlayers = new Set(animationPlayers.map(entry => entry.team + entry.player.id));
  const runs = [];
  for (const arrow of movementArrows) {
    let nearest = null;
    let shortestDistance = Infinity;
    for (const entry of animationPlayers) {
      const player = entry.player;
      if (!availablePlayers.has(entry.team + player.id)) continue;
      const distance = Math.hypot(player.x - arrow.x1, player.y - arrow.y1);
      if (distance < shortestDistance) {
        nearest = entry;
        shortestDistance = distance;
      }
    }
    // La flèche doit commencer à proximité du joueur concerné.
    if (!nearest || shortestDistance > 12) continue;
    availablePlayers.delete(nearest.team + nearest.player.id);
    runs.push({
      player: nearest.player,
      x1: nearest.player.x,
      y1: nearest.player.y,
      x2: clamp(arrow.x2, 5, 95),
      y2: clamp(arrow.y2, 4, 96)
    });
  }

  // Une passe ou un centre part du ballon placé près de la flèche.
  // Les centres suivent exactement la courbe de Bézier du dessin.
  const ballArrow = tactixBallVisible && drawings.find(d =>
    (d.type === "pass" || isCurvedDrawing(d)) &&
    Math.hypot(tactixBall.x - d.x1, tactixBall.y - d.y1) <= 12
  );
  const ballPass = ballArrow ? {
    x1: tactixBall.x,
    y1: tactixBall.y,
    x2: clamp(ballArrow.x2, 3, 97),
    y2: clamp(ballArrow.y2, 3, 97),
    control: isCurvedDrawing(ballArrow) ? getCurveControl(ballArrow) : null
  } : null;

  if (!runs.length && !ballPass) {
    animateMovesButton.textContent = "Trace une flèche depuis un joueur ou le ballon";
    setTimeout(() => {
      animateMovesButton.textContent = "▶ Animer les déplacements";
    }, 2200);
    return;
  }

  // Garder la première position de départ tant que l'utilisateur n'a pas
  // demandé le replacement : même après plusieurs clics sur « Animer ».
  if (!tactixAnimationStart) {
    tactixAnimationStart = {
      players: players.map(player => ({ id: player.id, x: player.x, y: player.y })),
      opponents: tactixOpponents.map(player => ({ id: player.id, x: player.x, y: player.y })),
      ball: { x: tactixBall.x, y: tactixBall.y }
    };
  }
  resetAnimationButton.disabled = false;
  animateMovesButton.disabled = true;
  animateMovesButton.textContent = "⏵ Animation en cours…";
  const duration = 1800;
  let startTime = null;
  const animateFrame = timestamp => {
    if (startTime === null) startTime = timestamp;
    const progress = Math.min(1, (timestamp - startTime) / duration);
    const eased = progress * progress * (3 - 2 * progress);
    for (const run of runs) {
      run.player.x = run.x1 + (run.x2 - run.x1) * eased;
      run.player.y = run.y1 + (run.y2 - run.y1) * eased;
    }
    renderPlayers();
    tactixRenderOpponents();
    if (ballPass) {
      if (ballPass.control) {
        const inverse = 1 - eased;
        tactixBall.x = inverse * inverse * ballPass.x1 +
          2 * inverse * eased * ballPass.control.x + eased * eased * ballPass.x2;
        tactixBall.y = inverse * inverse * ballPass.y1 +
          2 * inverse * eased * ballPass.control.y + eased * eased * ballPass.y2;
      } else {
        tactixBall.x = ballPass.x1 + (ballPass.x2 - ballPass.x1) * eased;
        tactixBall.y = ballPass.y1 + (ballPass.y2 - ballPass.y1) * eased;
      }
      renderTactixBall();
    }
    if (progress < 1) {
      tactixMovementAnimation = requestAnimationFrame(animateFrame);
    } else {
      tactixMovementAnimation = null;
      animateMovesButton.disabled = false;
      animateMovesButton.textContent = "▶ Animer les déplacements";
    }
  };
  tactixMovementAnimation = requestAnimationFrame(animateFrame);
});

// Replacer les joueurs et le ballon comme avant l'animation, sans modifier les flèches.
resetAnimationButton.addEventListener("click", () => {
  if (!tactixAnimationStart) {
    resetAnimationButton.textContent = "Lance d’abord une animation";
    setTimeout(() => { resetAnimationButton.textContent = "↩ Replacer les joueurs"; }, 1800);
    return;
  }
  if (tactixMovementAnimation !== null) {
    cancelAnimationFrame(tactixMovementAnimation);
    tactixMovementAnimation = null;
  }
  for (const start of tactixAnimationStart.players) {
    const player = players.find(item => item.id === start.id);
    if (player) {
      player.x = start.x;
      player.y = start.y;
    }
  }
  if (tactixAnimationStart.opponents) {
    for (const start of tactixAnimationStart.opponents) {
      const opponent = tactixOpponents.find(item => item.id === start.id);
      if (opponent) { opponent.x = start.x; opponent.y = start.y; }
    }
  }
  tactixRenderOpponents();
  tactixBall.x = tactixAnimationStart.ball.x;
  tactixBall.y = tactixAnimationStart.ball.y;
  renderPlayers();
  renderTactixBall();
  tactixAnimationStart = null;
  animateMovesButton.disabled = false;
  animateMovesButton.textContent = "▶ Animer les déplacements";
});

// TACTIX — Bouton du mode pressing
let tactixPressingActive = false;

const tactixPressingButton = document.createElement("button");
tactixPressingButton.type = "button";
tactixPressingButton.className = "drawing-tool";
tactixPressingButton.textContent = "🔴 Activer le pressing";

formationToolbar.appendChild(tactixPressingButton);

// Choisir l'equipe qui effectue le pressing
const tactixPressingTeamSelect = document.createElement("select");
tactixPressingTeamSelect.id = "tactix-pressing-team";
tactixPressingTeamSelect.className = "drawing-tool";
tactixPressingTeamSelect.setAttribute("aria-label", "Equipe qui presse");

tactixPressingTeamSelect.innerHTML = `
  <option value="red">🔴 Pressing rouge</option>
  <option value="blue">🔵 Pressing bleu</option>
`;

formationToolbar.appendChild(tactixPressingTeamSelect);

// TACTIX - Intensite du pressing
const tactixPressingIntensitySelect = document.createElement("select");
tactixPressingIntensitySelect.id = "tactix-pressing-intensity";
tactixPressingIntensitySelect.className = "drawing-tool";
tactixPressingIntensitySelect.setAttribute("aria-label", "Intensite du pressing");
tactixPressingIntensitySelect.innerHTML = `
  <option value="low">🟢 Faible</option>
  <option value="medium" selected>🟡 Moyen</option>
  <option value="high">🔴 Intense</option>
`;
formationToolbar.appendChild(tactixPressingIntensitySelect);

tactixPressingButton.addEventListener("click", () => {
  if (!tactixPressingActive && !tactixAnimationStart) {
    tactixAnimationStart = {
      players: players.map(player => ({
        id: player.id, x: player.x, y: player.y
      })),
      opponents: tactixOpponents.map(player => ({
        id: player.id, x: player.x, y: player.y
      })),
      ball: { x: tactixBall.x, y: tactixBall.y }
    };
  }

  tactixPressingActive = !tactixPressingActive;

  tactixPressingButton.textContent = tactixPressingActive
    ? "⏸ Arrêter le pressing"
    : "🔴 Activer le pressing";
});

// TACTIX — Pressing haut organisé
setInterval(() => {
  if (
    !tactixPressingActive ||
    tactixPressingTeamSelect.value !== "red" ||
    !tactixOpponentsVisible ||
    !tactixBallVisible ||
    tactixOpponents.length === 0
  ) return;

  const ball = tactixBall;
  const players = tactixOpponents;

  // Le gardien reste à sa place.
  const fieldPlayers = players.filter(p => p.number !== 1);

  // Positions de référence de l'équipe adverse.
  const reference = tactixMakeOpponents();

  // Les attaquants sont les joueurs les plus avancés
  // vers le camp bleu (coordonnées Y les plus grandes).
  const sorted = [...fieldPlayers].sort((a, b) => b.y - a.y);

  const attackerCount = currentMode === 11 ? 3 : 2;
  const attackers = sorted.slice(0, attackerCount);

  // Parmi les attaquants, le plus proche presse le ballon.
  const presser = attackers.reduce((best, p) => {
    if (!best) return p;

    const d = Math.hypot(p.x - ball.x, p.y - ball.y);
    const bestD = Math.hypot(best.x - ball.x, best.y - ball.y);

    return d < bestD ? p : best;
  }, null);

  fieldPlayers.forEach(player => {
    const base = reference.find(p => p.id === player.id);
    if (!base) return;

    let targetX;
    let targetY;

    if (player === presser) {
      // Le premier attaquant presse le ballon.
      targetX = ball.x;
      targetY = ball.y;

    } else {
      // Toute l'équipe coulisse vers le ballon.
      const horizontalShift = (ball.x - 50) * 0.35;

      targetX = base.x + horizontalShift;

      if (attackers.includes(player)) {
        // Les autres attaquants ferment les passes.
        targetY = Math.max(base.y, ball.y - 8);
      } else {
        // Milieux et défenseurs avancent ensemble,
        // sans dépasser leur ligne de couverture.
        const forwardShift = Math.max(0, ball.y - 50) * 0.35;
        targetY = base.y + forwardShift;
      }
    }

    targetX = clamp(targetX, 5, 95);
    targetY = clamp(targetY, 4, 96);

    const dx = targetX - player.x;
    const dy = targetY - player.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 0.5) return;

    const pressingSpeed = {
      low: 0.15,
      medium: 0.3,
      high: 0.5
    }[tactixPressingIntensitySelect.value] || 0.3;

    const speed = Math.min(pressingSpeed, distance);

    player.x += (dx / distance) * speed;
    player.y += (dy / distance) * speed;

    const index = players.indexOf(player);
    const element = tactixOpponentsLayer.children[index];

    if (element) {
      element.style.left = player.x + "%";
      element.style.top = player.y + "%";
    }
  });
}, 40);
// TACTIX - Pressing haut bleu
setInterval(() => {
  if (
    !tactixPressingActive ||
    tactixPressingTeamSelect.value !== "blue" ||
    !tactixBallVisible ||
    players.length === 0
  ) return;

  const fieldPlayers = players.filter(player => player.id !== 1);
  if (!fieldPlayers.length) return;

  const reference = getDefaultPlayers();

  // Les attaquants bleus sont les plus avances vers le haut du terrain.
  const sorted = [...fieldPlayers].sort((a, b) => a.y - b.y);
  const attackerCount = currentMode === 11 ? 3 : 2;
  const attackers = sorted.slice(0, attackerCount);

  // L'attaquant le plus proche presse le ballon.
  const presser = attackers.reduce((best, player) => {
    if (!best) return player;

    const distance = Math.hypot(
      player.x - tactixBall.x,
      player.y - tactixBall.y
    );

    const bestDistance = Math.hypot(
      best.x - tactixBall.x,
      best.y - tactixBall.y
    );

    return distance < bestDistance ? player : best;
  }, null);

  fieldPlayers.forEach(player => {
    const base = reference.find(p => p.id === player.id);
    if (!base) return;

    let targetX;
    let targetY;

    if (player === presser) {
      targetX = tactixBall.x;
      targetY = tactixBall.y;
    } else {
      // L'equipe coulisse vers le ballon.
      targetX = base.x + (tactixBall.x - 50) * 0.35;

      if (attackers.includes(player)) {
        // Les autres attaquants ferment les passes.
        targetY = Math.min(base.y, tactixBall.y + 8);
      } else {
        // Milieux et defenseurs accompagnent le pressing.
        const forwardShift =
          Math.max(0, 50 - tactixBall.y) * 0.35;

        targetY = base.y - forwardShift;
      }
    }

    targetX = clamp(targetX, 5, 95);
    targetY = clamp(targetY, 4, 96);

    const dx = targetX - player.x;
    const dy = targetY - player.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 0.5) return;

    const pressingSpeed = {
      low: 0.15,
      medium: 0.3,
      high: 0.5
    }[tactixPressingIntensitySelect.value] || 0.3;

    const speed = Math.min(pressingSpeed, distance);

    player.x += (dx / distance) * speed;
    player.y += (dy / distance) * speed;
  });

  renderPlayers();
}, 40);