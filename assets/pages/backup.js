(async function () {
  const app = document.getElementById("app");
  const data = await TimeMaster.load();
  app.innerHTML = TimeMaster.pageTemplate("reports", "النسخ الاحتياطي", '<i class="ri-shield-check-line"></i> حماية كاملة لبياناتك', `
    <div class="grid-2">
      <div class="panel">
        <h3><i class="ri-upload-cloud-line"></i> تصدير</h3>
        <p>تنزيل ملف JSON بكامل بيانات النظام.</p>
        <button id="export" class="btn-primary"><i class="ri-download-line"></i> تصدير الآن</button>
      </div>
      <div class="panel">
        <h3><i class="ri-download-cloud-line"></i> استيراد</h3>
        <input id="file" type="file" accept=".json,application/json">
        <button id="import" class="btn-secondary" style="margin-top:.5rem;"><i class="ri-upload-line"></i> استيراد الآن</button>
      </div>
    </div>
  `);

  document.getElementById("export").onclick = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timemaster-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    TimeMaster.toast("تم تصدير البيانات بنجاح");
  };

  document.getElementById("import").onclick = async () => {
    const file = document.getElementById("file").files[0];
    if (!file) return TimeMaster.toast("اختر الملف أولاً");
    try {
      const parsed = JSON.parse(await file.text());
      await TimeMaster.save(parsed);
      TimeMaster.toast("تم الاستيراد بنجاح");
      TimeMaster.confetti();
      setTimeout(() => location.reload(), 1500);
    } catch (error) {
      TimeMaster.toast("ملف غير صالح");
    }
  };
})();
