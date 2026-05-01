(async function () {
  const app = document.getElementById("app");
  const data = await TimeMaster.load();
  app.innerHTML = TimeMaster.pageTemplate("habits", "العادات", '<i class="ri-heart-pulse-line"></i> نظام تتبع العادات مع سلسلة الإنجاز', `
    <div class="grid-2">
      <div class="panel">
        <h3><i class="ri-add-circle-line"></i> إضافة عادة جديدة</h3>
        <form id="habitForm" class="form-grid">
          <input id="habitName" required placeholder="اسم العادة (مثال: قراءة 20 دقيقة)">
          <select id="habitCategory">
            <option value="health"><i class="ri-run-line"></i> صحة</option>
            <option value="worship">عبادة</option>
            <option value="learning">تعلم</option>
            <option value="social">اجتماعي</option>
            <option value="other">أخرى</option>
          </select>
          <button class="btn-primary"><i class="ri-add-line"></i> إضافة عادة</button>
        </form>
      </div>
      <div class="panel" style="text-align:center;">
        <h3><i class="ri-fire-line"></i> سلسلة الإنجاز العامة</h3>
        <div class="streak-badge" style="font-size:1.5rem;margin:.5rem 0;"><i class="ri-fire-fill"></i> ${data.streak || 0} يوم</div>
        <p class="muted-note">${data.streak >= 7 ? "ممتاز! حافظ على هذا الثبات" : data.streak >= 3 ? "بداية رائعة، استمر!" : "ابدأ سلسلتك اليوم!"}</p>
        <div id="weekView" style="display:flex;gap:.4rem;justify-content:center;margin-top:.8rem;flex-wrap:wrap;"></div>
      </div>
    </div>
    <div class="panel"><div id="list" class="habit-list"></div></div>
  `);

  const categoryIcons = { health: '<i class="ri-run-line"></i>', worship: '<i class="ri-book-open-line"></i>', learning: '<i class="ri-graduation-cap-line"></i>', social: '<i class="ri-group-line"></i>', other: '<i class="ri-pushpin-line"></i>' };

  function render() {
    document.getElementById("list").innerHTML = data.habits.length === 0
      ? `<div class="muted-note" style="text-align:center;padding:2rem;">لا توجد عادات بعد. أضف أول عادة!</div>`
      : data.habits.map(h => {
        const today = new Date().toDateString();
        const doneToday = h.lastCheck === today;
        const icon = categoryIcons[h.category] || categoryIcons.other;
        return `
        <div class="habit-item" style="${doneToday ? 'border-right:4px solid var(--accent-green);opacity:.85;' : ''}">
          <div>
            <strong>${icon} ${h.name}</strong>
            <div class="task-meta">
              <small><i class="ri-fire-line"></i> ${h.streak || 0} يوم متواصل</small>
              ${doneToday ? '<small style="color:var(--accent-green);"><i class="ri-checkbox-circle-fill"></i> تم اليوم</small>' : ''}
            </div>
          </div>
          <div style="display:flex;gap:.4rem;">
            <button class="chip" data-id="${h.id}" ${doneToday ? 'disabled style="opacity:.5"' : ''}>${doneToday ? '<i class="ri-checkbox-circle-fill"></i>' : '<i class="ri-check-line"></i> تم اليوم'}</button>
            <button class="chip" data-del="${h.id}"><i class="ri-delete-bin-line"></i></button>
          </div>
        </div>
      `;
    }).join("");

    const weekView = document.getElementById("weekView");
    if (weekView) {
      const days = ["أحد", "اثن", "ثلا", "أربع", "خمي", "جمع", "سبت"];
      const today = new Date().getDay();
      weekView.innerHTML = days.map((d, i) => {
        const active = i <= today;
        return `<div style="width:36px;height:36px;border-radius:8px;display:grid;place-items:center;font-size:.7rem;font-weight:700;border:2px solid var(--ink);${active ? 'background:var(--accent-green);color:#fff;' : 'background:#fff;'}">${d}</div>`;
      }).join("");
    }
  }

  app.addEventListener("submit", async (e) => {
    if (e.target.id !== "habitForm") return;
    e.preventDefault();
    data.habits.push({ id: TimeMaster.uid(), name: document.getElementById("habitName").value.trim(), category: document.getElementById("habitCategory").value, streak: 0, lastCheck: null });
    e.target.reset(); render(); TimeMaster.toast("تم إضافة العادة"); await TimeMaster.save(data);
  });

  app.addEventListener("click", async (e) => {
    const btn = e.target.closest(".chip[data-id]");
    if (btn) {
      const habit = data.habits.find(h => h.id === btn.dataset.id);
      if (!habit) return;
      const today = new Date().toDateString();
      if (habit.lastCheck !== today) {
        habit.streak = (habit.streak || 0) + 1; habit.lastCheck = today;
        if (habit.streak % 7 === 0) TimeMaster.confetti();
        TimeMaster.toast(`${habit.name} — ${habit.streak} يوم متواصل!`);
        await TimeMaster.save(data); render();
      }
      return;
    }
    const del = e.target.closest(".chip[data-del]");
    if (del) { data.habits = data.habits.filter(h => h.id !== del.dataset.del); TimeMaster.toast("تم حذف العادة"); await TimeMaster.save(data); render(); }
  });

  render();
})();
