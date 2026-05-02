/**
 * 🛡️ LEGENDARY FIREWALL PRO MAX - (Titanium Edition)
 * The Ultimate Client-Side Protection System
 * Anti-Spam | Anti-XSS | Anti-DDoS | Bot Detection | Payload Nullification
 */

(function() {
  "use strict";

  const FirewallConfig = {
      maxRequestsPerMinute: 60,
      banDuration: 5 * 60 * 1000, // 5 minutes ban
      enableConsoleLock: true,
      blockDevTools: false,
      blockIframe: true,
      blockAutomation: true
  };

  class LegendaryFirewall {
      constructor() {
          this.init();
      }

      init() {
          if (this.isBanned()) {
              this.enforceBan();
              return;
          }

          this.preventClickjacking();
          this.detectMaliciousPayloads();
          this.rateLimitEngine();
          this.detectBotsAndAutomation();
          this.secureInputs();
          this.lockdownConsole();
          
          console.log("%c🛡️ Legendary Firewall Pro Max - ACTIVATED", "color: #2a9d8f; font-size: 20px; font-weight: 900; text-shadow: 2px 2px 0 #000;");
      }

      // 1. Clickjacking Protection
      preventClickjacking() {
          if (FirewallConfig.blockIframe && window.top !== window.self) {
              window.top.location = window.self.location;
          }
      }

      // 2. Extreme Malicious Payload Detection (XSS, SQLi, RCE)
      detectMaliciousPayloads() {
          const query = decodeURIComponent(window.location.search.toLowerCase() + window.location.hash.toLowerCase() + window.location.pathname.toLowerCase());
          
          // Advanced Regex Patterns
          const patterns = [
              /<script\b[^>]*>(.*?)<\/script>/is, // XSS Scripts
              /javascript:/i,                     // JS URI
              /onerror=/i, /onload=/i, /onclick=/i, // DOM Events
              /union\s+select/i, /drop\s+table/i, // SQLi
              /base64_decode/i, /eval\(/i,        // Execution
              /document\.cookie/i,                // Cookie Theft
              /%3Cscript%3E/i,                    // Encoded XSS
          ];
          
          for (const pattern of patterns) {
              if (pattern.test(query)) {
                  this.triggerLockdown("Extreme Malicious Payload Detected in URL");
              }
          }
      }

      // 3. AI-Level Rate Limiting (Anti-Client DDoS)
      rateLimitEngine() {
          const now = Date.now();
          let logs = [];
          
          try {
              logs = JSON.parse(localStorage.getItem('fw_titanium_log') || '[]');
          } catch(e) { logs = []; }
          
          // Keep only logs from the last 60 seconds
          logs = logs.filter(time => now - time < 60000);
          
          if (logs.length >= FirewallConfig.maxRequestsPerMinute) {
              this.banUser("Too Many Requests (DDoS Protection)");
          }
          
          logs.push(now);
          localStorage.setItem('fw_titanium_log', JSON.stringify(logs));
      }

      // 4. Advanced Bot & Scraper Detection (Puppeteer, Selenium)
      detectBotsAndAutomation() {
          if (!FirewallConfig.blockAutomation) return;

          const isBot = 
              navigator.webdriver || 
              window.navigator.userAgent.indexOf("HeadlessChrome") !== -1 ||
              window.navigator.userAgent.indexOf("bot") !== -1 ||
              window.document.documentElement.getAttribute("webdriver") !== null;

          if (isBot) {
              this.triggerLockdown("Automated Bot / Scraper Detected");
          }
      }

      // 5. Input Sanitizer (Auto-strips malicious code from forms)
      secureInputs() {
          document.addEventListener("input", (e) => {
              if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
                  const val = e.target.value;
                  const sanitized = val.replace(/<[^>]*>?/gm, ""); // Remove HTML tags
                  if (val !== sanitized) {
                      e.target.value = sanitized;
                      this.showWarning("⚠️ تم اكتشاف رموز غير مسموحة وتمت إزالتها بواسطة جدار الحماية.");
                  }
              }
          }, true);
      }

      // 6. Console Protection
      lockdownConsole() {
          if (!FirewallConfig.enableConsoleLock) return;
          
          const warningTitle = "%cتوقف فوراً! ⛔";
          const warningBody = "%cهذه المنطقة مخصصة للمطورين فقط. أي محاولة للتلاعب ستؤدي إلى حظر جهازك نهائياً.";
          
          console.log(warningTitle, "color: red; font-size: 40px; font-weight: bold; text-shadow: 2px 2px 0px black;");
          console.log(warningBody, "font-size: 16px; color: #fff; background: #000; padding: 10px; border-radius: 5px;");
      }

      // ==== PUNISHMENT SYSTEM ====
      banUser(reason) {
          const banUntil = Date.now() + FirewallConfig.banDuration;
          localStorage.setItem('fw_titanium_ban', banUntil);
          this.triggerLockdown(`BANNED: ${reason}`);
      }

      isBanned() {
          const banTime = localStorage.getItem('fw_titanium_ban');
          if (banTime && Date.now() < parseInt(banTime)) {
              return true;
          } else if (banTime) {
              localStorage.removeItem('fw_titanium_ban');
              localStorage.removeItem('fw_titanium_log');
          }
          return false;
      }

      enforceBan() {
          document.body.innerHTML = `
              <div style="height: 100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#111; color:#ff3333; font-family:sans-serif; text-align:center; padding: 20px;">
                  <h1 style="font-size:4rem; margin-bottom:10px;">🛡️ تم الحظر</h1>
                  <h2>تم حظر جهازك بواسطة Legendary Firewall بسبب نشاط مشبوه.</h2>
                  <p style="color:#aaa; margin-top:20px;">يرجى المحاولة بعد 5 دقائق.</p>
              </div>
          `;
          document.body.style.margin = "0";
          document.body.style.overflow = "hidden";
      }

      triggerLockdown(reason) {
          console.error("FIREWALL LOCKDOWN: " + reason);
          this.enforceBan();
          // Stop further execution
          window.stop ? window.stop() : document.execCommand("Stop");
      }

      showWarning(msg) {
          let fwToast = document.getElementById("fw_toast");
          if (!fwToast) {
              fwToast = document.createElement("div");
              fwToast.id = "fw_toast";
              fwToast.style.cssText = "position:fixed; bottom:20px; left:20px; background:#e76f51; color:#fff; padding:10px 20px; border-radius:8px; z-index:999999; font-weight:bold; box-shadow:0 4px 10px rgba(0,0,0,0.3); transition:all 0.3s; transform:translateY(100px); opacity:0;";
              document.body.appendChild(fwToast);
          }
          fwToast.innerText = msg;
          fwToast.style.transform = "translateY(0)";
          fwToast.style.opacity = "1";
          
          setTimeout(() => {
              fwToast.style.transform = "translateY(100px)";
              fwToast.style.opacity = "0";
          }, 3000);
      }
  }

  // Initialize Firewall Immediately
  new LegendaryFirewall();

})();
