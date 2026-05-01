(async function () {
  const app = document.getElementById("app");
  const data = await TimeMaster.load();
  let filter = "all";

  app.innerHTML = TimeMaster.pageTemplate("tasks", "المهام", '<i class="ri-task-line"></i> إدارة المهام الذكية', `
    <div class="grid-2">
      <div class="panel">
        <h3><i class="ri-add-circle-line"></i> إضافة مهمة جديدة</h3>
        <form id="taskForm" class="form-grid">
          <input id="title" required placeholder="عنوان المهمة">
          <select id="priority"><option value="high">عالية</option><option value="medium" selected>متوسطة</option><option value="low">منخفضة</option></select>
          <select id="recurrence"><option value="none">غير متكررة</option><option value="daily">يومية</option><option value="weekly">أسبوعية</option></select>
          <input id="estimate" type="number" min="5" step="5" value="25" placeholder="التقدير بالدقائق">
          <input id="dueDate" type="date">
          <textarea id="taskNotes" rows="2" placeholder="ملاحظات إضافية (اختياري)"></textarea>
          <button class="btn-primary" type="submit"><i class="ri-add-line"></i> إضافة</button>
        </form>
      </div>
      <div class="panel">
        <h3><i class="ri-filter-3-line"></i> التصفية والبحث</h3>
        <input id="taskSearch" type="search" placeholder="بحث عن مهمة...">
        <div class="filters" style="margin-top:.6rem;">
          <button class="chip active" data-f="all">الكل</button>
          <button class="chip" data-f="today"><i class="ri-calendar-todo-line"></i> اليوم</button>
          <button class="chip" data-f="done"><i class="ri-checkbox-circle-line"></i> مكتمل</button>
          <button class="chip" data-f="high"><i class="ri-error-warning-line"></i> عالي</button>
          <button class="chip" data-f="overdue"><i class="ri-alarm-warning-line"></i> متأخر</button>
        </div>
        <div style="margin-top:.8rem;">
          <span id="taskCount" class="badge" style="font-size:1rem;"></span>
        </div>
        <div class="timer-controls" style="margin-top:.8rem;">
          <button class="btn-secondary" id="rescueMode" type="button"><i class="ri-alarm-warning-line"></i> Rescue Mode</button>
          <button class="btn-secondary" id="sortPriority" type="button"><i class="ri-sort-desc"></i> ترتيب بالأولوية</button>
        </div>
      </div>
    </div>
    <div class="panel"><div id="list" class="tasks-list"></div></div>
    <div class="panel" style="margin-top:1rem;">
      <h3><i class="ri-calendar-schedule-line"></i> Blueprint Generator — خطة يومك التلقائية</h3>
      <div class="grid-2">
        <div class="form-grid"><label>بداية يوم العمل</label><input type="time" id="workStart" value="08:00"></div>
        <div class="form-grid"><label>نهاية يوم العمل</label><input type="time" id="workEnd" value="16:00"></div>
      </div>
      <div class="timer-controls"><button class="btn-primary" type="button" id="generatePlan"><i class="ri-magic-line"></i> توليد خطة اليوم</button></div>
      <div id="dayPlanList" class="plan-list"></div>
    </div>
  `);

  function createRecurringTask(task) {
    if (!task.dueDate || task.recurrence === "none") return;
    const next = new Date(task.dueDate);
    next.setDate(next.getDate() + (task.recurrence === "daily" ? 1 : 7));
    const dueDate = next.toISOString().split("T")[0];
    const exists = data.tasks.some(t => t.title === task.title && t.dueDate === dueDate && !t.done);
    if (exists) return;
    data.tasks.unshift({ ...task, id: TimeMaster.uid(), done: false, status: "todo", dueDate });
  }

  function isOverdue(task) {
    if (!task.dueDate || task.done) return false;
    return new Date(task.dueDate) < new Date(new Date().toDateString());
  }

  let searchQuery = "";

  function render() {
    const list = document.getElementById("list");
    const items = data.tasks.filter(t => {
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filter === "all") return true;
      if (filter === "today") return TimeMaster.isToday(t.dueDate);
      if (filter === "done") return t.done;
      if (filter === "overdue") return isOverdue(t);
      return t.priority === filter;
    });

    const countEl = document.getElementById("taskCount");
    if (countEl) countEl.textContent = `${items.length} مهمة`;

    list.innerHTML = items.length === 0
      ? `<div class="muted-note" style="text-align:center;padding:2rem;">لا توجد مهام${filter !== "all" ? " في هذا التصنيف" : " حتى الآن. أضف أول مهمة!"}</div>`
      : items.map(task => `
      <div class="task-item ${task.done ? "done" : ""}" style="${isOverdue(task) ? "border-right:4px solid var(--accent-red);" : ""}">
        <div>
          <strong>${task.done ? '<i class="ri-checkbox-circle-fill" style="color:var(--accent-green)"></i>' : '<i class="ri-time-line"></i>'} ${task.title}</strong>
          ${task.notes ? `<div style="font-size:.85rem;color:var(--ink-light);margin-top:2px;"><i class="ri-sticky-note-line"></i> ${task.notes}</div>` : ""}
          <div class="task-meta">
            <small><i class="ri-calendar-line"></i> ${TimeMaster.formatDate(task.dueDate)}${isOverdue(task) ? ' <span style="color:var(--accent-red)">متأخر</span>' : ""}</small>
            <small><i class="ri-timer-line"></i> ${task.estimate} دقيقة</small>
            <small><i class="ri-loop-left-line"></i> ${task.recurrence === "daily" ? "يومي" : task.recurrence === "weekly" ? "أسبوعي" : "—"}</small>
          </div>
        </div>
        <div>
          <span class="badge ${task.priority}">${task.priority === "high" ? "عالية" : task.priority === "medium" ? "متوسطة" : "منخفضة"}</span>
          <button class="chip" data-action="toggle" data-id="${task.id}">${task.done ? '<i class="ri-arrow-go-back-line"></i>' : '<i class="ri-check-line"></i>'}</button>
          <button class="chip" data-action="delete" data-id="${task.id}"><i class="ri-delete-bin-line"></i></button>
        </div>
      </div>
    `).join("");
  }

  function priorityWeight(p) { return p === "high" ? 3 : p === "medium" ? 2 : 1; }
  function toMinutes(v) { const [h, m] = v.split(":").map(Number); return h * 60 + m; }
  function toTimeLabel(t) { return `${String(Math.floor(t/60)).padStart(2,"0")}:${String(t%60).padStart(2,"0")}`; }

  function generateDayBlueprint() {
    const start = toMinutes(document.getElementById("workStart").value || "08:00");
    const end = toMinutes(document.getElementById("workEnd").value || "16:00");
    if (end <= start) { TimeMaster.toast("وقت النهاية يجب أن يكون بعد البداية"); return; }
    const pending = data.tasks.filter(t => !t.done).sort((a, b) => {
      const p = priorityWeight(b.priority) - priorityWeight(a.priority);
      if (p !== 0) return p;
      const ad = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bd = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return ad - bd;
    });
    let cursor = start; const blocks = [];
    for (const task of pending) {
      const slot = Math.max(10, Number(task.estimate || 25));
      if (cursor + slot > end) break;
      blocks.push({ taskId: task.id, title: task.title, from: toTimeLabel(cursor), to: toTimeLabel(cursor + slot), priority: task.priority });
      cursor += slot;
    }
    data.dayBlueprint = { date: new Date().toISOString().split("T")[0], workStart: toTimeLabel(start), workEnd: toTimeLabel(end), utilization: Math.round(((cursor - start) / (end - start)) * 100), blocks };
  }

  function renderBlueprint() {
    const wrap = document.getElementById("dayPlanList");
    const plan = data.dayBlueprint;
    if (!plan || !Array.isArray(plan.blocks) || plan.blocks.length === 0) {
      wrap.innerHTML = "<div class='muted-note'>لا توجد خطة مولّدة بعد.</div>";
      return;
    }
    wrap.innerHTML = `
      <div class="plan-meta">
        <strong><i class="ri-calendar-check-line"></i> خطة ${plan.date}</strong>
        <span class="streak-badge"><i class="ri-speed-line"></i> ${plan.utilization}%</span>
        <span>${plan.workStart} → ${plan.workEnd}</span>
      </div>
      ${plan.blocks.map(b => `
        <div class="plan-item">
          <strong><i class="ri-time-line"></i> ${b.from} - ${b.to}</strong>
          <span>${b.title}</span>
          <span class="badge ${b.priority}">${b.priority === "high" ? "عالية" : b.priority === "medium" ? "متوسطة" : "منخفضة"}</span>
        </div>
      `).join("")}
    `;
  }

  const searchEl = document.getElementById("taskSearch");
  if (searchEl) searchEl.addEventListener("input", (e) => { searchQuery = e.target.value; render(); });

  app.addEventListener("submit", async (e) => {
    if (e.target.id !== "taskForm") return;
    e.preventDefault();
    data.tasks.unshift({ id: TimeMaster.uid(), title: document.getElementById("title").value.trim(), priority: document.getElementById("priority").value, recurrence: document.getElementById("recurrence").value, estimate: Number(document.getElementById("estimate").value || 25), dueDate: document.getElementById("dueDate").value, notes: document.getElementById("taskNotes").value.trim(), done: false, status: "todo" });
    e.target.reset(); render(); renderBlueprint();
    TimeMaster.toast("تم إضافة المهمة بنجاح");
    await TimeMaster.save(data);
  });

  app.addEventListener("click", async (e) => {
    const filterBtn = e.target.closest("[data-f]");
    if (filterBtn) {
      document.querySelectorAll("[data-f]").forEach(x => x.classList.remove("active"));
      filterBtn.classList.add("active"); filter = filterBtn.dataset.f; render(); return;
    }
    const actionBtn = e.target.closest("[data-action]");
    if (!actionBtn) return;
    const id = actionBtn.dataset.id;
    const task = data.tasks.find(t => t.id === id);
    if (!task) return;
    if (actionBtn.dataset.action === "toggle") {
      task.done = !task.done; task.status = task.done ? "done" : "todo";
      if (task.done) { createRecurringTask(task); TimeMaster.confetti(); TimeMaster.toast("أحسنت! تم إنجاز المهمة"); }
    } else if (actionBtn.dataset.action === "delete") {
      data.tasks = data.tasks.filter(t => t.id !== id); TimeMaster.toast("تم حذف المهمة");
    }
    render(); renderBlueprint(); await TimeMaster.save(data);
  });

  document.getElementById("generatePlan").addEventListener("click", async () => { generateDayBlueprint(); renderBlueprint(); TimeMaster.toast("تم توليد خطة اليوم"); await TimeMaster.save(data); });

  document.getElementById("rescueMode").addEventListener("click", async () => {
    const urgent = data.tasks.filter(t => !t.done).sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority)).slice(0, 3);
    if (urgent.length === 0) { TimeMaster.toast("لا توجد مهام طارئة"); return; }
    let cursor = toMinutes("09:00");
    const blocks = urgent.map(task => { const slot = Math.max(15, Math.min(45, Number(task.estimate || 25))); const b = { taskId: task.id, title: `[Rescue] ${task.title}`, from: toTimeLabel(cursor), to: toTimeLabel(cursor + slot), priority: task.priority }; cursor += slot; return b; });
    data.dayBlueprint = { date: new Date().toISOString().split("T")[0], workStart: "09:00", workEnd: toTimeLabel(cursor), utilization: 100, blocks, mode: "rescue" };
    renderBlueprint(); TimeMaster.toast("تم تفعيل Rescue Mode!"); await TimeMaster.save(data);
  });

  document.getElementById("sortPriority").addEventListener("click", async () => {
    data.tasks.sort((a, b) => { if (a.done !== b.done) return a.done ? 1 : -1; return priorityWeight(b.priority) - priorityWeight(a.priority); });
    render(); TimeMaster.toast("تم الترتيب بالأولوية"); await TimeMaster.save(data);
  });

  render(); renderBlueprint();
})();
