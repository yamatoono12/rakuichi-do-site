(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const seenKey = "rakuichi-opening";
  let seen = false;
  try { seen = sessionStorage.getItem(seenKey) === "1"; } catch {}
  if (document.body.classList.contains("is-home") && !seen && !reduce) {
    try { sessionStorage.setItem(seenKey, "1"); } catch {}
    const loader = document.createElement("div");
    loader.className = "loader";
    loader.setAttribute("aria-hidden", "true");
    const seal = document.createElement("span");
    seal.className = "loader-seal";
    seal.textContent = "楽市";
    const name = document.createElement("p");
    name.className = "loader-name";
    [..."ラクイチ堂"].forEach((c, i) => {
      const s = document.createElement("span");
      s.textContent = c;
      s.style.animationDelay = `${1.0 + i * 0.12}s`;
      name.append(s);
    });
    const waves = document.createElement("span");
    waves.className = "loader-waves";
    const glow = document.createElement("span");
    glow.className = "loader-glow";
    const mark = document.createElement("div");
    mark.className = "loader-mark";
    mark.innerHTML = '<svg class="loader-enso" viewBox="0 0 230 230"><circle class="e2" cx="115" cy="115" r="104"/><circle class="e1" cx="115" cy="115" r="100"/></svg>';
    mark.append(seal);
    loader.append(waves, glow, mark, name);
    document.body.prepend(loader);
    document.documentElement.classList.add("is-loading");

    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      loader.classList.add("is-done");
      document.dispatchEvent(new Event("opening:done"));
      document.documentElement.classList.remove("is-loading");
      loader.addEventListener("transitionend", () => loader.remove(), { once: true });
      setTimeout(() => loader.remove(), 1500);
    };
    const minTime = new Promise((r) => setTimeout(r, 2300));
    const loaded = new Promise((r) => (document.readyState === "complete" ? r() : window.addEventListener("load", r, { once: true })));
    Promise.all([minTime, loaded]).then(close);
    setTimeout(close, 4500);
    loader.addEventListener("click", close);
  }

  const hero = document.querySelector(".hero");
  if (hero && !reduce) {
    const split = (el, base, step) => {
      const text = el.textContent;
      el.setAttribute("aria-label", text);
      el.textContent = "";
      [...text].forEach((ch, i) => {
        const s = document.createElement("span");
        s.className = "c";
        s.setAttribute("aria-hidden", "true");
        s.textContent = ch;
        s.style.setProperty("--d", `${base + i * step}s`);
        el.append(s);
      });
    };
    split(hero.querySelector(".hero-catch"), 0.2, 0.09);
    split(hero.querySelector(".hero-name"), 1.1, 0.12);
    hero.classList.add("js-anim");
    const ensoWrap = hero.querySelector(".hero-enso-wrap");
    const nameEl = hero.querySelector(".hero-name");
    const catchEl = hero.querySelector(".hero-catch");
    const layoutEnso = () => {
      if (!ensoWrap || !nameEl) return;
      const hr = hero.getBoundingClientRect();
      const nr = nameEl.getBoundingClientRect();
      const top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) + 16;
      const bottom = nr.top - hr.top - 24;
      const cr = catchEl ? catchEl.getBoundingClientRect() : null;
      const right = cr ? cr.left - hr.left - (window.innerWidth > 640 ? 24 : 10) : hr.width - 16;
      const left = window.innerWidth > 640 ? hr.width * 0.18 : 16;
      const size = Math.max(160, Math.min(bottom - top, right - left, 720));
      ensoWrap.style.width = `${size}px`;
      ensoWrap.style.setProperty("--es", size);
      ensoWrap.style.left = `${(left + right) / 2}px`;
      ensoWrap.style.top = `${top + (bottom - top) / 2}px`;
    };
    layoutEnso();
    window.addEventListener("resize", layoutEnso);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutEnso);
    const go = () => hero.classList.add("is-go");
    if (document.documentElement.classList.contains("is-loading")) {
      document.addEventListener("opening:done", () => setTimeout(go, 250), { once: true });
      setTimeout(go, 5200);
    } else {
      requestAnimationFrame(go);
    }

    let tick = false;
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      hero.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    }, { passive: true });
    const onScrollHero = () => {
      tick = false;
      const y = Math.min(window.scrollY, 900);
      hero.style.setProperty("--sy", y.toFixed(0));
    };
    window.addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(onScrollHero); } }, { passive: true });
  }

  const header = document.querySelector(".site-header");
  const btn = document.querySelector(".menu-btn");
  const nav = document.querySelector(".gnav");

  if (btn && nav) {
    const setOpen = (open) => {
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "閉じる" : "メニュー";
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
    };
    btn.addEventListener("click", () => setOpen(btn.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); btn.focus(); }
    });
  }

  if (header) {
    const onScroll = () => header.classList.toggle("is-solid", window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const reveals = document.querySelectorAll(".rv");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    reveals.forEach((el) => io.observe(el));
  }

  const creed = document.querySelector(".creed");
  const writer = creed && creed.querySelector("[data-write]");
  if (creed && writer && !reduce) {
    const sr = document.createElement("p");
    sr.className = "visually-hidden";
    sr.textContent = writer.innerText;
    writer.before(sr);
    writer.setAttribute("aria-hidden", "true");
    const chars = [];
    writer.querySelectorAll("span").forEach((line) => {
      const text = line.textContent;
      line.textContent = "";
      for (const c of text) {
        const ch = document.createElement("span");
        ch.className = "ch";
        ch.textContent = c;
        line.append(ch);
        chars.push(ch);
      }
    });
    creed.classList.add("is-scrub");
    const hint = document.createElement("span");
    hint.className = "creed-hint";
    hint.setAttribute("aria-hidden", "true");
    hint.textContent = "スクロールで書き進める";
    creed.querySelector(".creed-pin").append(hint);

    let shown = -1, stamped = false, queued = false;
    const update = () => {
      queued = false;
      const rect = creed.getBoundingClientRect();
      const span = creed.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / (span * 0.82)));
      const n = Math.round(p * chars.length);
      if (n !== shown) {
        chars.forEach((c, i) => {
          c.classList.toggle("on", i < n);
          c.classList.toggle("cur", i === n - 1 && n < chars.length);
        });
        shown = n;
      }
      const done = n >= chars.length;
      if (done !== stamped) {
        stamped = done;
        creed.classList.toggle("is-stamped", done);
      }
    };
    window.addEventListener("scroll", () => {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  const form = document.querySelector("#contact-form");
  if (form) {
    const preset = new URLSearchParams(location.search).get("type");
    if (preset) {
      const r = form.querySelector(`input[name="type"][data-key="${CSS.escape(preset)}"]`);
      if (r) r.checked = true;
    }
    const status = form.querySelector(".form-status");
    const submit = form.querySelector("button[type=submit]");
    const messages = {
      valueMissing: "入力してください。",
      typeMismatch: "正しい形式で入力してください。",
      patternMismatch: "正しい形式で入力してください。",
    };

    const check = (el) => {
      const field = el.closest(".field, .agree");
      if (!field) return true;
      const err = field.querySelector(".err");
      let ok = true;
      if (el.type === "radio") {
        ok = !!form.querySelector(`input[name="${el.name}"]:checked`);
        if (!ok && err) err.textContent = "選択してください。";
      } else if (el.type === "checkbox") {
        ok = el.checked;
        if (!ok && err) err.textContent = "同意のうえ送信してください。";
      } else {
        ok = el.checkValidity();
        if (!ok && err) {
          const key = Object.keys(messages).find((k) => el.validity[k]);
          err.textContent = el.dataset.msg && key !== "valueMissing" ? el.dataset.msg : messages[key] || "入力内容をご確認ください。";
        }
      }
      field.classList.toggle("is-error", !ok);
      el.setAttribute("aria-invalid", String(!ok));
      return ok;
    };

    form.querySelectorAll("input, textarea, select").forEach((el) => {
      if (el.name === "website") return;
      el.addEventListener(el.type === "radio" || el.type === "checkbox" ? "change" : "blur", () => check(el));
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.textContent = "";
      status.classList.remove("is-error");
      const els = [...form.querySelectorAll("[required]")];
      const bad = els.filter((el) => !check(el));
      if (bad.length) {
        status.textContent = "入力内容に不備があります。赤字の項目をご確認ください。";
        status.classList.add("is-error");
        bad[0].focus();
        return;
      }
      if (form.website.value) return;

      const endpoint = form.dataset.endpoint;
      if (!endpoint) {
        status.textContent = "現在、送信の準備中です。恐れ入りますが、しばらくしてから再度お試しください。";
        status.classList.add("is-error");
        return;
      }

      submit.disabled = true;
      submit.textContent = "送信しています…";
      try {
        const data = Object.fromEntries(new FormData(form));
        delete data.website;
        const res = await fetch(endpoint, {
          method: "POST",
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json", Accept: "application/json" },
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok || String(body.success) === "false") throw new Error(body.message || String(res.status));
        const thanks = document.querySelector("#thanks");
        form.hidden = true;
        thanks.hidden = false;
        thanks.focus();
      } catch {
        status.textContent = "送信できませんでした。通信環境をご確認のうえ、もう一度お試しください。";
        status.classList.add("is-error");
        submit.disabled = false;
        submit.textContent = "送信する";
      }
    });
  }
})();
