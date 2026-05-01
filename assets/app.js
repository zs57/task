const state = {
  data: {
    tasks: [],
    habits: [],
    goals: [],
    notes: "",
    focusMinutes: 0,
    completedPomodoros: 0,
    weeklyFocusTarget: 300,
    streak: 0,
    lastActiveDate: null
  },
  filter: "all",
  search: "",
  timer: { remaining: 25 * 60, active: false, interval: null }
};

function toggleMenu() {
  document.getElementById("mobileMenu").classList.toggle("open");
}

async function api(action, payload = {}) {
  const res = await fetch("api.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload })
  });
  return res.json();
}

async function loadData() {
  const res = await api("getData");
  if (res.ok) {
    state.data = {
      ...state.data,
      ...res.data
    };
    hydrateTasks();
    updateDailyStreak();
    renderAll();
  }
}

async function saveData() {
  await api("saveData", state.data);
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString("ar-EG") : "بدون موعد";
}

function isToday(value) {
  if (!value) return false;
  const d = new Date(value);
  const t = new Date();
  return d.toDateString() === t.toDateString();
}

function hydrateTasks() {
  state.data.tasks = state.data.tasks.map(task => ({
    status: "todo",
    recurrence: "none",
    estimate: 25,
    ...task
  }));
}

function smartQuadrant(task) {
  const urgent = isToday(task.dueDate);
  const important = task.priority === "high";
  if (urgent && important) return "do";
  if (!urgent && important) return "plan";
  if (urgent && !important) return "delegate";
  return "eliminate";
}

function renderTasks() {
  const list = document.getElementById("tasksList");
  const filtered = state.data.tasks.filter(task => {
    const q = state.search.trim().toLowerCase();
    if (q && !task.title.toLowerCase().includes(q)) return false;
    if (state.filter === "all") return true;
    if (state.filter === "today") return isToday(task.dueDate);
    if (state.filter === "done") return task.done;
    return task.priority === state.filter;
  });
  list.innerHTML = filtered.map(task => `
    <div class="task-item ${task.done ? "done" : ""}">
      <div>
        <strong>${task.title}</strong>
        <div><small>${formatDate(task.dueDate)}</small></div>
        <div class="task-meta">
          <small>⏱ ${task.estimate} دقيقة</small>
          <small>🔁 ${task.recurrence === "daily" ? "يومي" : task.recurrence === "weekly" ? "أسبوعي" : "بدون تكرار"}</small>
          <small>📌 ${task.status}</small>
        </div>
      </div>
      <div>
        <span class="badge ${task.priority}">${task.priority === "high" ? "عالية" : task.priority === "medium" ? "متوسطة" : "منخفضة"}</span>
        <button class="chip" onclick="toggleTask('${task.id}')">${task.done ? "تراجع" : "تم"}</button>
        <button class="chip" onclick="deleteTask('${task.id}')">حذف</button>
      </div>
    </div>
  `).join("");
}

function renderKanban() {
  const statusMap = {
    todo: document.getElementById("kanbanTodo"),
    doing: document.getElementById("kanbanDoing"),
    done: document.getElementById("kanbanDone")
  };
  Object.values(statusMap).forEach(el => { el.innerHTML = ""; });
  state.data.tasks.forEach(task => {
    const card = document.createElement("div");
    card.className = "kanban-card";
    card.draggable = true;
    card.dataset.id = task.id;
    card.innerHTML = `<strong>${task.title}</strong><div><small>${task.estimate}m</small></div>`;
    card.addEventListener("dragstart", () => card.classList.add("dragging"));
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
    (statusMap[task.status] || statusMap.todo).appendChild(card);
  });
}

function renderMatrix() {
  const matrix = document.getElementById("matrix");
  const buckets = {
    do: "مهم + عاجل (افعل الآن)",
    plan: "مهم + غير عاجل (خطط)",
    delegate: "عاجل + أقل أهمية (فوّض)",
    eliminate: "غير مهم + غير عاجل (قلّل)"
  };
  const data = { do: [], plan: [], delegate: [], eliminate: [] };
  state.data.tasks.filter(t => !t.done).forEach(t => data[smartQuadrant(t)].push(t.title));
  matrix.innerHTML = Object.entries(buckets).map(([key, label]) => `
    <div class="matrix-box">
      <h4>${label}</h4>
      <ul>${(data[key].slice(0, 5).map(item => `<li>${item}</li>`).join("") || "<li>لا يوجد</li>")}</ul>
    </div>
  `).join("");
}

