(async function () {
  const app = document.getElementById("app");
  const data = await TimeMaster.load();
  app.innerHTML = TimeMaster.pageTemplate("matrix", "المصفوفة", "Eisenhower Matrix للأولويات", `
    <div class="panel"><div id="matrix" class="matrix-grid"></div></div>
  `);

  function quadrant(task) {
    const urgent = TimeMaster.isToday(task.dueDate);
    const important = task.priority === "high";
    if (urgent && important) return "do";
    if (!urgent && important) return "plan";
    if (urgent && !important) return "delegate";
    return "eliminate";
  }

  const labels = {
    do: "مهم + عاجل",
    plan: "مهم + غير عاجل",
    delegate: "عاجل + أقل أهمية",
    eliminate: "غير مهم + غير عاجل"
  };

  const boxes = { do: [], plan: [], delegate: [], eliminate: [] };
  data.tasks.filter(t => !t.done).forEach(t => boxes[quadrant(t)].push(t));

  document.getElementById("matrix").innerHTML = Object.keys(labels).map(key => `
    <div class="matrix-box">
      <h4>${labels[key]}</h4>
      <ul>${(boxes[key].map(t => `<li>${t.title}</li>`).join("") || "<li>لا يوجد</li>")}</ul>
    </div>
  `).join("");
})();
