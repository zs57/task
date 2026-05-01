(async function () {
  const app = document.getElementById("app");
  const data = await TimeMaster.load();
  app.innerHTML = TimeMaster.pageTemplate("kanban", "كانبان", '<i class="ri-kanban-view"></i> إدارة سير العمل بالسحب والإفلات', `
    <div class="panel">
      <div class="kanban-board">
        <div class="kanban-col" data-status="todo"><h4><i class="ri-list-check"></i> To Do</h4><div id="todo" class="kanban-list"></div></div>
        <div class="kanban-col" data-status="doing"><h4><i class="ri-loader-4-line"></i> Doing</h4><div id="doing" class="kanban-list"></div></div>
        <div class="kanban-col" data-status="done"><h4><i class="ri-checkbox-circle-line"></i> Done</h4><div id="done" class="kanban-list"></div></div>
      </div>
    </div>
  `);

  function render() {
    const refs = { todo: document.getElementById("todo"), doing: document.getElementById("doing"), done: document.getElementById("done") };
    Object.values(refs).forEach(el => { el.innerHTML = ""; });
    data.tasks.forEach(task => {
      const el = document.createElement("div");
      el.className = "kanban-card";
      el.draggable = true;
      el.dataset.id = task.id;
      el.innerHTML = `<strong>${task.title}</strong><div><small><span class="badge ${task.priority}">${task.priority}</span> <i class="ri-timer-line"></i> ${task.estimate}m</small></div>`;
      el.addEventListener("dragstart", () => el.classList.add("dragging"));
      el.addEventListener("dragend", () => el.classList.remove("dragging"));
      (refs[task.status] || refs.todo).appendChild(el);
    });
  }

  document.querySelectorAll(".kanban-col").forEach(col => {
    col.addEventListener("dragover", (e) => e.preventDefault());
    col.addEventListener("drop", async () => {
      const dragging = document.querySelector(".kanban-card.dragging");
      if (!dragging) return;
      const task = data.tasks.find(t => t.id === dragging.dataset.id);
      if (!task) return;
      task.status = col.dataset.status;
      task.done = task.status === "done";
      if (task.done) TimeMaster.confetti();
      render();
      await TimeMaster.save(data);
    });
  });

  render();
})();