function renderHabits() {
  const list = document.getElementById("habitsList");
  list.innerHTML = state.data.habits.map(h => `
    <div class="habit-item">
      <span>${h.name}</span>
      <div>
        <span class="badge">${h.streak} يوم</span>
        <button class="chip" onclick="checkHabit('${h.id}')">تم اليوم</button>
      </div>
    </div>
  `).join("");
}

function renderGoals() {
  const list = document.getElementById("goalsList");
  list.innerHTML = state.data.goals.map(g => {
    const percent = Math.min(100, Math.round((g.current / g.target) * 100));
    return `
      <div class="goal-item">
        <div>
          <strong>${g.title}</strong>
          <div><small>${g.current} / ${g.target}</small></div>
          <div class="bar"><span style="width:${percent}%"></span></div>
        </div>
        <button class="chip" onclick="advanceGoal('${g.id}')">+1</button>
      </div>
    `;
  }).join("");
}

function renderWeeklyProgress() {
  const container = document.getElementById("weeklyProgress");
  const total = state.data.habits.length || 1;
  const avg = Math.min(100, Math.round((state.data.habits.reduce((a, h) => a + h.streak, 0) / total) * 10));
  container.innerHTML = `
    <div>متوسط الالتزام بالعادات: ${avg}%</div>
    <div class="bar"><span style="width:${avg}%"></span></div>
    <div>جلسات بومودورو المكتملة: ${state.data.completedPomodoros}</div>
    <div class="bar"><span style="width:${Math.min(100, state.data.completedPomodoros * 10)}%"></span></div>
  `;
}

function renderFocusTarget() {
  const goal = Number(state.data.weeklyFocusTarget || 300);
  const progress = Math.min(100, Math.round((state.data.focusMinutes / goal) * 100));
  document.getElementById("weeklyFocusTarget").value = goal;
  document.getElementById("focusTargetProgress").innerHTML = `
    <div>المنجز من الهدف الأسبوعي: ${state.data.focusMinutes} / ${goal} دقيقة (${progress}%)</div>
    <div class="bar"><span style="width:${progress}%"></span></div>
  `;
}

function renderDashboard() {
  const done = state.data.tasks.filter(t => t.done).length;
  document.getElementById("doneToday").textContent = done;
  document.getElementById("pendingToday").textContent = Math.max(0, state.data.tasks.length - done);
  document.getElementById("focusToday").textContent = state.data.focusMinutes;
  document.getElementById("quickNotes").value = state.data.notes || "";
}

function renderAll() {
  renderTasks();
  renderKanban();
  renderMatrix();
  renderHabits();
  renderGoals();
  renderWeeklyProgress();
  renderFocusTarget();
  renderDashboard();
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

document.getElementById("taskForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("taskTitle").value.trim();
  if (!title) return;
  state.data.tasks.unshift({
    id: uid(),
    title,
    priority: document.getElementById("taskPriority").value,
    recurrence: document.getElementById("taskRecurrence").value,
    estimate: Number(document.getElementById("taskEstimate").value || 25),
    dueDate: document.getElementById("taskDue").value,
    done: false,
    status: "todo"
  });
  e.target.reset();
  renderAll();
  await saveData();
});

document.getElementById("habitForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("habitName").value.trim();
  if (!name) return;
  state.data.habits.push({ id: uid(), name, streak: 0, lastCheck: null });
  e.target.reset();
  renderAll();
  await saveData();
});

document.getElementById("goalForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  state.data.goals.push({
    id: uid(),
    title: document.getElementById("goalTitle").value.trim(),
    target: Number(document.getElementById("goalTarget").value),
    current: Number(document.getElementById("goalCurrent").value || 0)
  });
  e.target.reset();
  renderGoals();
  await saveData();
});

document.getElementById("taskSearch").addEventListener("input", (e) => {
  state.search = e.target.value;
  renderTasks();
});

document.querySelectorAll(".chip[data-filter]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".chip[data-filter]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.filter = btn.dataset.filter;
    renderTasks();
  });
});

async function toggleTask(id) {
  const item = state.data.tasks.find(t => t.id === id);
  if (!item) return;
  item.done = !item.done;
  if (item.done) {
    item.status = "done";
    createRecurringTask(item);
  } else {
    item.status = "todo";
  }
  renderAll();
  await saveData();
}

async function deleteTask(id) {
  state.data.tasks = state.data.tasks.filter(t => t.id !== id);
  renderAll();
  await saveData();
}

async function checkHabit(id) {
  const h = state.data.habits.find(x => x.id === id);
  if (!h) return;
  const today = new Date().toDateString();
  if (h.lastCheck !== today) {
    h.streak += 1;
    h.lastCheck = today;
  }
  renderAll();
  await saveData();
}

