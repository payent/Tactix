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

  // TACTIX - Bibliotheque d'exercices U10-U11
  const libraryPanel = document.createElement("div");
  libraryPanel.id = "training-exercise-library";

  const libraryTitle = document.createElement("h4");
  libraryTitle.textContent = "Bibliothèque d'exercices U10–U11";

  const exerciseSelect = document.createElement("select");
  exerciseSelect.id = "training-exercise-select";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Choisir un exercice";
  exerciseSelect.appendChild(defaultOption);

  const exercises = window.TACTIX_EXERCICES || [];

  exercises.forEach(exercise => {
    const option = document.createElement("option");
    option.value = exercise.id;
    option.textContent =
      exercise.categorie + " — " + exercise.nom + " (" + exercise.duree + " min)";
    exerciseSelect.appendChild(option);
  });

  const categorySelect = document.createElement("select");
  categorySelect.id = "training-category-select";

  const allCategories = document.createElement("option");
  allCategories.value = "";
  allCategories.textContent = "Toutes les catégories";
  categorySelect.appendChild(allCategories);

  [...new Set(exercises.map(exercise => exercise.categorie))]
    .sort((a, b) => a.localeCompare(b, "fr"))
    .forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });

  categorySelect.addEventListener("change", () => {
    exerciseSelect.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Choisir un exercice";
    exerciseSelect.appendChild(placeholder);

    exercises
      .filter(exercise =>
        !categorySelect.value ||
        exercise.categorie === categorySelect.value
      )
      .forEach(exercise => {
        const option = document.createElement("option");
        option.value = exercise.id;
        option.textContent =
          exercise.nom + " (" + exercise.duree + " min)";
        exerciseSelect.appendChild(option);
      });

    exerciseSelect.dispatchEvent(new Event("change"));
  });

  const searchInput = document.createElement("input");
  searchInput.id = "training-exercise-search";
  searchInput.type = "search";
  searchInput.placeholder = "Rechercher un exercice...";
  searchInput.setAttribute("aria-label", "Rechercher un exercice");

  searchInput.addEventListener("input", () => {
    exerciseSelect.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Choisir un exercice";
    exerciseSelect.appendChild(placeholder);

    const search = searchInput.value.trim().toLocaleLowerCase("fr");

    exercises
      .filter(exercise =>
        (!categorySelect.value ||
          exercise.categorie === categorySelect.value) &&
        exercise.nom.toLocaleLowerCase("fr").includes(search)
      )
      .forEach(exercise => {
        const option = document.createElement("option");
        option.value = exercise.id;
        option.textContent =
          exercise.nom + " (" + exercise.duree + " min)";
        exerciseSelect.appendChild(option);
      });

    exerciseSelect.dispatchEvent(new Event("change"));
  });

  categorySelect.addEventListener("change", () => {
    searchInput.dispatchEvent(new Event("input"));
  });

  libraryPanel.append(
    libraryTitle,
    categorySelect,
    searchInput,
    exerciseSelect
  );
  panel.appendChild(libraryPanel);

  const exerciseDetails = document.createElement("div");
  exerciseDetails.id = "training-exercise-details";
  exerciseDetails.style.marginTop = "12px";
  libraryPanel.appendChild(exerciseDetails);

  exerciseSelect.addEventListener("change", () => {
    exerciseDetails.replaceChildren();

    const exercise = exercises.find(
      item => item.id === exerciseSelect.value
    );

    if (!exercise) return;

    exerciseDetails.classList.add("exercise-detail-card");

    const name = document.createElement("h4");
    name.className = "exercise-detail-title";
    name.textContent = exercise.nom;

    const metadata = document.createElement("div");
    metadata.className = "exercise-detail-meta";

    const category = document.createElement("span");
    category.textContent = exercise.categorie;

    const duration = document.createElement("span");
    duration.textContent = exercise.duree + " min";

    metadata.append(category, duration);

    const objective = document.createElement("div");
    objective.className = "exercise-detail-section";

    const objectiveTitle = document.createElement("strong");
    objectiveTitle.textContent = "Objectif";

    const objectiveText = document.createElement("p");
    objectiveText.textContent = exercise.objectif;
    objective.append(objectiveTitle, objectiveText);

    const instructions = document.createElement("div");
    instructions.className = "exercise-detail-section";

    const instructionsTitle = document.createElement("strong");
    instructionsTitle.textContent = "Consignes";

    const instructionsText = document.createElement("p");
    instructionsText.textContent = exercise.consignes;
    instructions.append(instructionsTitle, instructionsText);

    exerciseDetails.append(
      name,
      metadata,
      objective,
      instructions
    );
  });
  // Exercices de la séance en préparation
  let selectedExercises = [];

  const sessionExercisesPanel = document.createElement("div");
  sessionExercisesPanel.id = "training-session-exercises";

  const sessionExercisesTitle = document.createElement("h4");
  sessionExercisesTitle.textContent = "Exercices de la séance";

  const totalDuration = document.createElement("p");
  totalDuration.id = "training-total-duration";

  const selectedExercisesList = document.createElement("ol");
  selectedExercisesList.id = "training-selected-exercises";

  const addExerciseButton = document.createElement("button");
  addExerciseButton.type = "button";
  addExerciseButton.textContent = "Ajouter à la séance";

  function renderSelectedExercises() {
    selectedExercisesList.replaceChildren();

    selectedExercises.forEach((exercise, index) => {
      const item = document.createElement("li");
      item.className = "training-exercise-item";

      const info = document.createElement("div");
      info.className = "training-exercise-info";

      const exerciseName = document.createElement("strong");
      exerciseName.textContent = exercise.nom;

      const exerciseDuration = document.createElement("span");
      exerciseDuration.textContent = exercise.duree + " min";

      info.append(exerciseName, exerciseDuration);

      const upButton = document.createElement("button");
      upButton.type = "button";
      upButton.textContent = "↑";
      upButton.disabled = index === 0;
      upButton.setAttribute("aria-label", "Monter " + exercise.nom);
      upButton.addEventListener("click", () => {
        [selectedExercises[index - 1], selectedExercises[index]] =
          [selectedExercises[index], selectedExercises[index - 1]];
        renderSelectedExercises();
      });

      const downButton = document.createElement("button");
      downButton.type = "button";
      downButton.textContent = "↓";
      downButton.disabled = index === selectedExercises.length - 1;
      downButton.setAttribute("aria-label", "Descendre " + exercise.nom);
      downButton.addEventListener("click", () => {
        [selectedExercises[index + 1], selectedExercises[index]] =
          [selectedExercises[index], selectedExercises[index + 1]];
        renderSelectedExercises();
      });

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.textContent = "Retirer";
      removeButton.addEventListener("click", () => {
        selectedExercises.splice(index, 1);
        renderSelectedExercises();
      });

      const actions = document.createElement("div");
      actions.className = "training-exercise-actions";
      actions.append(upButton, downButton, removeButton);

      item.append(info, actions);
      selectedExercisesList.appendChild(item);
    });

    const minutes = selectedExercises.reduce(
      (sum, exercise) => sum + Number(exercise.duree || 0), 0
    );
    totalDuration.textContent =
      "Durée totale des exercices : " + minutes + " minutes";
  }

  addExerciseButton.addEventListener("click", () => {
    const exercise = exercises.find(
      item => item.id === exerciseSelect.value
    );

    if (!exercise) {
      alert("Choisis d'abord un exercice dans la bibliothèque.");
      return;
    }

    selectedExercises.push({ ...exercise });
    renderSelectedExercises();
  });

  sessionExercisesPanel.append(
    sessionExercisesTitle,
    addExerciseButton,
    selectedExercisesList,
    totalDuration
  );
  libraryPanel.appendChild(sessionExercisesPanel);
  renderSelectedExercises();
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

        selectedExercises = Array.isArray(session.exercises)
          ? session.exercises.map(exercise => ({ ...exercise }))
          : [];

        renderSelectedExercises();

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
        instructions: document.getElementById("training-instructions").value.trim(),
        exercises: selectedExercises.map(exercise => ({ ...exercise })),
        exerciseDuration: selectedExercises.reduce(
          (total, exercise) => total + Number(exercise.duree || 0), 0
        )
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