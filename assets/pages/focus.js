(async function () {
  const app = document.getElementById("app");
  const data = await TimeMaster.load();
  let sessionMinutes = Number(localStorage.getItem("tm_session_minutes") || 25);
  let breakMinutes = Number(localStorage.getItem("tm_break_minutes") || 5);
  let distractionCount = Number(localStorage.getItem("tm_distractions") || 0);
  let energyLevel = Number(localStorage.getItem("tm_energy") || 3);
  const timer = { remain: sessionMinutes * 60, active: false, interval: null, mode: "focus" };

  app.innerHTML = TimeMaster.pageTemplate("focus", "التركيز", "Pomodoro احترافي + هدف أسبوعي", `
    <div class="grid-2">
      <div class="panel center">
        <div id="timer" class="timer-value">25:00</div>
        <div class="grid-2">
          <div>
            <label>مدة جلسة التركيز (دقيقة)</label>
            <input id="sessionMinutes" type="number" min="5" max="180" value="${sessionMinutes}">
          </div>
          <div>
            <label>مدة الاستراحة (دقيقة)</label>
            <input id="breakMinutes" type="number" min="1" max="60" value="${breakMinutes}">
          </div>
        </div>
        <div class="timer-controls">
          <button class="btn-primary" id="start">تشغيل</button>
          <button class="btn-secondary" id="pause">إيقاف</button>
          <button class="btn-secondary" id="reset">إعادة</button>
        </div>
        <div class="timer-controls">
          <button class="chip" id="markDistraction" type="button">سجل تشتت</button>
          <button class="chip" id="clearDistraction" type="button">تصفير التشتت</button>
        </div>
        <small id="purityScore">صفاء التركيز: 100%</small>
        <small id="timerModeLabel">الوضع الحالي: تركيز</small>
      </div>
      <div class="panel">
        <label>الهدف الأسبوعي بالدقائق</label>
        <input type="number" id="target" min="25" step="25" value="${data.weeklyFocusTarget}">
        <label style="margin-top:.8rem;display:block;">مستوى الطاقة الحالي (1-5)</label>
        <input type="range" id="energyLevel" min="1" max="5" step="1" value="${energyLevel}">
        <small id="coachHint">المدرب الذكي: جاهز لضبط الجلسة تلقائيًا</small>
        <div id="progress" class="progress-wrap"></div>
      </div>
    </div>
    <div class="panel">
      <h3>مشغل القرآن في الخلفية</h3>
      <div class="grid-2">
        <div>
          <label>بحث ذكي عن القارئ (يتحمل الأخطاء)</label>
          <input id="reciterSearch" type="search" placeholder="مثال: معيقلي / معقلي / المعيقلى">
          <small id="readerSearchHint">اكتب اسم القارئ حتى لو فيه خطأ بسيط</small>
        </div>
        <div>
          <label>اختر القارئ / الرواية</label>
          <select id="quranReader"></select>
        </div>
      </div>
      <div class="grid-2">
        <div>
          <label>اختر السورة</label>
          <select id="quranSurah"></select>
        </div>
        <div>
          <label>حجم خط القراءة</label>
          <input id="quranFontSize" type="range" min="20" max="44" step="1" value="30">
        </div>
      </div>
      <div class="grid-2">
        <div>
          <label>مستوى الصوت</label>
          <input id="quranVolume" type="range" min="0" max="1" step="0.05" value="0.4">
        </div>
        <div>
          <label>تكرار تلقائي</label>
          <select id="quranLoop">
            <option value="off">بدون تكرار</option>
            <option value="surah">تكرار السورة</option>
            <option value="next">الانتقال للسورة التالية</option>
          </select>
        </div>
      </div>
      <div class="tm-audio-player">
        <div class="tm-audio-controls">
          <button id="playQuran" class="btn-primary btn-icon"><i class="ri-play-fill"></i></button>
          <button id="pauseQuran" class="btn-secondary btn-icon" style="display:none;"><i class="ri-pause-fill"></i></button>
          <button id="nextQuran" class="btn-secondary btn-icon"><i class="ri-skip-forward-fill"></i></button>
          <button id="toggleReadMode" class="btn-secondary btn-icon" title="وضع القراءة"><i class="ri-book-open-fill"></i></button>
        </div>
        <div class="tm-audio-progress">
          <span id="audioCurrent">00:00</span>
          <input type="range" id="audioSeek" min="0" max="100" value="0">
          <span id="audioDuration">00:00</span>
        </div>
      </div>
      <audio id="quranPlayer" preload="auto" style="display:none;"></audio>
      <div id="surahReaderWrap" class="surah-reader-wrap">
        <div class="surah-reader-head">
          <strong id="surahTitle">نص السورة</strong>
          <small id="surahMeta"></small>
        </div>
        <div id="surahText" class="surah-text">جاري تحميل نص السورة...</div>
      </div>
    </div>
  `);

  function paint() {
    const mm = String(Math.floor(timer.remain / 60)).padStart(2, "0");
    const ss = String(timer.remain % 60).padStart(2, "0");
    document.getElementById("timer").textContent = `${mm}:${ss}`;
    document.getElementById("timerModeLabel").textContent = `الوضع الحالي: ${timer.mode === "focus" ? "تركيز" : "استراحة"}`;
    const target = Number(data.weeklyFocusTarget || 300);
    const p = Math.min(100, Math.round((data.focusMinutes / target) * 100));
    const purity = Math.max(10, Math.round(100 - distractionCount * 7));
    document.getElementById("progress").innerHTML = `<div>${data.focusMinutes} / ${target} (${p}%)</div><div class="bar"><span style="width:${p}%"></span></div>`;
    document.getElementById("purityScore").textContent = `صفاء التركيز: ${purity}% (التشتت: ${distractionCount})`;
  }

  function readCustomDurations() {
    sessionMinutes = Math.max(5, Number(document.getElementById("sessionMinutes").value || 25));
    breakMinutes = Math.max(1, Number(document.getElementById("breakMinutes").value || 5));
    localStorage.setItem("tm_session_minutes", String(sessionMinutes));
    localStorage.setItem("tm_break_minutes", String(breakMinutes));
  }

  document.getElementById("start").onclick = () => {
    if (timer.active) return;
    readCustomDurations();
    if (timer.remain <= 0) {
      timer.remain = (timer.mode === "focus" ? sessionMinutes : breakMinutes) * 60;
    }
    timer.active = true;
    timer.interval = setInterval(async () => {
      if (timer.remain <= 0) {
        clearInterval(timer.interval);
        timer.active = false;
        if (timer.mode === "focus") {
          data.completedPomodoros += 1;
          data.focusMinutes += sessionMinutes;
          timer.mode = "break";
          timer.remain = breakMinutes * 60;
        } else {
          timer.mode = "focus";
          timer.remain = sessionMinutes * 60;
        }
        await TimeMaster.save(data);
        paint();
        return;
      }
      timer.remain -= 1;
      paint();
    }, 1000);
  };
  document.getElementById("pause").onclick = () => { clearInterval(timer.interval); timer.active = false; };
  document.getElementById("reset").onclick = () => {
    clearInterval(timer.interval);
    timer.active = false;
    readCustomDurations();
    timer.mode = "focus";
    timer.remain = sessionMinutes * 60;
    paint();
  };
  document.getElementById("sessionMinutes").onchange = () => {
    readCustomDurations();
    if (!timer.active && timer.mode === "focus") {
      timer.remain = sessionMinutes * 60;
      paint();
    }
  };
  document.getElementById("breakMinutes").onchange = () => {
    readCustomDurations();
    if (!timer.active && timer.mode === "break") {
      timer.remain = breakMinutes * 60;
      paint();
    }
  };
  document.getElementById("target").onchange = async (e) => {
    data.weeklyFocusTarget = Number(e.target.value || 300);
    paint();
    await TimeMaster.save(data);
  };
  document.getElementById("energyLevel").oninput = (e) => {
    energyLevel = Number(e.target.value || 3);
    localStorage.setItem("tm_energy", String(energyLevel));
  };

  function applyAdaptiveCoach() {
    const hint = document.getElementById("coachHint");
    if (energyLevel <= 2) {
      sessionMinutes = Math.max(15, sessionMinutes - 5);
      breakMinutes = Math.min(15, breakMinutes + 1);
      hint.textContent = "المدرب الذكي: طاقتك منخفضة، تم تقليل الجلسة قليلًا.";
    } else if (energyLevel >= 4 && distractionCount <= 2) {
      sessionMinutes = Math.min(90, sessionMinutes + 5);
      hint.textContent = "المدرب الذكي: أداؤك ممتاز، تم زيادة مدة الجلسة.";
    } else {
      hint.textContent = "المدرب الذكي: الإعداد الحالي مناسب.";
    }
    document.getElementById("sessionMinutes").value = sessionMinutes;
    document.getElementById("breakMinutes").value = breakMinutes;
    localStorage.setItem("tm_session_minutes", String(sessionMinutes));
    localStorage.setItem("tm_break_minutes", String(breakMinutes));
  }

  document.getElementById("markDistraction").onclick = () => {
    distractionCount += 1;
    localStorage.setItem("tm_distractions", String(distractionCount));
    paint();
  };
  document.getElementById("clearDistraction").onclick = () => {
    distractionCount = 0;
    localStorage.setItem("tm_distractions", "0");
    paint();
  };

  const quranPlayer = document.getElementById("quranPlayer");
  const reciterSearch = document.getElementById("reciterSearch");
  const readerSearchHint = document.getElementById("readerSearchHint");
  const quranReader = document.getElementById("quranReader");
  const quranSurah = document.getElementById("quranSurah");
  const quranFontSize = document.getElementById("quranFontSize");
  const quranVolume = document.getElementById("quranVolume");
  const quranLoop = document.getElementById("quranLoop");
  const surahText = document.getElementById("surahText");
  const surahTitle = document.getElementById("surahTitle");
  const surahMeta = document.getElementById("surahMeta");
  const surahReaderWrap = document.getElementById("surahReaderWrap");
  const toggleReadModeBtn = document.getElementById("toggleReadMode");
  let readers = [];
  let displayedReaders = [];
  let suwar = [];

  function pad3(num) {
    return String(num).padStart(3, "0");
  }

  function buildTrackUrl() {
    const selected = displayedReaders.find(r => r.id === quranReader.value) || readers.find(r => r.id === quranReader.value);
    const surahId = Number(quranSurah.value || 1);
    if (!selected) return "";
    return `${selected.server}${pad3(surahId)}.mp3`;
  }

  function normalizeArabic(str) {
    return (str || "")
      .toLowerCase()
      .replace(/[\u064B-\u065F]/g, "")
      .replace(/[إأآا]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/ؤ/g, "و")
      .replace(/ئ/g, "ي")
      .replace(/\s+/g, " ")
      .trim();
  }

  function levenshtein(a, b) {
    const m = a.length;
    const n = b.length;
    if (!m) return n;
    if (!n) return m;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i += 1) dp[i][0] = i;
    for (let j = 0; j <= n; j += 1) dp[0][j] = j;
    for (let i = 1; i <= m; i += 1) {
      for (let j = 1; j <= n; j += 1) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[m][n];
  }

  function scoreReader(query, reader) {
    const q = normalizeArabic(query);
    const name = normalizeArabic(reader.reciterName);
    if (!q) return 0;
    if (name.includes(q)) return 100 - Math.abs(name.length - q.length);
    const tokens = name.split(" ");
    const bestToken = tokens.reduce((best, token) => {
      const dist = levenshtein(q, token);
      return Math.min(best, dist);
    }, Number.MAX_SAFE_INTEGER);
    const fullDist = levenshtein(q, name.slice(0, Math.max(q.length, 3)));
    const dist = Math.min(bestToken, fullDist);
    return 80 - dist * 10;
  }

  function renderReaderOptions(list, keepSelection = true) {
    const previous = keepSelection ? quranReader.value : "";
    displayedReaders = list;
    quranReader.innerHTML = list.map(r => `<option value="${r.id}">${r.reciterName} — ${r.moshafName}</option>`).join("");
    if (previous && list.some(r => r.id === previous)) {
      quranReader.value = previous;
    }
    refreshSurahOptions();
  }

  function applyReaderSearch(value) {
    const query = value.trim();
    if (!query) {
      renderReaderOptions(readers, true);
      readerSearchHint.textContent = `تم عرض كل القراء (${readers.length})`;
      return;
    }
    const ranked = readers
      .map(r => ({ reader: r, score: scoreReader(query, r) }))
      .filter(item => item.score > 30)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)
      .map(item => item.reader);
    renderReaderOptions(ranked, false);
    readerSearchHint.textContent = ranked.length
      ? `نتائج مطابقة ذكية: ${ranked.length}`
      : "لا توجد نتيجة مطابقة، جرّب كلمة أقرب لاسم القارئ";
  }

  function refreshSurahOptions() {
    const selected = displayedReaders.find(r => r.id === quranReader.value) || readers.find(r => r.id === quranReader.value);
    if (!selected) return;
    const allowed = new Set(selected.surahList || []);
    const prev = quranSurah.value;
    quranSurah.innerHTML = suwar
      .filter(s => allowed.has(Number(s.id)))
      .map(s => `<option value="${s.id}">${s.id}. ${s.name}</option>`)
      .join("");
    if (prev && Array.from(quranSurah.options).some(o => o.value === prev)) {
      quranSurah.value = prev;
    }
  }

  async function loadSurahText() {
    const surahId = Number(quranSurah.value || 1);
    surahText.textContent = "جاري تحميل النص...";
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/quran-uthmani`).then(r => r.json());
      if (res.code !== 200 || !res.data) {
        surahText.textContent = "تعذر تحميل نص السورة حاليًا.";
        return;
      }
      const ayahs = res.data.ayahs || [];
      surahTitle.textContent = `سورة ${res.data.name}`;
      surahMeta.textContent = `عدد الآيات: ${ayahs.length}`;
      surahText.innerHTML = ayahs.map(a => `<span class="ayah">${a.text} <span class="ayah-num">﴿${a.numberInSurah}﴾</span></span>`).join(" ");
    } catch (error) {
      surahText.textContent = "حدث خطأ أثناء تحميل نص السورة.";
    }
  }

  async function loadQuranData() {
    try {
      const [rRes, sRes] = await Promise.all([
        fetch("https://mp3quran.net/api/v3/reciters?language=ar").then(r => r.json()),
        fetch("https://mp3quran.net/api/v3/suwar?language=ar").then(r => r.json())
      ]);
      
      if (!rRes.reciters || !sRes.suwar) {
        alert("تعذر تحميل بيانات القرآن من API. تأكد من اتصال الإنترنت.");
        return;
      }
      
      suwar = sRes.suwar.map(s => ({ id: s.id, name: s.name }));
      
      const items = [];
      rRes.reciters.forEach(reciter => {
        const moshafList = reciter.moshaf || [];
        moshafList.forEach(moshaf => {
          let server = (moshaf.server || "").trim();
          if (!server) return;
          if (!server.endsWith("/")) server += "/";
          let surahList = (moshaf.surah_list || "").split(",").filter(x => x).map(Number);
          if (!surahList.length) surahList = Array.from({length: 114}, (_, i) => i + 1);
          
          items.push({
            id: reciter.id + ":" + moshaf.id,
            reciterId: reciter.id,
            reciterName: reciter.name || "قارئ",
            moshafName: moshaf.name || "مصحف",
            server: server,
            surahList: surahList
          });
        });
      });
      
      readers = items;
      renderReaderOptions(readers, false);
      readerSearchHint.textContent = `تم تحميل ${readers.length} قارئ/رواية`;
      quranPlayer.src = buildTrackUrl();
      await loadSurahText();
    } catch(err) {
      alert("حدث خطأ في الاتصال بخوادم القرآن الكريم.");
    }
  }

  quranReader.onchange = () => {
    refreshSurahOptions();
    quranPlayer.src = buildTrackUrl();
    loadSurahText();
  };
  quranSurah.onchange = () => {
    quranPlayer.src = buildTrackUrl();
    loadSurahText();
    if (!quranPlayer.paused) quranPlayer.play().catch(() => {});
  };
  reciterSearch.oninput = () => applyReaderSearch(reciterSearch.value);
  quranFontSize.oninput = () => {
    surahText.style.fontSize = `${quranFontSize.value}px`;
  };
  toggleReadModeBtn.onclick = () => {
    surahReaderWrap.classList.toggle("read-mode");
  };

  quranPlayer.volume = Number(quranVolume.value);
  quranVolume.oninput = () => {
    quranPlayer.volume = Number(quranVolume.value);
  };
  
  const playBtn = document.getElementById("playQuran");
  const pauseBtn = document.getElementById("pauseQuran");
  const nextBtn = document.getElementById("nextQuran");
  const audioSeek = document.getElementById("audioSeek");
  const audioCurrent = document.getElementById("audioCurrent");
  const audioDuration = document.getElementById("audioDuration");

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  quranPlayer.addEventListener("loadedmetadata", () => {
    audioDuration.textContent = formatTime(quranPlayer.duration);
  });

  quranPlayer.addEventListener("timeupdate", () => {
    if (!quranPlayer.duration) return;
    audioCurrent.textContent = formatTime(quranPlayer.currentTime);
    const progress = (quranPlayer.currentTime / quranPlayer.duration) * 100;
    audioSeek.value = progress;
  });

  audioSeek.addEventListener("input", () => {
    if (!quranPlayer.duration) return;
    const seekTo = (audioSeek.value / 100) * quranPlayer.duration;
    quranPlayer.currentTime = seekTo;
  });

  quranPlayer.addEventListener("play", () => {
    playBtn.style.display = "none";
    pauseBtn.style.display = "flex";
  });

  quranPlayer.addEventListener("pause", () => {
    playBtn.style.display = "flex";
    pauseBtn.style.display = "none";
  });

  quranPlayer.onended = () => {
    if (quranLoop.value === "surah") {
      quranPlayer.currentTime = 0;
      quranPlayer.play().catch(() => {});
      return;
    }
    if (quranLoop.value === "next") {
      nextBtn.click();
    } else {
      playBtn.style.display = "flex";
      pauseBtn.style.display = "none";
    }
  };

  playBtn.onclick = () => {
    if (!quranPlayer.src) quranPlayer.src = buildTrackUrl();
    quranPlayer.play().catch(() => {
      alert("الرجاء التفاعل مع الصفحة أولاً لتتمكن من تشغيل الصوت.");
    });
  };
  
  pauseBtn.onclick = () => {
    quranPlayer.pause();
  };

  nextBtn.onclick = () => {
    const options = Array.from(quranSurah.options);
    const idx = options.findIndex(o => o.value === quranSurah.value);
    if (idx >= 0 && idx < options.length - 1) {
      quranSurah.value = options[idx + 1].value;
      quranPlayer.src = buildTrackUrl();
      loadSurahText();
      quranPlayer.play().catch(() => {});
    }
  };

  await loadQuranData();
  applyAdaptiveCoach();
  paint();
})();
