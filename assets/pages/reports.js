(async function () {
  const app = document.getElementById("app");
  const data = await TimeMaster.load();

  const done = data.tasks.filter(t => t.done).length;
  const pending = data.tasks.length - done;
  const completion = data.tasks.length ? Math.round((done / data.tasks.length) * 100) : 0;
  const highPending = data.tasks.filter(t => t.priority === "high" && !t.done).length;
  const medPending = data.tasks.filter(t => t.priority === "medium" && !t.done).length;
  const lowPending = data.tasks.filter(t => t.priority === "low" && !t.done).length;
  const habitsAvg = data.habits.length ? Math.round(data.habits.reduce((a, h) => a + (h.streak || 0), 0) / data.habits.length) : 0;
  const goalsCompleted = data.goals.filter(g => g.current >= g.target).length;
  const planUtilization = data.dayBlueprint?.utilization || 0;
  const focusScore = Math.min(100, Math.round((data.focusMinutes / Math.max(1, data.weeklyFocusTarget || 300)) * 100));
  const consistencyScore = Math.min(100, (data.streak || 0) * 8);
  const executionScore = Math.round((completion * 0.35) + (focusScore * 0.3) + (consistencyScore * 0.2) + (Math.min(100, habitsAvg * 10) * 0.15));

  function productivityDNA() {
    if (focusScore >= 70 && completion >= 70) return { type: "Executor DNA", desc: "منجز عميق — تركيزك وإنتاجيتك استثنائيان", icon: "ri-flashlight-fill" };
    if (highPending <= 2 && completion >= 60) return { type: "Strategist DNA", desc: "ترتيب ممتاز — أولوياتك مضبوطة", icon: "ri-brain-line" };
    if (data.streak >= 7 && habitsAvg >= 4) return { type: "Consistency DNA", desc: "ثبات عالي — قوة العادات", icon: "ri-fire-fill" };
    if (planUtilization >= 70) return { type: "Planner DNA", desc: "خططك فعّالة وعملية", icon: "ri-calendar-check-fill" };
    return { type: "Builder DNA", desc: "تحتاج ضبط روتين أعلى — ابدأ بعادة واحدة", icon: "ri-hammer-line" };
  }

  const dna = productivityDNA();
  const grade = executionScore >= 90 ? "A+" : executionScore >= 80 ? "A" : executionScore >= 70 ? "B+" : executionScore >= 60 ? "B" : executionScore >= 50 ? "C" : "D";

  app.innerHTML = TimeMaster.pageTemplate("reports", "التقارير", '<i class="ri-bar-chart-box-line"></i> تحليلات إنتاجية متقدمة', `
    <div class="quote-card" style="margin-bottom:1.2rem;">
      <div style="font-size:2rem;"><i class="${dna.icon}"></i></div>
      <div class="quote-text">${dna.type}</div>
      <div class="quote-author">${dna.desc}</div>
    </div>

    <div class="stats-grid" style="margin-bottom:1.2rem;">
      <div class="stat-card"><h3><i class="ri-medal-line"></i> التقييم</h3><p>${grade}</p></div>
      <div class="stat-card"><h3><i class="ri-speed-line"></i> Execution</h3><p>${executionScore}</p></div>
      <div class="stat-card"><h3><i class="ri-fire-line"></i> Streak</h3><p>${data.streak || 0}</p></div>
      <div class="stat-card"><h3><i class="ri-focus-3-line"></i> بومودورو</h3><p>${data.completedPomodoros}</p></div>
    </div>

    <div class="grid-2">
      <div class="panel">
        <h3><i class="ri-checkbox-circle-line"></i> إنجاز المهام</h3>
        <p style="font-size:1.3rem;font-weight:900;">${done} مكتمل / ${pending} متبقي</p>
        <div class="bar" style="margin-top:.5rem;"><span style="width:${completion}%"></span></div>
        <div class="task-meta" style="margin-top:.5rem;">
          <small><i class="ri-error-warning-fill" style="color:#c0392b"></i> عالية: ${highPending}</small>
          <small><i class="ri-alert-fill" style="color:#e67e22"></i> متوسطة: ${medPending}</small>
          <small><i class="ri-information-fill" style="color:#16a085"></i> منخفضة: ${lowPending}</small>
        </div>
      </div>
      <div class="panel">
        <h3><i class="ri-focus-3-line"></i> التركيز</h3>
        <p style="font-size:1.3rem;font-weight:900;">${data.focusMinutes} دقيقة</p>
        <div class="bar" style="margin-top:.5rem;"><span style="width:${focusScore}%"></span></div>
        <p class="muted-note">${focusScore}% من هدفك الأسبوعي (${data.weeklyFocusTarget || 300} دقيقة)</p>
      </div>
      <div class="panel">
        <h3><i class="ri-heart-pulse-line"></i> العادات</h3>
        <p style="font-size:1.3rem;font-weight:900;">${data.habits.length} عادة | متوسط ${habitsAvg} يوم</p>
        ${data.habits.slice(0, 5).map(h => `<div style="display:flex;justify-content:space-between;margin-top:.3rem;"><small>${h.name}</small><span class="badge">${h.streak || 0} يوم</span></div>`).join("")}
      </div>
      <div class="panel">
        <h3><i class="ri-trophy-line"></i> الأهداف</h3>
        <p style="font-size:1.3rem;font-weight:900;">${goalsCompleted}/${data.goals.length} محقق</p>
        <div class="bar" style="margin-top:.5rem;"><span style="width:${data.goals.length ? Math.round((goalsCompleted / data.goals.length) * 100) : 0}%"></span></div>
      </div>
      <div class="panel">
        <h3><i class="ri-calendar-schedule-line"></i> استغلال خطة اليوم</h3>
        <p style="font-size:1.3rem;font-weight:900;">${planUtilization}%</p>
        <div class="bar" style="margin-top:.5rem;"><span style="width:${planUtilization}%"></span></div>
      </div>
      <div class="panel">
        <h3><i class="ri-lightbulb-line"></i> نصيحة ذكية</h3>
        <p style="line-height:1.8;">${executionScore >= 75 ? "أداء قوي! حافظ على نفس الإيقاع واستمر في رفع مستوى تركيزك." : executionScore >= 50 ? "بداية جيدة. ركز على إنهاء المهام عالية الأولوية أولاً." : "ابدأ بمهمة واحدة اليوم، وجلسة تركيز قصيرة. الاستمرارية أهم من الكمية."}</p>
      </div>
    </div>
  `);

  TimeMaster.activateReveal(app);
})();
