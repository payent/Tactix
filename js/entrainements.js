document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("entrainements");
  if (!section) return;

  const panel = section.querySelector(".workspace-panel");
  if (!panel) return;

  panel.innerHTML = `
    <h4>Créer une séance U10–U11</h4>

    <form id="training-form">
      <label for="training-title">Nom de la séance</label>
      <input id="training-title" type="text"
             placeholder="Ex. Conservation du ballon" required>

      <label for="training-duration">Durée (minutes)</label>
      <input id="training-duration" type="number"
             min="1" value="60" required>

      <label for="training-objective">Objectif</label>
      <textarea id="training-objective"
                placeholder="Ex. Améliorer le jeu collectif"></textarea>

      <label for="training-instructions">Consignes</label>
      <textarea id="training-instructions"
                placeholder="Ex. Jouer en deux touches"></textarea>

      <button type="submit">Créer la séance</button>
    </form>
  `;

  // TACTIX - Carnet des seances
  const sessionsList = document.createElement("div");
  sessionsList.id = "training-sessions-list";
  panel.appendChild(sessionsList);

  function displaySessions() {
    sessionsList.replaceChildren();

    const heading = document.createElement("h4");
    heading.textContent = "Mes séances enregistrées";
    sessionsList.appendChild(heading);

    let sessions;
    try {
      sessions = JSON.parse(
        localStorage.getItem("tactix-training-sessions") || "[]"
      );
      if (!Array.isArray(sessions)) sessions = [];
    } catch (error) {
      sessions = [];
    }

    if (sessions.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "Aucune séance enregistrée.";
      sessionsList.appendChild(empty);
      return;
    }

    sessions.forEach(session => {
      const card = document.createElement("div");
      card.className = "workspace-panel";
      card.style.marginTop = "12px";

      const title = document.createElement("h4");
      title.textContent = session.title || "Séance sans titre";

      const duration = document.createElement("p");
      duration.textContent = "Durée : " + session.duration + " minutes";

      const objective = document.createElement("p");
      objective.textContent = "Objectif : " + (session.objective || "Non précisé");

      const instructions = document.createElement("p");
      instructions.textContent = "Consignes : " + (session.instructions || "Non précisées");

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Supprimer la séance";

      deleteButton.addEventListener("click", () => {
        if (!confirm("Supprimer cette séance définitivement ?")) return;

        const updatedSessions = sessions.filter(
          item => item.id !== session.id
        );

        localStorage.setItem(
          "tactix-training-sessions",
          JSON.stringify(updatedSessions)
        );

        displaySessions();
      });

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "Modifier la séance";

      editButton.addEventListener("click", () => {
        document.getElementById("training-title").value = session.title;
        document.getElementById("training-duration").value = session.duration;
        document.getElementById("training-objective").value = session.objective || "";
        document.getElementById("training-instructions").value = session.instructions || "";

        const form = document.getElementById("training-form");
        form.dataset.editId = String(session.id);
        form.querySelector('button[type="submit"]').textContent =
          "Enregistrer les modifications";

        form.scrollIntoView({ behavior: "smooth" });
      });

      card.append(title, duration, objective, instructions, editButton, deleteButton);
      sessionsList.appendChild(card);
    });
  }

  displaySessions();

  section.querySelector("#training-form")
    .addEventListener("submit", event => {
      event.preventDefault();
      const session = {
        id: Date.now(),
        title: document.getElementById("training-title").value.trim(),
        duration: Number(document.getElementById("training-duration").value),
        objective: document.getElementById("training-objective").value.trim(),
        instructions: document.getElementById("training-instructions").value.trim()
      };

      try {
        const sessions = JSON.parse(
          localStorage.getItem("tactix-training-sessions") || "[]"
        );

        const editId = event.target.dataset.editId;
        const isEditing = Boolean(editId);

        if (isEditing) {
          const index = sessions.findIndex(
            item => String(item.id) === editId
          );

          if (index === -1) {
            alert("Séance introuvable. Modification annulée.");
            return;
          }

          session.id = sessions[index].id;
          sessions[index] = session;
        } else {
          sessions.push(session);
        }

        localStorage.setItem(
          "tactix-training-sessions",
          JSON.stringify(sessions)
        );

        displaySessions();
        delete event.target.dataset.editId;
        event.target.querySelector('button[type="submit"]').textContent =
          "Créer la séance";
        alert(isEditing ? "Séance modifiée !" : "Séance enregistrée !");
        event.target.reset();
      } catch (error) {
        alert("Impossible d'enregistrer la séance.");
        console.error(error);
      }
    });
});