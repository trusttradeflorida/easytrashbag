// EasyTrash site script. Orders go through order.html (FormSubmit email); one WhatsApp link stays in the footer.
// ---- order delivery (Nov 10): static site, so forms post to FormSubmit, which emails easytrashbag@gmail.com ----
var ET_FORM_URL = "https://formsubmit.co/ajax/easytrashbag@gmail.com";
function etSend(subject, fields) {
  var body = { _subject: subject, _template: "table", _captcha: "false" };
  for (var k in fields) { if (Object.prototype.hasOwnProperty.call(fields, k)) body[k] = fields[k] == null ? "" : String(fields[k]); }
  return fetch(ET_FORM_URL, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(body) })
    .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || String(j.success) === "false") throw new Error(j.message || ("HTTP " + r.status)); return j; }); });
}
(function () {
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = String(new Date().getFullYear());
  var form = document.getElementById("wholesale-form");
  if (form) {
  var SIZES = { small: 'קטן (35×45 ס"מ)', medium: 'בינוני (75×45 ס"מ)', large: 'גדול (90×65 ס"מ)' };
  var F = { name: "שם", business: "עסק", city: "עיר", phone: "טלפון", qty: "כמות משוערת" };
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var d = new FormData(form), err = form.querySelector(".form-err");
    var need = ["name", "business", "city", "phone"];
    var missing = need.filter(function (k) { return !String(d.get(k) || "").trim(); });
    if (missing.length) { err.hidden = false; form.querySelector("[name=" + missing[0] + "]").focus(); return; }
    err.hidden = true;
    var lines = ["היי! פנייה להפצה / הזמנה סיטונאית של EasyTrash"];
    ["name", "business", "city", "phone", "qty"].forEach(function (k) {
      var v = String(d.get(k) || "").trim(); if (v) lines.push(F[k] + ": " + v);
    });
    var sz = d.getAll("sizes").map(function (s) { return SIZES[s]; });
    if (sz.length) lines.push("גדלים: " + sz.join(", "));
    var n = String(d.get("notes") || "").trim(); if (n) lines.push("הערות: " + n);
    var btn = form.querySelector("button[type=submit]"); if (btn) btn.disabled = true;
    etSend("פנייה סיטונאית חדשה מהאתר EasyTrash", { "פנייה": lines.join("\n"), "שם": d.get("name"), "עסק": d.get("business"), "עיר": d.get("city"), "טלפון": d.get("phone"), _honey: d.get("_honey") || "" }).then(function () {
      form.innerHTML = '<p class="form-thanks" role="status">תודה! קיבלנו את הפנייה ונחזור אליך בהקדם</p>';
    }).catch(function () { if (btn) btn.disabled = false; err.textContent = "השליחה נכשלה, נסו שוב בעוד רגע."; err.hidden = false; });
  });
  }

  // ---- menu ----
  var mb = document.querySelector(".menu-btn"), nav = document.getElementById("site-nav");
  if (mb && nav) {
    mb.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      mb.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("open")) { nav.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); mb.focus(); } });
  }

  // ---- hero video slot: shows assets/easytrash-hero.mp4 once it exists and loads; otherwise the product photo stays ----
  var slot = document.querySelector("[data-hero-video]");
  if (slot && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var v = document.createElement("video");
    v.muted = true; v.defaultMuted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
    v.setAttribute("playsinline", ""); v.setAttribute("muted", ""); v.setAttribute("preload", "auto");
    v.setAttribute("aria-label", "סרטון EasyTrash");
    v.poster = slot.getAttribute("data-hero-poster") || "";
    v.addEventListener("loadeddata", function () {
      var pic = slot.querySelector("picture"); if (pic) pic.hidden = true;
      v.hidden = false; var p = v.play(); if (p && p.catch) p.catch(function () {});
    });
    v.addEventListener("error", function () { v.remove(); }, true);
    v.hidden = true; v.src = slot.getAttribute("data-hero-video"); slot.appendChild(v);
  }

  // ---- EasyTrash chat assistant (scripted: answers only from facts on this site; unknowns go to WhatsApp) ----
  var chat = document.getElementById("chat");
  if (!chat) return;
  var WA = "https://wa.me/" + chat.getAttribute("data-wa-number") + "?text=";
  var panel = chat.querySelector(".chat-panel"), launch = chat.querySelector(".chat-launch"),
      log = chat.querySelector(".chat-log"), chipsEl = chat.querySelector(".chat-chips"),
      form2 = chat.querySelector(".chat-form"), input = chat.querySelector("#chat-in"), closeB = chat.querySelector(".chat-close");
  var WA_ICON = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Z"/></svg>';
  var KB = [
    { id: "how", chip: "איך זה עובד?", k: ["איך","עובד","שימוש","משתמש","להשתמש","מדביק","נרתיק","מתקין","התקנ","הוראות"],
      a: "פשוט מאוד, שלושה צעדים:\n1. מקלפים ומדביקים את הנרתיק לתחתית הפח.\n2. מושכים שקית למעלה ומשתמשים. כשהיא מתמלאת, קושרים ומרימים.\n3. תולשים בפס הניקוב, והשקית הבאה כבר במקום.", link: ["how.html", "לעמוד איך זה עובד"] },
    { id: "rest", k: ["שאר","רזרב","נוספות","איפה השקיות","מחוברות","הבאה"],
      a: "השקיות מחוברות זו לזו לשליפה קלה, והשקיות הנוספות מחכות בתחתית הפח, בתוך הנרתיק. שולפים אחת, והבאה כבר בדרך." },
    { id: "sizes", chip: "אילו גדלים יש?", k: ["גודל","גדלים","מידה","מידות","קטן","בינוני","גדול","ס\"מ","סמ","פח"],
      a: "יש שלושה גדלים:\n• קטן 35×45 ס\"מ: אמבטיה, משרד, רכב\n• בינוני 75×45 ס\"מ: בית, משרד, מטבח\n• גדול 90×65 ס\"מ: חצר, מטבח, משרד" },
    { id: "count", chip: "כמה שקיות באריזה?", k: ["כמה שקיות","באריזה","אריזה","קופסה","כמות","20"],
      a: "בכל אריזה יש 20 שקיות, בכל אחד משלושת הגדלים." },
    { id: "strong", k: ["חזק","חזקות","עמיד","דליפה","נוזל","נקרע","קורע","איכות"],
      a: "כן. אלה שקיות חזקות ועמידות בפני דליפה." },
    { id: "price", chip: "כמה זה עולה?", k: ["מחיר","עולה","עלות","שקל","₪","כסף","זול","יקר","מבצע","הנחה"],
      a: "המחיר עוד לא מפורסם באתר, הוא לפי הזמנה. מלאו את טופס ההזמנה עם הגודל והכמות, ונחזור אליכם עם מחיר.", wa: "היי! אשמח לדעת מחיר של EasyTrash.\nגודל: ___\nכמות: ___" },
    { id: "order", chip: "איך מזמינים?", k: ["להזמין","הזמנה","מזמינים","לקנות","קונים","רכישה","לרכוש"],
      a: "מזמינים בטופס ההזמנה באתר: בוחרים גודל וכמות, ונחזור אליכם.", wa: "היי! אני רוצה להזמין EasyTrash.\nגודל: ___\nכמות: ___" },
    { id: "pay", k: ["תשלום","לשלם","אשראי","כרטיס","ביט","פייבוקס","פייפאל","מאובטח"],
      a: "תשלום מאובטח באתר יתווסף בקרוב. בינתיים מזמינים בטופס ההזמנה, ונחזור אליכם לסגור את הפרטים.", wa: "היי! אני רוצה להזמין EasyTrash, איך משלמים?" },
    { id: "b2b", chip: "לחנויות ומפיצים", k: ["חנות","חנויות","מפיץ","הפצה","סיטונא","כמויות","עסק","שיווק","מדף"],
      a: "מעולה! אנחנו מקבלים עכשיו פניות להפצה ולהזמנות סיטונאיות. בעמוד לחנויות ומפיצים יש טופס קצר שנשלח אלינו, וגם דף מוצר להורדה.", link: ["wholesale.html", "לעמוד לחנויות ומפיצים"], wa: "היי! אני מעוניין/ת בהפצה / הזמנה סיטונאית של EasyTrash" },
    { id: "what", k: ["מה זה","מה המוצר","פינוי","איסוף","מפנים","שירות"],
      a: "EasyTrash הוא מוצר לבית, לא שירות פינוי: שקיות אשפה שתמיד מוכנות בתוך הפח. נרתיק שנדבק לתחתית הפח מחזיק את השקיות, וכשמוציאים שקית מלאה, הבאה כבר מחכה." },
    { id: "space", k: ["מקום","ארון","אחסון"],
      a: "השקיות הרזרביות יושבות בתחתית הפח, אז לא צריך לשמור גלילים בארון. זה מפנה מקום." },
    { id: "contact", k: ["טלפון","מספר","וואטסאפ","ווטסאפ","נציג","לדבר","קשר","מייל","אימייל"],
      a: "הכי מהר דרך טופס ההזמנה באתר. ממלאים, ונחזור אליכם.", wa: "היי! יש לי שאלה על EasyTrash" },
    { id: "hi", k: ["שלום","היי","הי","בוקר טוב","ערב טוב","אהלן"], a: "היי! 👋 במה אפשר לעזור? אפשר לבחור שאלה למטה או לכתוב לי." },
    { id: "thanks", k: ["תודה","מעולה","סבבה","אחלה"], a: "בשמחה! אם תרצו להזמין, טופס ההזמנה כאן.", wa: "היי! אני רוצה להזמין EasyTrash" }
  ];
  var UNKNOWN = { id: "unknown", a: "את זה אני עוד לא יודע 🙏 המידע הזה עדיין לא מופיע באתר (למשל זמני משלוח או אזורי הפצה). כתבו את השאלה בהערות בטופס ההזמנה, ונחזור אליכם.", wa: "היי! יש לי שאלה על EasyTrash: " };
  var SHIP = { id: "ship", a: "על משלוחים וזמני אספקה עוד אין לי מידע באתר. כתבו לנו בהערות בטופס ההזמנה ונעדכן אתכם.", wa: "היי! שאלה על משלוח של EasyTrash: " };
  function norm(s) {
    return String(s || "").replace(/[\u0591-\u05C7]/g, "").replace(/ך/g, "כ").replace(/ם/g, "מ").replace(/ן/g, "נ").replace(/ף/g, "פ").replace(/ץ/g, "צ").replace(/[?!.,״"׳']/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
  }
  function match(q) {
    var n = norm(q);
    if (/משלוח|שליח|אספקה|מגיע|כמה זמנ|זמני|מתי|הובלה|דואר|איסופ עצמי/.test(n)) return SHIP;
    if (/מחיר|עולה|עלות|שקל|₪|כמה כסף/.test(n)) return KB.filter(function (x) { return x.id === "price"; })[0];
    var best = null, score = 0;
    KB.forEach(function (it) {
      var s = 0;
      it.k.forEach(function (w) { var nw = norm(w); if (nw && n.indexOf(nw) !== -1) s += nw.length > 3 ? 2 : 1; });
      if (s > score) { score = s; best = it; }
    });
    return best || UNKNOWN;
  }
  function add(who, text, item, q) {
    var m = document.createElement("div"); m.className = "msg " + who;
    var t = document.createElement("span"); t.textContent = text; m.appendChild(t);
    if (item && item.link) {
      var l = document.createElement("a"); l.href = item.link[0]; l.textContent = item.link[1] + " ←";
      l.style.display = "block"; l.style.marginTop = "6px"; l.style.fontWeight = "700"; m.appendChild(l);
    }
    if (item && item.wa) {
      var w = document.createElement("a"); w.className = "msg-wa";
      w.href = "order.html";
      w.innerHTML = "<span>הזמינו עכשיו</span>"; m.appendChild(w);
    }
    log.appendChild(m); log.scrollTop = log.scrollHeight;
  }
  function ask(q, label) {
    add("me", label || q);
    var it = typeof q === "object" ? q : match(q);
    setTimeout(function () { add("bot", it.a, it, typeof q === "string" ? q : ""); }, 350);
  }
  KB.forEach(function (it) {
    if (!it.chip) return;
    var b = document.createElement("button"); b.type = "button"; b.textContent = it.chip;
    b.addEventListener("click", function () { ask(it, it.chip); });
    chipsEl.appendChild(b);
  });
  var shipChip = document.createElement("button"); shipChip.type = "button"; shipChip.textContent = "משלוחים";
  shipChip.addEventListener("click", function () { ask(SHIP, "משלוחים"); }); chipsEl.appendChild(shipChip);
  var greeted = false;
  function openChat() {
    panel.hidden = false; chat.classList.add("is-open"); launch.setAttribute("aria-expanded", "true");
    if (!greeted) { greeted = true; add("bot", "היי! 👋 אני העוזר האוטומטי של EasyTrash. אני עונה לפי מה שכתוב באתר. מה תרצו לדעת?"); }
    setTimeout(function () { input.focus({ preventScroll: true }); }, 50);
  }
  function closeChat() { panel.hidden = true; chat.classList.remove("is-open"); launch.setAttribute("aria-expanded", "false"); launch.focus(); }
  launch.addEventListener("click", openChat);
  closeB.addEventListener("click", closeChat);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) closeChat(); });
  form2.addEventListener("submit", function (e) {
    e.preventDefault(); var q = input.value.trim(); if (!q) return; input.value = ""; ask(q);
  });
})();

