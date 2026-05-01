<?php declare(strict_types=1); ?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TimeMaster Pro — النظام الاحترافي</title>
  <meta name="description" content="نظام احترافي متكامل لإدارة الوقت والمهام والعادات مع بومودورو والقرآن الكريم">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Kalam:wght@700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.6.0/fonts/remixicon.css" rel="stylesheet">
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
  <nav>
    <a class="nav-logo" href="index.php">Time<span>Master</span></a>
    <ul class="nav-links">
      <li><a href="tasks.php">المهام</a></li>
      <li><a href="kanban.php">كانبان</a></li>
      <li><a href="matrix.php">المصفوفة</a></li>
      <li><a href="focus.php">التركيز</a></li>
      <li><a href="habits.php">العادات</a></li>
      <li><a href="goals.php">الأهداف</a></li>
      <li><a href="reports.php">التقارير</a></li>
    </ul>
    <a class="nav-cta" href="backup.php"><i class="ri-download-cloud-line"></i> نسخ احتياطي</a>
    <div class="hamburger" onclick="document.getElementById('mobileMenu').classList.toggle('open')">
      <span></span><span></span><span></span>
    </div>
  </nav>

  <div id="mobileMenu" class="mobile-menu">
    <button class="mobile-close" onclick="this.parentElement.classList.remove('open')">✕</button>
    <a href="index.php"><i class="ri-home-4-line"></i> الرئيسية</a>
    <a href="tasks.php"><i class="ri-task-line"></i> المهام</a>
    <a href="kanban.php"><i class="ri-kanban-view"></i> كانبان</a>
    <a href="matrix.php"><i class="ri-grid-line"></i> المصفوفة</a>
    <a href="focus.php"><i class="ri-focus-3-line"></i> التركيز</a>
    <a href="habits.php"><i class="ri-heart-pulse-line"></i> العادات</a>
    <a href="goals.php"><i class="ri-trophy-line"></i> الأهداف</a>
    <a href="reports.php"><i class="ri-bar-chart-box-line"></i> التقارير</a>
    <a href="backup.php"><i class="ri-download-cloud-line"></i> النسخ الاحتياطي</a>
  </div>

  <!-- Motivational Quote -->
  <section class="section page-section">
    <div class="section-inner">
      <div id="quoteCard" class="quote-card reveal">
        <div class="quote-text" id="quoteText">العمل هو أفضل طريقة لقتل الوقت... والنجاح.</div>
        <div class="quote-author" id="quoteAuthor">— TimeMaster Pro</div>
      </div>

      <div class="section-tag"><i class="ri-home-4-line"></i> الرئيسية</div>
      <h1 class="section-title">لوحة التحكم المركزية</h1>

      <div class="grid-2">
        <div class="panel reveal">
          <div class="hero-badge"><i class="ri-rocket-line"></i> نسخة احترافية متكاملة</div>
          <h2 style="margin-bottom:.7rem;">نظام احترافي لتنظيم وقتك بالكامل</h2>
          <p class="hero-sub" style="max-width:unset; margin-top:0;">
            كل ميزة في صفحة مستقلة وكود منفصل. إدارة مهام متقدمة، كانبان احترافي، مصفوفة أولويات، تركيز عميق، عادات، أهداف، تقارير ذكية، ونسخ احتياطي.
          </p>
          <div class="hero-buttons">
            <a class="btn-primary" href="tasks.php"><i class="ri-play-circle-line"></i> ابدأ الآن</a>
            <a class="btn-secondary" href="focus.php"><i class="ri-focus-3-line"></i> جلسة تركيز</a>
          </div>
        </div>
        <div class="panel reveal">
          <h3><i class="ri-flashlight-line"></i> روابط سريعة</h3>
          <div class="feature-grid">
            <a class="feature-link" href="tasks.php"><i class="ri-task-line"></i> المهام الذكية</a>
            <a class="feature-link" href="kanban.php"><i class="ri-kanban-view"></i> لوحة كانبان</a>
            <a class="feature-link" href="matrix.php"><i class="ri-grid-line"></i> مصفوفة الأولويات</a>
            <a class="feature-link" href="focus.php"><i class="ri-quill-pen-line"></i> التركيز + القرآن</a>
            <a class="feature-link" href="habits.php"><i class="ri-heart-pulse-line"></i> العادات اليومية</a>
            <a class="feature-link" href="goals.php"><i class="ri-trophy-line"></i> الأهداف الذكية</a>
            <a class="feature-link" href="reports.php"><i class="ri-bar-chart-box-line"></i> التقارير</a>
            <a class="feature-link" href="backup.php"><i class="ri-download-cloud-line"></i> النسخ الاحتياطي</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" style="padding-top: 0;">
    <div class="section-inner">
      <div class="section-tag"><i class="ri-dashboard-line"></i> لوحة سريعة</div>
      <h2 class="section-title">إحصائيات مباشرة</h2>
      <div id="homeStats" class="stats-grid">
        <div class="stat-card reveal"><h3><i class="ri-file-list-3-line"></i> المهام الكلية</h3><p id="statTasks">0</p></div>
        <div class="stat-card reveal"><h3><i class="ri-checkbox-circle-line"></i> المنجز</h3><p id="statDone">0</p></div>
        <div class="stat-card reveal"><h3><i class="ri-focus-3-line"></i> دقائق التركيز</h3><p id="statFocus">0</p></div>
        <div class="stat-card reveal"><h3><i class="ri-fire-line"></i> سلسلة الإنجاز</h3><p id="statStreak">0</p></div>
      </div>

      <div class="panel reveal" style="margin-top:1.2rem;text-align:center;">
        <h3><i class="ri-speed-line"></i> نقاط الإنتاجية</h3>
        <div id="productivityScore" style="font-size:3rem;font-weight:900;background:var(--gradient-hero);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">0</div>
        <div id="productivityLabel" class="muted-note">جاري الحساب...</div>
        <div class="bar" style="margin-top:.8rem;"><span id="productivityBar" style="width:0%"></span></div>
      </div>
    </div>
  </section>

  <section class="section alt" style="padding-top: 4rem;">
    <div class="section-inner">
      <div class="section-tag"><i class="ri-star-line"></i> مزايا احترافية</div>
      <h2 class="section-title">ماذا يميز النظام؟</h2>
      <div class="feature-grid">
        <div class="feature-link reveal"><i class="ri-loop-left-line"></i> مهام متكررة تلقائيًا يومي/أسبوعي</div>
        <div class="feature-link reveal"><i class="ri-timer-line"></i> تحكم حر بمدة جلسة التركيز</div>
        <div class="feature-link reveal"><i class="ri-book-open-line"></i> مشغل قرآن يعمل بالخلفية</div>
        <div class="feature-link reveal"><i class="ri-line-chart-line"></i> تحليلات إنتاجية لحظية</div>
        <div class="feature-link reveal"><i class="ri-shield-check-line"></i> نسخ احتياطي واسترجاع فوري</div>
        <div class="feature-link reveal"><i class="ri-global-line"></i> واجهة عربية RTL احترافية</div>
        <div class="feature-link reveal"><i class="ri-calendar-schedule-line"></i> Blueprint Generator لخطة يومك</div>
        <div class="feature-link reveal"><i class="ri-brain-line"></i> مدرب ذكي يضبط جلساتك تلقائيًا</div>
      </div>
    </div>
  </section>

  <footer>
    <a class="footer-logo" href="index.php">Time<span>Master</span></a>
    <span class="footer-copy">© 2026 TimeMaster Pro — صُنع بإتقان</span>
  </footer>

  <!-- Mobile Bottom Nav -->
  <nav class="mobile-bottom-nav" id="mobileBottomNav">
    <a href="index.php" class="active"><span class="nav-icon"><i class="ri-home-4-line"></i></span><span>الرئيسية</span></a>
    <a href="tasks.php"><span class="nav-icon"><i class="ri-task-line"></i></span><span>المهام</span></a>
    <a href="focus.php"><span class="nav-icon"><i class="ri-focus-3-line"></i></span><span>التركيز</span></a>
    <a href="habits.php"><span class="nav-icon"><i class="ri-heart-pulse-line"></i></span><span>العادات</span></a>
    <a href="reports.php"><span class="nav-icon"><i class="ri-bar-chart-box-line"></i></span><span>التقارير</span></a>
  </nav>

  <script src="assets/common.js"></script>
  <script src="assets/pages/home.js"></script>
</body>
</html>
