const apiEndpoint = "https://clicontainerapp.reddune-43b8a5ce.francecentral.azurecontainerapps.io/api/tasks";

$(document).ready(function () {
  // Charger les tâches au démarrage
  loadTasks();

  // Ajouter une nouvelle tâche avec effet
  $("#todo-form").on("submit", async function (e) {
    e.preventDefault();

    const description = $("#todo-input").val().trim();
    if (description === "") return;

    const task = { description: description };

    try {
      await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      loadTasks();
      $("#todo-input").val(""); // Réinitialiser le champ
    } catch (error) {
      console.error("Erreur lors de l'ajout de la tâche :", error);
    }
  });

  // Marquer une tâche comme terminée (ou non)
  $("#todo-list").on("click", ".task-toggle", async function (e) {
    e.stopPropagation(); // Empêcher la propagation du clic au parent
    const $taskElement = $(this).closest("li"); // Trouve l'élément li parent
    const taskId = $taskElement.data("id");
    const isCompleted = $taskElement.hasClass("completed");
    const description = $taskElement.find(".task-text").text().trim();

    const updatedTask = { id: taskId, description: description, completed: !isCompleted };

    try {
      await fetch(apiEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });
      $taskElement.toggleClass("completed");
      $(this).toggleClass("checked"); // Ajouter ou retirer la classe 'checked' pour l'animation
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche :", error);
    }
  });

  // Supprimer une tâche avec animation
  $("#todo-list").on("click", ".delete-btn", async function (e) {
    e.stopPropagation(); // Empêcher le clic sur la tâche elle-même
    const $taskElement = $(this).parent();
    const taskId = $taskElement.data("id");

    try {
      await fetch(`${apiEndpoint}?id=${taskId}`, {
        method: "DELETE",
      });
      // Animation de disparition
      $taskElement.fadeOut(300, function () {
        $(this).remove();
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche :", error);
    }
  });

  // Charger les tâches depuis l'API avec animation
  async function loadTasks() {
    try {
      const response = await fetch(apiEndpoint);
      const tasks = await response.json();

      // Trier les tâches : non complétées d'abord, complétées ensuite
      tasks.sort((a, b) => a.completed - b.completed);

      // Effacer la liste et ajouter les tâches
      $("#todo-list").empty();
      tasks.forEach((task) => {
        const listItem = $("<li>")
          .data("id", task.id)
          .addClass(task.completed ? "completed" : "")
          .append(
            $("<span>")
              .addClass("task-toggle" + (task.completed ? " checked" : ""))
          )
          .append(
            $("<span>")
              .addClass("task-text")
              .text(task.description)
          )
          .append(
            $("<button>")
              .html("&#10005;")
              .addClass("delete-btn")
          );

        $("#todo-list").append(listItem);
        // Animation d'apparition
        listItem.hide().fadeIn(300);
      });
    } catch (error) {
      console.error("Erreur lors du chargement des tâches :", error);
    }
  }
});