// ---- video spot (Nov 10): poster first; plays muted + inline (iPhone) with native controls when it scrolls into view or when the play button is tapped.
// Files: data-src-wide (16:9, desktop) and data-src-tall (9:16, phone). Missing file = the poster stays.
(function () {
  var f = document.querySelector(".vid-frame");
  if (!f) return;
  var mq = window.matchMedia("(max-width: 700px)");
  var v = null, broken = false;
  function src() { return mq.matches ? f.getAttribute("data-src-tall") : f.getAttribute("data-src-wide"); }
  function make() {
    if (v || broken) return v;
    var s = src(); if (!s) { broken = true; return null; }
    v = document.createElement("video");
    v.muted = true; v.defaultMuted = true; v.playsInline = true; v.controls = true; v.loop = false;
    v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("webkit-playsinline", ""); v.setAttribute("controls", "");
    v.preload = "metadata"; v.hidden = true;
    v.poster = mq.matches ? f.getAttribute("data-poster-tall") : f.getAttribute("data-poster-wide");
    v.addEventListener("error", function () { broken = true; if (v) { v.remove(); v = null; } f.classList.remove("playing"); }, true);
    v.addEventListener("playing", function () { v.hidden = false; f.classList.add("playing"); });
    v.src = s; f.appendChild(v);
    return v;
  }
  function play() { var x = make(); if (!x) return; x.hidden = false; f.classList.add("playing"); var p = x.play(); if (p && p.catch) p.catch(function () {}); }
  var btn = f.querySelector(".vid-play");
  if (btn) btn.addEventListener("click", function (e) { e.stopPropagation(); play(); });
  f.querySelector(".vid-poster") && f.querySelector(".vid-poster").addEventListener("click", function () { play(); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting && en.intersectionRatio >= 0.5) { if (!v) play(); }
        else if (v && !v.paused) { v.pause(); }
      });
    }, { threshold: [0, 0.5] });
    io.observe(f);
  }
})();

