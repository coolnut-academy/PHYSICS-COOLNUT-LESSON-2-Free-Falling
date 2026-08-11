/**
 * Physics Coolnut Lesson — Free Falling
 * Shared Utilities & Question Generator Logic
 */

(() => {
  "use strict";

  const G = -9.8;
  const TOL = 0.05;
  const THEME_KEY = "coolnut_freefall_theme";

  function clampStudentNo(value) {
    const n = Number.parseInt(value, 10);
    if (!Number.isFinite(n)) return 1;
    return Math.min(99, Math.max(1, n));
  }

  function pickRandom(items) {
    if (window.crypto && crypto.getRandomValues) {
      const a = new Uint32Array(1);
      crypto.getRandomValues(a);
      return items[a[0] % items.length];
    }
    return items[Math.floor(Math.random() * items.length)];
  }

  function randomFamily() {
    return pickRandom([1, 2, 3, 4]);
  }

  function randomInt(min, max) {
    const low = Math.ceil(min);
    const high = Math.floor(max);
    const range = high - low + 1;
    if (window.crypto && crypto.getRandomValues) {
      const values = new Uint32Array(1);
      const limit = Math.floor(0x100000000 / range) * range;
      do {
        crypto.getRandomValues(values);
      } while (values[0] >= limit);
      return low + (values[0] % range);
    }
    return Math.floor(Math.random() * range) + low;
  }

  function withinTolerance(actual, expected, tolerance = TOL) {
    if (!Number.isFinite(actual) || !Number.isFinite(expected)) return false;
    const displayedExpected = Number(expected.toFixed(2));
    return Math.abs(actual - displayedExpected) <= tolerance + 1e-9;
  }

  function fmt(n) {
    return Number(n).toFixed(2);
  }

  function signed(n) {
    if (Math.abs(n) < 1e-12) return "0.00";
    return `${n > 0 ? "+" : "−"}${fmt(Math.abs(n))}`;
  }

  function signOf(n) {
    return n < 0 ? "-" : "+";
  }

  function unitText(u) {
    return u === "m/s2" ? "m/s²" : u;
  }

  function makeQ1(studentNo, familyId, baseValue = null) {
    const n = clampStudentNo(studentNo);
    const hasRandomBase = Number.isInteger(baseValue) && baseValue >= 1 && baseValue <= 99;

    if (familyId === 1) {
      const u = hasRandomBase ? baseValue + n : 24 + (n % 8);
      const t = 1 + (n % 2);
      const velocityTerm = u * t;
      const gravityTerm = 0.5 * G * t * t;
      const s = u * t + 0.5 * G * t * t;
      return {
        familyId,
        baseValue: hasRandomBase ? baseValue : null,
        familyName: "สมการ 1 · Sᵧ = uᵧt + ½gt²",
        text: `โยนลูกบอลขึ้นในแนวดิ่งด้วยความเร็วต้น ${hasRandomBase ? `uᵧ = ${baseValue} + ${n} = ` : ""}+${u.toFixed(0)} m/s หลังจาก ${t} s ลูกบอลมีการกระจัด Sᵧ จากจุดปล่อยเท่าใด?`,
        answer: s,
        unit: "m",
        target: "Sᵧ",
        known: `uᵧ = +${u.toFixed(0)} m/s, t = ${t} s, g = −9.8 m/s²`,
        formula: `Sᵧ = uᵧt + ½gt²`,
        substitution: `Sᵧ = (${u.toFixed(0)})(${t}) + ½(−9.8)(${t})² = ${signed(s)} m`,
        solutionSteps: [
          hasRandomBase
            ? `คำนวณความเร็วต้น: uᵧ = ${baseValue} + ${n} = +${u.toFixed(0)} m/s`
            : `กำหนดความเร็วต้น uᵧ = +${u.toFixed(0)} m/s`,
          `กำหนดแกน +y ชี้ขึ้น จึงมี uᵧ = +${u.toFixed(0)} m/s, t = ${t} s และ g = −9.8 m/s²`,
          `เลือกใช้สมการ Sᵧ = uᵧt + ½gt²`,
          `แทนค่า Sᵧ = (${u.toFixed(0)})(${t}) + ½(−9.8)(${t})²`,
          `คำนวณ uᵧt = ${fmt(velocityTerm)} m และ ½gt² = ${signed(gravityTerm)} m จึงได้ Sᵧ = ${signed(s)} m`
        ]
      };
    }

    if (familyId === 2) {
      const v = hasRandomBase ? baseValue + n : 16 + (n % 8);
      const t = 1 + (n % 2);
      const velocityTerm = v * t;
      const gravityTerm = -0.5 * G * t * t;
      const s = v * t - 0.5 * G * t * t;
      return {
        familyId,
        baseValue: hasRandomBase ? baseValue : null,
        familyName: "สมการ 2 · Sᵧ = vᵧt − ½gt²",
        text: `วัตถุถูกโยนขึ้นในแนวดิ่ง และเมื่อครบ ${t} s ยังมีความเร็ว vᵧ = ${hasRandomBase ? `${baseValue} + ${n} = ` : ""}+${v.toFixed(0)} m/s จงหาการกระจัด Sᵧ ในช่วงเวลาดังกล่าว`,
        answer: s,
        unit: "m",
        target: "Sᵧ",
        known: `vᵧ = +${v.toFixed(0)} m/s, t = ${t} s, g = −9.8 m/s²`,
        formula: `Sᵧ = vᵧt − ½gt²`,
        substitution: `Sᵧ = (${v.toFixed(0)})(${t}) − ½(−9.8)(${t})² = ${signed(s)} m`,
        solutionSteps: [
          hasRandomBase
            ? `คำนวณความเร็วปลาย: vᵧ = ${baseValue} + ${n} = +${v.toFixed(0)} m/s`
            : `กำหนดความเร็วปลาย vᵧ = +${v.toFixed(0)} m/s`,
          `กำหนดแกน +y ชี้ขึ้น จึงมี vᵧ = +${v.toFixed(0)} m/s, t = ${t} s และ g = −9.8 m/s²`,
          `เลือกใช้สมการ Sᵧ = vᵧt − ½gt²`,
          `แทนค่า Sᵧ = (${v.toFixed(0)})(${t}) − ½(−9.8)(${t})²`,
          `คำนวณ vᵧt = ${fmt(velocityTerm)} m และ −½gt² = ${signed(gravityTerm)} m จึงได้ Sᵧ = ${signed(s)} m`
        ]
      };
    }

    if (familyId === 3) {
      const u = hasRandomBase ? baseValue + n : 22 + (n % 8);
      let t = 4 + (n % 2);
      if (Math.abs(u + G * t) < 1e-12) t = 4;
      const gravityChange = G * t;
      const v = u + G * t;
      return {
        familyId,
        baseValue: hasRandomBase ? baseValue : null,
        familyName: "สมการ 3 · vᵧ = uᵧ + gt",
        text: `โยนลูกบอลขึ้นในแนวดิ่งด้วยความเร็วต้น ${hasRandomBase ? `uᵧ = ${baseValue} + ${n} = ` : ""}+${u.toFixed(0)} m/s หลังจาก ${t} s ลูกบอลมีความเร็ว vᵧ เท่าใด?`,
        answer: v,
        unit: "m/s",
        target: "vᵧ",
        known: `uᵧ = +${u.toFixed(0)} m/s, t = ${t} s, g = −9.8 m/s²`,
        formula: `vᵧ = uᵧ + gt`,
        substitution: `vᵧ = ${u.toFixed(0)} + (−9.8)(${t}) = ${signed(v)} m/s`,
        solutionSteps: [
          hasRandomBase
            ? `คำนวณความเร็วต้น: uᵧ = ${baseValue} + ${n} = +${u.toFixed(0)} m/s`
            : `กำหนดความเร็วต้น uᵧ = +${u.toFixed(0)} m/s`,
          `กำหนดแกน +y ชี้ขึ้น จึงมี uᵧ = +${u.toFixed(0)} m/s, t = ${t} s และ g = −9.8 m/s²`,
          `เลือกใช้สมการ vᵧ = uᵧ + gt`,
          `แทนค่า vᵧ = ${u.toFixed(0)} + (−9.8)(${t})`,
          `คำนวณ gt = ${signed(gravityChange)} m/s จึงได้ vᵧ = ${signed(v)} m/s`
        ]
      };
    }

    const u = hasRandomBase ? baseValue + n : 30 + (n % 10);
    const s = hasRandomBase
      ? Math.max(0.01, Math.floor((u * u / (4 * Math.abs(G))) * 100) / 100)
      : 12 + (n % 6);
    const sText = hasRandomBase ? s.toFixed(2) : s.toFixed(0);
    const radicand = u * u + 2 * G * s;
    const vMag = Math.sqrt(radicand);
    const v = -vMag; // กำลังตกกลับลงมา
    return {
      familyId: 4,
      baseValue: hasRandomBase ? baseValue : null,
      familyName: "สมการ 4 · vᵧ² = uᵧ² + 2gSᵧ",
      text: `โยนลูกบอลขึ้นในแนวดิ่งด้วยความเร็วต้น ${hasRandomBase ? `uᵧ = ${baseValue} + ${n} = ` : ""}+${u.toFixed(0)} m/s ขณะลูกบอลกำลังตกกลับลงมาและอยู่สูงจากจุดปล่อย ${sText} m จงหาความเร็ว vᵧ ณ ตำแหน่งนั้น`,
      answer: v,
      unit: "m/s",
      target: "vᵧ",
      known: `uᵧ = +${u.toFixed(0)} m/s, Sᵧ = +${sText} m, g = −9.8 m/s² และ “กำลังตกลง”`,
      formula: `vᵧ² = uᵧ² + 2gSᵧ`,
      substitution: `vᵧ² = (${u.toFixed(0)})² + 2(−9.8)(${sText}) = ${radicand.toFixed(2)} ⇒ |vᵧ| = ${fmt(vMag)} m/s และเพราะกำลังตกลง จึง vᵧ = −${fmt(vMag)} m/s`,
      solutionSteps: [
        hasRandomBase
          ? `คำนวณความเร็วต้น: uᵧ = ${baseValue} + ${n} = +${u.toFixed(0)} m/s`
          : `กำหนดความเร็วต้น uᵧ = +${u.toFixed(0)} m/s`,
        `กำหนดแกน +y ชี้ขึ้น จึงมี uᵧ = +${u.toFixed(0)} m/s, Sᵧ = +${sText} m และ g = −9.8 m/s²`,
        `เลือกใช้สมการ vᵧ² = uᵧ² + 2gSᵧ`,
        `แทนค่า vᵧ² = (${u.toFixed(0)})² + 2(−9.8)(${sText}) = ${radicand.toFixed(2)}`,
        `ถอดรากได้ |vᵧ| = √${radicand.toFixed(2)} = ${fmt(vMag)} m/s แต่โจทย์ระบุว่าลูกบอลกำลังตกลง จึงเลือก vᵧ = −${fmt(vMag)} m/s`
      ]
    };
  }

  function makeQ2(studentNo, baseU = 30) {
    const n = clampStudentNo(studentNo);
    const u = baseU + n;
    const tTop = u / 9.8;
    const hMax = (u * u) / (2 * 9.8);
    return { n, baseU, u, tTop, hMax };
  }

  /* Theme management */
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    setTheme(theme);
  }

  function setTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem(THEME_KEY, theme);
    updateThemeToggleIcons(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
  }

  function updateThemeToggleIcons(theme) {
    const btns = document.querySelectorAll(".theme-toggle");
    btns.forEach(btn => {
      btn.innerHTML = theme === "dark" ? "☀️" : "🌙";
      btn.setAttribute("title", theme === "dark" ? "เปลี่ยนเป็น Light Mode" : "เปลี่ยนเป็น Dark Mode");
    });
  }

  /* Scroll Reveal Observer */
  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal-on-scroll").forEach(el => observer.observe(el));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initScrollReveal();

    document.querySelectorAll(".theme-toggle").forEach(btn => {
      btn.addEventListener("click", toggleTheme);
    });
  });

  // Export to global scope
  window.CoolnutFreeFall = {
    G,
    TOL,
    clampStudentNo,
    pickRandom,
    randomFamily,
    randomInt,
    withinTolerance,
    fmt,
    signed,
    signOf,
    unitText,
    makeQ1,
    makeQ2,
    toggleTheme,
    setTheme
  };
})();