async function advanceGoal(id) {
  const g = state.data.goals.find(x => x.id === id);
  if (!g) return;
  g.current += 1;
  renderGoals();
  await saveData();
}

function updateTimerUi() {
  const m = String(Math.floor(state.timer.remaining / 60)).padStart(2, "0");
  const s = String(state.timer.remaining % 60).padStart(2, "0");
  document.getElementById("timerValue").textContent = `${m}:${s}`;
}

async function completePomodoro() {
  state.data.completedPomodoros += 1;
  state.data.focusMinutes += 25;
  renderDashboard();
  renderWeeklyProgress();
  renderFocusTarget();
  await saveData();
  alert("رائع! أنهيت جلسة تركيز كاملة.");
}

function createRecurringTask(task) {
  if (!task.recurrence || task.recurrence === "none") return;
  if (!task.dueDate) return;
  const next = new Date(task.dueDate);
  next.setDate(next.getDate() + (task.recurrence === "daily" ? 1 : 7));
  const nextDate = next.toISOString().split("T")[0];
  const already = state.data.tasks.some(t => t.title === task.title && t.dueDate === nextDate && !t.done);
  if (already) return;
  state.data.tasks.unshift({
    ...task,
    id: uid(),
    done: false,
    status: "todo",
    dueDate: nextDate
  });
}

function updateDailyStreak() {
  const today = new Date().toDateString();
  if (!state.data.lastActiveDate) {
    state.data.lastActiveDate = today;
    state.data.streak = 1;
    return;
  }
  const last = new Date(state.data.lastActiveDate);
  const now = new Date(today);
  const diff = Math.floor((now - last) / (1000 * 60 * 60 * 24));
  if (diff === 0) return;
  state.data.streak = diff === 1 ? (state.data.streak || 0) + 1 : 1;
  state.data.lastActiveDate = today;
}

document.getElementById("startTimer").addEventListener("click", () => {
  if (state.timer.active) return;
  state.timer.active = true;
  state.timer.interval = setInterval(async () => {
    if (state.timer.remaining <= 0) {
      clearInterval(state.timer.interval);
      state.timer.active = false;
      state.timer.remaining = 25 * 60;
      updateTimerUi();
      await completePomodoro();
      return;
    }
    state.timer.remaining -= 1;
    updateTimerUi();
  }, 1000);
});

document.getElementById("pauseTimer").addEventListener("click", () => {
  clearInterval(state.timer.interval);
  state.timer.active = false;
});

document.getElementById("resetTimer").addEventListener("click", () => {
  clearInterval(state.timer.interval);
  state.timer.active = false;
  state.timer.remaining = 25 * 60;
  updateTimerUi();
});

document.getElementById("saveNotes").addEventListener("click", async () => {
  state.data.notes = document.getElementById("quickNotes").value;
  await saveData();
  alert("تم حفظ الملاحظات بنجاح.");
});

document.getElementById("syncBtn").addEventListener("click", async () => {
  await saveData();
  alert("تم حفظ جميع البيانات.");
});

document.getElementById("weeklyFocusTarget").addEventListener("change", async (e) => {
  state.data.weeklyFocusTarget = Number(e.target.value || 300);
  renderFocusTarget();
  await saveData();
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `timemaster-backup-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("importBtn").addEventListener("click", async () => {
  const file = document.getElementById("importFile").files[0];
  if (!file) return alert("اختر ملف JSON أولًا.");
  const text = await file.text();
  try {
    const parsed = JSON.parse(text);
    state.data = { ...state.data, ...parsed };
    hydrateTasks();
    renderAll();
    await saveData();
    alert("تم استيراد البيانات بنجاح.");
  } catch (err) {
    alert("ملف غير صالح.");
  }
});

function setupKanbanDnD() {
  document.querySelectorAll(".kanban-col").forEach(col => {
    col.addEventListener("dragover", (e) => e.preventDefault());
    col.addEventListener("drop", async () => {
      const dragging = document.querySelector(".kanban-card.dragging");
      if (!dragging) return;
      const task = state.data.tasks.find(t => t.id === dragging.dataset.id);
      if (!task) return;
      task.status = col.dataset.status;
      task.done = task.status === "done";
      renderAll();
      await saveData();
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const reveals = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -40px 0px", threshold: 0.1 });
  reveals.forEach(el => observer.observe(el));

  await loadData();
  updateTimerUi();
  setupKanbanDnD();
});

window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.checkHabit = checkHabit;
window.advanceGoal = advanceGoal;
window.toggleMenu = toggleMenu;