// ---- order form (order.html, Nov 10): emails the order to easytrashbag@gmail.com through FormSubmit ----
(function () {
  var form = document.getElementById("order-form");
  if (!form) return;
  var NAMES = { small: 'קטן (35×45 ס"מ)', medium: 'בינוני (75×45 ס"מ)', large: 'גדול (90×65 ס"מ)' };
  var pre = (location.search.match(/[?&]size=(small|medium|large)/) || [])[1];
  if (pre) { var q0 = form.querySelector("[name=qty_" + pre + "]"); if (q0 && !Number(q0.value)) q0.value = 1; }
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var d = new FormData(form), err = form.querySelector(".form-err");
    var items = [], total = 0;
    ["small", "medium", "large"].forEach(function (k) { var n = parseInt(d.get("qty_" + k), 10) || 0; if (n > 0) { items.push(NAMES[k] + " × " + n); total += n; } });
    var need = ["name", "phone", "city", "address"];
    var missing = need.filter(function (k) { return !String(d.get(k) || "").trim(); });
    if (missing.length || !total) { err.hidden = false; var el = missing.length ? form.querySelector("[name=" + missing[0] + "]") : form.querySelector("[name=qty_small]"); if (el) el.focus(); return; }
    err.hidden = true;
    var btn = form.querySelector("button[type=submit]"); btn.disabled = true;
    etSend("הזמנה חדשה מהאתר EasyTrash", {
      "מוצרים": items.join(" | "), "סה״כ אריזות": total,
      "שם מלא": d.get("name"), "טלפון": d.get("phone"), "אימייל": d.get("email"), "email": d.get("email") || "",
      "עיר": d.get("city"), "כתובת": d.get("address"), "הערות": d.get("notes"), _honey: d.get("_honey") || ""
    }).then(function () {
      form.hidden = true; var t = document.getElementById("order-thanks"); t.hidden = false; t.focus(); window.scrollTo(0, 0);
    }).catch(function () { btn.disabled = false; err.textContent = "השליחה נכשלה, נסו שוב בעוד רגע."; err.hidden = false; });
  });
})();
