(async function () {
  const data = await TimeMaster.load();

  // ===== Motivational Quotes =====
  const quotes = [
    { text: "النجاح ليس نهائيًا، والفشل ليس قاتلًا. الشجاعة للاستمرار هي ما يهم.", author: "ونستون تشرشل" },
    { text: "لا تنتظر الفرصة، بل اصنعها.", author: "جورج برنارد شو" },
    { text: "الطريقة الوحيدة للقيام بعمل عظيم هي أن تحب ما تفعله.", author: "ستيف جوبز" },
    { text: "كل دقيقة تقضيها في التخطيط توفر عليك عشر دقائق في التنفيذ.", author: "بريان تريسي" },
    { text: "ليس المهم أن تكون مشغولًا، بل المهم فيمَ أنت مشغول.", author: "هنري ثورو" },
    { text: "ابدأ من حيث أنت، استخدم ما عندك، افعل ما تستطيع.", author: "آرثر آش" },
    { text: "إن الله لا يضيع أجر من أحسن عملًا.", author: "القرآن الكريم" },
    { text: "التركيز هو فن تجاهل كل ما لا يهم.", author: "حكمة" },
    { text: "العادات الصغيرة تصنع فروقًا كبيرة.", author: "جيمس كلير" },
    { text: "خطط ليومك وإلا سيخطط لك الآخرون.", author: "جيم رون" },
    { text: "الوقت أثمن مورد لديك، لا يمكنك شراؤه أو توفيره.", author: "بيتر دراكر" },
    { text: "من لم يشكر القليل لم يشكر الكثير.", author: "حديث نبوي" },
  ];
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  const quoteText = document.getElementById("quoteText");
  const quoteAuthor = document.getElementById("quoteAuthor");
  if (quoteText && quoteAuthor) {
    quoteText.textContent = q.text;
    quoteAuthor.textContent = `— ${q.author}`;
  }

  // ===== Animated Counter =====
  function animateCounter(el, target, duration = 1200) {
    if (!el) return;
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const totalTasks = data.tasks.length;
  const doneTasks = data.tasks.filter(t => t.done).length;
  const focusMin = data.focusMinutes || 0;
  const streak = data.streak || 0;

  animateCounter(document.getElementById("statTasks"), totalTasks);
  animateCounter(document.getElementById("statDone"), doneTasks);
  animateCounter(document.getElementById("statFocus"), focusMin);
  animateCounter(document.getElementById("statStreak"), streak);

  // ===== Productivity Score =====
  const completion = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const focusTarget = data.weeklyFocusTarget || 300;
  const focusScore = Math.min(100, Math.round((focusMin / focusTarget) * 100));
  const streakScore = Math.min(100, streak * 10);
  const habitAvg = data.habits.length
    ? Math.round(data.habits.reduce((a, h) => a + (h.streak || 0), 0) / data.habits.length * 10)
    : 0;
  const prodScore = Math.round(completion * 0.35 + focusScore * 0.3 + streakScore * 0.2 + Math.min(100, habitAvg) * 0.15);

  animateCounter(document.getElementById("productivityScore"), prodScore, 1800);

  const prodBar = document.getElementById("productivityBar");
  const prodLabel = document.getElementById("productivityLabel");
  if (prodBar) setTimeout(() => { prodBar.style.width = prodScore + "%"; }, 300);
  if (prodLabel) {
    if (prodScore >= 80) prodLabel.textContent = "أداء استثنائي! استمر بنفس القوة";
    else if (prodScore >= 60) prodLabel.textContent = "أداء جيد، ركز أكثر للوصول للقمة";
    else if (prodScore >= 35) prodLabel.textContent = "بداية طيبة، حافظ على الاستمرارية";
    else prodLabel.textContent = "ابدأ يومك بمهمة واحدة وستنطلق!";
  }

  // ===== Nav scroll effect =====
  window.addEventListener("scroll", () => {
    document.querySelector("nav")?.classList.toggle("scrolled", window.scrollY > 30);
  });
})();
