window.TimeMaster = (() => {
  const defaults = {
    tasks: [],
    habits: [],
    goals: [],
    notes: "",
    focusMinutes: 0,
    completedPomodoros: 0,
    weeklyFocusTarget: 300,
    streak: 0,
    lastActiveDate: null
  };

  async function api(action, payload = {}) {
    const res = await fetch("api.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload })
    });
    return res.json();
  }

  async function load() {
    const res = await api("getData");
    if (!res.ok) return { ...defaults };
    const data = { ...defaults, ...res.data };
    data.tasks = (data.tasks || []).map(task => ({
      status: "todo",
      recurrence: "none",
      estimate: 25,
      ...task
    }));
    updateStreak(data);
    return data;
  }

  async function save(data) {
    await api("saveData", { ...defaults, ...data });
  }

  function uid() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function isToday(value) {
    if (!value) return false;
    return new Date(value).toDateString() === new Date().toDateString();
  }

  function formatDate(value) {
    return value ? new Date(value).toLocaleDateString("ar-EG") : "بدون موعد";
  }

  function updateStreak(data) {
    const today = new Date().toDateString();
    if (!data.lastActiveDate) {
      data.lastActiveDate = today;
      data.streak = 1;
      return;
    }
    const last = new Date(data.lastActiveDate);
    const now = new Date(today);
    const diff = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    if (diff === 0) return;
    data.streak = diff === 1 ? (data.streak || 0) + 1 : 1;
    data.lastActiveDate = today;
  }

  // Icon helper
  const ic = {
    home: '<i class="ri-home-4-line"></i>',
    tasks: '<i class="ri-task-line"></i>',
    kanban: '<i class="ri-kanban-view"></i>',
    matrix: '<i class="ri-grid-line"></i>',
    focus: '<i class="ri-focus-3-line"></i>',
    habits: '<i class="ri-heart-pulse-line"></i>',
    goals: '<i class="ri-trophy-line"></i>',
    reports: '<i class="ri-bar-chart-box-line"></i>',
    backup: '<i class="ri-download-cloud-line"></i>',
    search: '<i class="ri-search-line"></i>',
    cmd: '<i class="ri-command-line"></i>',
  };

  function nav(activePath) {
    return `
      <nav>
        <a class="nav-logo" href="index.php">Time<span>Master</span></a>
        <ul class="nav-links">
          <li><a href="tasks.php" class="${activePath === "tasks" ? "active-link" : ""}">${ic.tasks} المهام</a></li>
          <li><a href="kanban.php" class="${activePath === "kanban" ? "active-link" : ""}">${ic.kanban} كانبان</a></li>
          <li><a href="matrix.php" class="${activePath === "matrix" ? "active-link" : ""}">${ic.matrix} المصفوفة</a></li>
          <li><a href="focus.php" class="${activePath === "focus" ? "active-link" : ""}">${ic.focus} التركيز</a></li>
          <li><a href="habits.php" class="${activePath === "habits" ? "active-link" : ""}">${ic.habits} العادات</a></li>
          <li><a href="goals.php" class="${activePath === "goals" ? "active-link" : ""}">${ic.goals} الأهداف</a></li>
          <li><a href="reports.php" class="${activePath === "reports" ? "active-link" : ""}">${ic.reports} التقارير</a></li>
        </ul>
        <a class="nav-cta" href="backup.php">${ic.backup} نسخ احتياطي</a>
        <div class="hamburger" onclick="document.getElementById('mobileMenu').classList.toggle('open')">
          <span></span><span></span><span></span>
        </div>
      </nav>
      <div id="mobileMenu" class="mobile-menu">
        <button class="mobile-close" onclick="this.parentElement.classList.remove('open')">✕</button>
        <a href="index.php">${ic.home} الرئيسية</a>
        <a href="tasks.php">${ic.tasks} المهام</a>
        <a href="kanban.php">${ic.kanban} كانبان</a>
        <a href="matrix.php">${ic.matrix} المصفوفة</a>
        <a href="focus.php">${ic.focus} التركيز</a>
        <a href="habits.php">${ic.habits} العادات</a>
        <a href="goals.php">${ic.goals} الأهداف</a>
        <a href="reports.php">${ic.reports} التقارير</a>
        <a href="backup.php">${ic.backup} النسخ الاحتياطي</a>
      </div>
    `;
  }

  function mobileBottomNav(activePath) {
    const items = [
      { path: "index", href: "index.php", icon: "ri-home-4-line", label: "الرئيسية" },
      { path: "tasks", href: "tasks.php", icon: "ri-task-line", label: "المهام" },
      { path: "focus", href: "focus.php", icon: "ri-focus-3-line", label: "التركيز" },
      { path: "habits", href: "habits.php", icon: "ri-heart-pulse-line", label: "العادات" },
      { path: "reports", href: "reports.php", icon: "ri-bar-chart-box-line", label: "التقارير" },
    ];
    return `<nav class="mobile-bottom-nav">${items.map(i =>
      `<a href="${i.href}" class="${activePath === i.path ? 'active' : ''}"><span class="nav-icon"><i class="${i.icon}"></i></span><span>${i.label}</span></a>`
    ).join("")}</nav>`;
  }

  function pageTemplate(activePath, title, subtitle, content) {
    return `
      ${nav(activePath)}
      <section class="section page-section">
        <div class="section-inner">
          <div class="section-tag">${title}</div>
          <h1 class="section-title">${subtitle}</h1>
          ${content}
        </div>
      </section>
      <footer>
        <a class="footer-logo" href="index.php">Time<span>Master</span></a>
        <span class="footer-copy">© 2026 TimeMaster Pro</span>
      </footer>
      ${mobileBottomNav(activePath)}
    `;
  }

  const routes = [
    { label: "الرئيسية", href: "index.php" },
    { label: "المهام الذكية", href: "tasks.php" },
    { label: "لوحة كانبان", href: "kanban.php" },
    { label: "مصفوفة الأولويات", href: "matrix.php" },
    { label: "التركيز والقرآن", href: "focus.php" },
    { label: "العادات", href: "habits.php" },
    { label: "الأهداف", href: "goals.php" },
    { label: "التقارير", href: "reports.php" },
    { label: "النسخ الاحتياطي", href: "backup.php" }
  ];

  function toast(message) {
    let host = document.getElementById("tmToastHost");
    if (!host) {
      host = document.createElement("div");
      host.id = "tmToastHost";
      host.className = "tm-toast-host";
      document.body.appendChild(host);
    }
    const item = document.createElement("div");
    item.className = "tm-toast";
    item.textContent = message;
    host.appendChild(item);
    setTimeout(() => item.classList.add("show"), 10);
    setTimeout(() => {
      item.classList.remove("show");
      setTimeout(() => item.remove(), 260);
    }, 2200);
  }

  function confetti() {
    const container = document.createElement("div");
    container.className = "confetti-container";
    document.body.appendChild(container);
    const colors = ["#e76f51", "#f4a261", "#ffde6b", "#2a9d8f", "#264653", "#e9c46a"];
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "%";
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = Math.random() * 1.5 + "s";
      piece.style.animationDuration = (2 + Math.random() * 2) + "s";
      piece.style.width = (6 + Math.random() * 8) + "px";
      piece.style.height = (6 + Math.random() * 8) + "px";
      piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      container.appendChild(piece);
    }
    setTimeout(() => container.remove(), 4000);
  }

  function createQuickPalette() {
    if (document.getElementById("tmPalette")) return;
    const palette = document.createElement("div");
    palette.id = "tmPalette";
    palette.className = "tm-palette";
    palette.innerHTML = `
      <div class="tm-palette-card">
        <div class="tm-palette-head">
          <input id="tmPaletteInput" type="search" placeholder="اكتب اسم الصفحة...">
          <button id="tmPaletteClose" class="chip" type="button">إغلاق</button>
        </div>
        <div id="tmPaletteList" class="tm-palette-list"></div>
      </div>
    `;
    document.body.appendChild(palette);
    const list = palette.querySelector("#tmPaletteList");
    const input = palette.querySelector("#tmPaletteInput");
    const close = palette.querySelector("#tmPaletteClose");

    function renderList(query = "") {
      const q = query.trim().toLowerCase();
      const filtered = routes.filter(r => r.label.toLowerCase().includes(q));
      list.innerHTML = filtered.map(r => `<a href="${r.href}" class="tm-palette-item">${r.label}</a>`).join("") || `<div class="tm-palette-empty">لا توجد نتيجة</div>`;
    }
    function openPalette() { palette.classList.add("open"); renderList(""); input.value = ""; input.focus(); }
    function closePalette() { palette.classList.remove("open"); }

    input.addEventListener("input", () => renderList(input.value));
    close.addEventListener("click", closePalette);
    palette.addEventListener("click", (e) => { if (e.target === palette) closePalette(); });
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); palette.classList.contains("open") ? closePalette() : openPalette(); }
      if (e.key === "Escape" && palette.classList.contains("open")) closePalette();
    });
  }

  function mountGlobalUi() {
    if (!document.getElementById("tmFabStack")) {
      const stack = document.createElement("div");
      stack.id = "tmFabStack";
      stack.className = "tm-fab-stack";
      stack.innerHTML = `<button id="tmCmdBtn" class="tm-fab-btn" type="button" title="بحث سريع Ctrl+K"><i class="ri-command-line"></i></button>`;
      document.body.appendChild(stack);
      stack.querySelector("#tmCmdBtn").addEventListener("click", () => {
        const pal = document.getElementById("tmPalette");
        if (pal) pal.classList.add("open");
        document.getElementById("tmPaletteInput")?.focus();
      });
    }
    createQuickPalette();
  }

  function activateReveal(root = document) {
    const reveals = root.querySelectorAll(".reveal");
    if (!reveals.length) return;
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("active"); obs.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -40px 0px", threshold: 0.1 });
    reveals.forEach((el) => observer.observe(el));
  }

  function initScrollNav() {
    window.addEventListener("scroll", () => {
      document.querySelector("nav")?.classList.toggle("scrolled", window.scrollY > 30);
    });
  }

  document.addEventListener("DOMContentLoaded", () => activateReveal(document));
  document.addEventListener("DOMContentLoaded", () => { mountGlobalUi(); initScrollNav(); });

  return { load, save, uid, isToday, formatDate, pageTemplate, activateReveal, toast, confetti };
})();
