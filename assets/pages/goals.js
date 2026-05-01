(async function () {
  const app = document.getElementById("app");
  const data = await TimeMaster.load();
  app.innerHTML = TimeMaster.pageTemplate("goals", "الأهداف", '<i class="ri-trophy-line"></i> SMART Goals مع قياس تقدم', `
    <div class="grid-2">
      <div class="panel">
        <h3><i class="ri-add-circle-line"></i> إضافة هدف جديد</h3>
        <form id="goalForm" class="form-grid">
          <input id="title" required placeholder="عنوان الهدف (مثال: قراءة 12 كتاب)">
          <input id="target" required type="number" min="1" placeholder="القيمة المستهدفة">
          <input id="current" type="number" min="0" value="0" placeholder="المحقق حاليًا">
          <input id="deadline" type="date">
          <button class="btn-primary"><i class="ri-add-line"></i> إضافة الهدف</button>
        </form>
      </div>
      <div class="panel" style="text-align:center;">
        <h3><i class="ri-pie-chart-line"></i> ملخص الأهداف</h3>
        <div id="goalsSummary"></div>
      </div>
    </div>
    <div class="panel"><div id="list" class="goals-list"></div></div>
  `);

  function render() {
    const completed = data.goals.filter(g => g.current >= g.target).length;
    const total = data.goals.length;
    const summaryEl = document.getElementById("goalsSummary");
    if (summaryEl) {
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      summaryEl.innerHTML = `
        <div style="font-size:2.5rem;font-weight:900;background:var(--gradient-hero);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${completed}/${total}</div>
        <p class="muted-note">${completed === total && total > 0 ? '<i class="ri-trophy-fill"></i> أحسنت! كل أهدافك محققة' : `${pct}% من أهدافك محققة`}</p>
        <div class="bar" style="margin-top:.5rem;"><span style="width:${pct}%"></span></div>
      `;
    }

    document.getElementById("list").innerHTML = data.goals.length === 0
      ? `<div class="muted-note" style="text-align:center;padding:2rem;">لا توجد أهداف بعد. أضف أول هدف!</div>`
      : data.goals.map(g => {
        const p = Math.min(100, Math.round((g.current / g.target) * 100));
        const isComplete = g.current >= g.target;
        const deadlineStr = g.deadline ? TimeMaster.formatDate(g.deadline) : "";
        return `
        <div class="goal-item" style="${isComplete ? 'border-right:4px solid var(--accent-green);' : ''}">
          <div style="flex:1;">
            <strong>${isComplete ? '<i class="ri-trophy-fill" style="color:var(--accent-green)"></i>' : '<i class="ri-crosshair-2-line"></i>'} ${g.title}</strong>
            <div class="task-meta">
              <small><i class="ri-bar-chart-line"></i> ${g.current}/${g.target} (${p}%)</small>
              ${deadlineStr ? `<small><i class="ri-calendar-line"></i> ${deadlineStr}</small>` : ""}
            </div>
            <div class="bar" style="margin-top:.4rem;"><span style="width:${p}%"></span></div>
          </div>
          <div style="display:flex;gap:.3rem;">
            <button class="chip" data-id="${g.id}" data-inc="1">+1</button>
            <button class="chip" data-id="${g.id}" data-inc="5">+5</button>
            <button class="chip" data-del="${g.id}"><i class="ri-delete-bin-line"></i></button>
          </div>
        </div>
      `;
    }).join("");
  }

  app.addEventListener("submit", async (e) => {
    if (e.target.id !== "goalForm") return;
    e.preventDefault();
    data.goals.unshift({ id: TimeMaster.uid(), title: document.getElementById("title").value.trim(), target: Number(document.getElementById("target").value), current: Number(document.getElementById("current").value || 0), deadline: document.getElementById("deadline").value || null });
    e.target.reset(); render(); TimeMaster.toast("تم إضافة الهدف"); await TimeMaster.save(data);
  });

  app.addEventListener("click", async (e) => {
    const inc = e.target.closest(".chip[data-inc]");
    if (inc) {
      const g = data.goals.find(x => x.id === inc.dataset.id); if (!g) return;
      const before = g.current < g.target;
      g.current += Number(inc.dataset.inc);
      if (before && g.current >= g.target) { TimeMaster.confetti(); TimeMaster.toast("تهانينا! حققت الهدف!"); }
      else TimeMaster.toast(`+${inc.dataset.inc} — الآن ${g.current}/${g.target}`);
      render(); await TimeMaster.save(data); return;
    }
    const del = e.target.closest(".chip[data-del]");
    if (del) { data.goals = data.goals.filter(x => x.id !== del.dataset.del); TimeMaster.toast("تم حذف الهدف"); render(); await TimeMaster.save(data); }
  });

  render();
})();
