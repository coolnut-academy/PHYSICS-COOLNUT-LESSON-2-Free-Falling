/**
 * Physics Coolnut Lesson — Free Falling
 * Exam Page Logic
 */

(() => {
  "use strict";

  const {
    clampStudentNo,
    randomFamily,
    randomInt,
    withinTolerance,
    fmt,
    signOf,
    signed,
    unitText,
    makeQ1,
    makeQ2
  } = window.CoolnutFreeFall;

  const DURATION_MS = 10 * 60 * 1000;
  const SESSION_KEY = "coolnut_freefall_exam_v1";
  const HISTORY_KEY = "coolnut_freefall_results_v1";

  let exam = null;
  let timerId = null;
  let submitted = false;

  const $ = (id) => document.getElementById(id);
  const ANSWER_FIELD_IDS = [
    "examQ1Sign",
    "examQ1Value",
    "examQ1Unit",
    "examQ2Time",
    "examQ2TimeUnit",
    "examQ2Height",
    "examQ2HeightUnit"
  ];

  function setExamControlsDisabled(disabled) {
    ANSWER_FIELD_IDS.forEach(id => {
      const field = $(id);
      if (field) field.disabled = disabled;
    });
    if ($("submitExam")) $("submitExam").disabled = disabled;
  }

  function formatElapsed(ms) {
    const maxSeconds = Math.floor(DURATION_MS / 1000);
    const totalSeconds = Math.min(maxSeconds, Math.max(0, Math.ceil(ms / 1000)));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function formatFinishedAt(timestamp) {
    return new Date(timestamp).toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "medium"
    });
  }

  function parseStudentNo(val) {
    const n = Number.parseInt(val, 10);
    if (!Number.isFinite(n) || n < 1 || n > 99) return null;
    return n;
  }

  function currentDraft() {
    return {
      q1Sign: $("examQ1Sign") ? $("examQ1Sign").value : "",
      q1Value: $("examQ1Value") ? $("examQ1Value").value : "",
      q1Unit: $("examQ1Unit") ? $("examQ1Unit").value : "",
      q2Time: $("examQ2Time") ? $("examQ2Time").value : "",
      q2TimeUnit: $("examQ2TimeUnit") ? $("examQ2TimeUnit").value : "",
      q2Height: $("examQ2Height") ? $("examQ2Height").value : "",
      q2HeightUnit: $("examQ2HeightUnit") ? $("examQ2HeightUnit").value : ""
    };
  }

  function countAnsweredFields() {
    const d = currentDraft();
    let count = 0;
    if (d.q1Sign) count++;
    if (d.q1Value !== "") count++;
    if (d.q1Unit) count++;
    if (d.q2Time !== "") count++;
    if (d.q2TimeUnit) count++;
    if (d.q2Height !== "") count++;
    if (d.q2HeightUnit) count++;
    return count;
  }

  function updateProgress() {
    const answered = countAnsweredFields();
    const pill = $("progressPill");
    if (pill) {
      pill.textContent = `${answered}/7 ช่อง`;
    }
  }

  function saveSession() {
    if (!exam || submitted) return;
    exam.draft = currentDraft();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(exam));
    updateProgress();
  }

  function restoreDraft(draft = {}) {
    if ($("examQ1Sign")) $("examQ1Sign").value = draft.q1Sign || "";
    if ($("examQ1Value")) $("examQ1Value").value = draft.q1Value || "";
    if ($("examQ1Unit")) $("examQ1Unit").value = draft.q1Unit || "";
    if ($("examQ2Time")) $("examQ2Time").value = draft.q2Time || "";
    if ($("examQ2TimeUnit")) $("examQ2TimeUnit").value = draft.q2TimeUnit || "";
    if ($("examQ2Height")) $("examQ2Height").value = draft.q2Height || "";
    if ($("examQ2HeightUnit")) $("examQ2HeightUnit").value = draft.q2HeightUnit || "";
    updateProgress();
  }

  function renderExam() {
    const q1 = makeQ1(exam.studentNo, exam.familyId, exam.q1Base);
    const q2 = makeQ2(exam.studentNo, exam.q2Base);
    exam.q1 = q1;
    exam.q2 = q2;

    $("intro").classList.add("hidden");
    $("startPanel").classList.add("hidden");
    $("examPanel").classList.add("show");

    $("metaName").textContent = exam.name;
    $("metaClass").textContent = `ชั้น ${exam.className}`;
    $("metaNo").textContent = `เลขที่ ${exam.studentNo}`;
    $("examQ1Text").textContent = q1.text;
    $("examQ2Text").innerHTML = `โยนวัตถุขึ้นในแนวดิ่งด้วยความเร็วต้น <b>uᵧ = ${exam.q2Base} + ${exam.studentNo} = +${q2.u} m/s</b> จงหา (1) เวลาที่ขึ้นถึงจุดสูงสุด และ (2) ความสูงสูงสุดจากจุดปล่อย`;

    setExamControlsDisabled(false);
    restoreDraft(exam.draft);
    attachDraftListeners();
    startTimer();
  }

  function attachDraftListeners() {
    ANSWER_FIELD_IDS.forEach(id => {
      const el = $(id);
      if (el) {
        el.removeEventListener("input", saveSession);
        el.removeEventListener("change", saveSession);
        el.addEventListener("input", saveSession);
        el.addEventListener("change", saveSession);
      }
    });
  }

  function startExam() {
    const name = $("studentName").value.trim();
    const className = $("studentClass").value.trim();
    const studentNo = parseStudentNo($("studentNo").value);
    const error = $("startError");
    error.textContent = "";

    if (!name || !className || studentNo === null) {
      error.textContent = "กรุณากรอกชื่อ ชั้น และเลขที่ 1–99 ให้ครบถ้วน";
      return;
    }

    const now = Date.now();
    exam = {
      name,
      className,
      studentNo,
      familyId: randomFamily(),
      q1Base: randomInt(1, 99),
      q2Base: randomInt(1, 99),
      startedAt: now,
      deadline: now + DURATION_MS,
      draft: {}
    };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(exam));
    renderExam();
  }

  function startTimer() {
    if (timerId) clearInterval(timerId);

    const tick = () => {
      if (!exam || submitted) return;
      const remain = Math.max(0, exam.deadline - Date.now());
      const totalSec = Math.ceil(remain / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      $("timer").textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      $("timer").classList.toggle("danger", remain <= 60_000);

      if (remain <= 0) {
        clearInterval(timerId);
        $("timer").textContent = "00:00";
        submitExam(true);
      }
    };

    tick();
    timerId = setInterval(tick, 250);
  }

  function allAnswered() {
    return countAnsweredFields() === 7;
  }

  function gradeQ1(q1, draft) {
    const v = Number(draft.q1Value);
    const magOk = draft.q1Value !== "" && withinTolerance(Math.abs(v), Math.abs(q1.answer));
    const signOk = draft.q1Sign === signOf(q1.answer);
    const unitOk = draft.q1Unit === q1.unit;
    const score = (magOk ? 1 : 0) + (signOk ? .5 : 0) + (unitOk ? .5 : 0);
    return { magOk, signOk, unitOk, score };
  }

  function gradeQ2(q2, draft) {
    const t = Number(draft.q2Time);
    const h = Number(draft.q2Height);
    const timeOk = draft.q2Time !== "" && withinTolerance(t, q2.tTop);
    const timeUnitOk = draft.q2TimeUnit === "s";
    const heightOk = draft.q2Height !== "" && withinTolerance(h, q2.hMax);
    const heightUnitOk = draft.q2HeightUnit === "m";
    const score21 = (timeOk ? 1 : 0) + (timeUnitOk ? .5 : 0);
    const score22 = (heightOk ? 1 : 0) + (heightUnitOk ? .5 : 0);
    return { timeOk, timeUnitOk, heightOk, heightUnitOk, score21, score22 };
  }

  function badge(ok, text) {
    return `<span class="status ${ok ? "ok" : "no"}">${ok ? "✓" : "✗"} ${text}</span>`;
  }

  function animateScore(targetScore) {
    const el = $("finalScore");
    if (!el) return;
    let current = 0;
    const duration = 1200; // ms
    const step = 20;
    const increment = targetScore / (duration / step);

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        current = targetScore;
        clearInterval(timer);
      }
      el.textContent = current.toFixed(2);
    }, step);
  }

  function triggerConfetti() {
    const canvas = $("confettiCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ["#2563eb", "#f6c945", "#138a5b", "#ef4444", "#8b5cf6"];

    for (let i = 0; i < 90; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 3 + 2,
        speedX: Math.random() * 2 - 1,
        rotation: Math.random() * 360,
        rotSpeed: Math.random() * 6 - 3
      });
    }

    let frames = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frames++;
      if (frames < 200) {
        requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    draw();
  }

  function triggerDancingCat() {
    const overlay = $("catOverlay");
    if (!overlay) return;

    // Reset GIF animation to play from start
    const img = overlay.querySelector("img");
    if (img) {
      const src = img.src;
      img.src = "";
      img.src = src;
    }

    overlay.classList.add("show");

    // Fade out smoothly after 3 seconds
    setTimeout(() => {
      overlay.classList.remove("show");
    }, 3000);
  }

  function submitExam(force = false) {
    if (!exam || submitted) return;
    const submitError = $("submitError");
    if (submitError) submitError.textContent = "";
    const now = Date.now();

    // A click racing with the final timer tick must still be treated as a timeout.
    if (!force && now >= exam.deadline) force = true;

    if (!force && !allAnswered()) {
      if (submitError) submitError.textContent = "ยังตอบไม่ครบ กรุณาตรวจเครื่องหมาย ค่าตัวเลข และหน่วยทุกช่อง";
      return;
    }

    submitted = true;
    if (timerId) clearInterval(timerId);
    const finishedAtMs = force ? exam.deadline : now;
    const startedAtMs = Number.isFinite(exam.startedAt) ? exam.startedAt : exam.deadline - DURATION_MS;
    const elapsedMs = Math.min(DURATION_MS, Math.max(0, finishedAtMs - startedAtMs));
    const finishedAt = formatFinishedAt(finishedAtMs);
    const elapsed = formatElapsed(elapsedMs);
    const draft = currentDraft();
    setExamControlsDisabled(true);
    const q1 = makeQ1(exam.studentNo, exam.familyId, exam.q1Base);
    const q2 = makeQ2(exam.studentNo, exam.q2Base);
    const g1 = gradeQ1(q1, draft);
    const g2 = gradeQ2(q2, draft);
    const total = g1.score + g2.score21 + g2.score22;

    sessionStorage.removeItem(SESSION_KEY);

    $("examPanel").classList.remove("show");
    $("resultPanel").classList.add("show");
    $("timer").textContent = force ? "หมดเวลา" : "ส่งแล้ว";
    $("timer").classList.remove("danger");

    animateScore(total);

    $("resultStudent").textContent = `${exam.name} · ${exam.className} · เลขที่ ${exam.studentNo}${force ? " · ส่งอัตโนมัติเมื่อหมดเวลา" : ""}`;
    $("resultScoreSummary").textContent = `${total.toFixed(2)} / 5.00`;
    $("resultFinishedAt").textContent = finishedAt;
    $("resultElapsed").textContent = elapsed;
    $("breakQ1").textContent = `${g1.score.toFixed(2)} / 2.00`;
    $("breakQ21").textContent = `${g2.score21.toFixed(2)} / 1.50`;
    $("breakQ22").textContent = `${g2.score22.toFixed(2)} / 1.50`;

    $("resultQ1").innerHTML = `
      <p>${q1.text}</p>
      <div style="display:flex;gap:7px;flex-wrap:wrap">
        ${badge(g1.magOk, "ค่าตัวเลข")}
        ${badge(g1.signOk, "เครื่องหมาย")}
        ${badge(g1.unitOk, "หน่วย")}
      </div>
      <p class="muted">คำตอบที่ถูก: <b>${signed(q1.answer)} ${unitText(q1.unit)}</b></p>
    `;

    $("solutionQ1").innerHTML = `
      <b>วิธีทำทีละขั้น</b>
      <ol class="solution-steps">
        ${q1.solutionSteps.map(step => `<li>${step}</li>`).join("")}
      </ol>
      <div class="final-answer"><b>ตอบ ${q1.target} = ${signed(q1.answer)} ${unitText(q1.unit)}</b></div>
    `;

    $("resultQ2").innerHTML = `
      <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px">
        ${badge(g2.timeOk, "เวลา")}
        ${badge(g2.timeUnitOk, "หน่วยเวลา")}
        ${badge(g2.heightOk, "ความสูง")}
        ${badge(g2.heightUnitOk, "หน่วยความสูง")}
      </div>
      <p class="muted">
        เวลาไปถึงจุดสูงสุด: <b>${fmt(q2.tTop)} s</b><br>
        ความสูงสูงสุด: <b>${fmt(q2.hMax)} m</b>
      </p>
    `;

    $("solutionQ2").innerHTML = `
      <b>วิธีทำทีละขั้น</b>
      <ol class="solution-steps">
        <li>คำนวณความเร็วต้น: uᵧ = ${q2.baseU} + ${q2.n} = +${q2.u} m/s</li>
        <li>กำหนดแกน +y ชี้ขึ้น จึงมี uᵧ = +${q2.u} m/s และ g = −9.8 m/s²</li>
        <li>ที่จุดสูงสุด ความเร็วเป็น vᵧ = 0 m/s</li>
        <li>หาเวลาโดยใช้ vᵧ = uᵧ + gt<br>0 = ${q2.u} + (−9.8)t ⇒ t = ${q2.u}/9.8 = ${fmt(q2.tTop)} s</li>
        <li>หาความสูงโดยใช้ vᵧ² = uᵧ² + 2gSᵧ<br>0² = (${q2.u})² + 2(−9.8)Sᵧ ⇒ Sᵧ = ${q2.u * q2.u}/19.6 = ${fmt(q2.hMax)} m</li>
      </ol>
      <div class="final-answer">
        <b>ตอบ เวลาไปถึงจุดสูงสุด = ${fmt(q2.tTop)} s<br>ความสูงสูงสุดจากจุดปล่อย = ${fmt(q2.hMax)} m</b>
      </div>
    `;

    if (total >= 4.99) {
      triggerConfetti();
      triggerDancingCat();
    } else if (total >= 4.0) {
      triggerConfetti();
    }

    const resultRecord = {
      name: exam.name,
      className: exam.className,
      studentNo: exam.studentNo,
      score: Number(total.toFixed(2)),
      q1: Number(g1.score.toFixed(2)),
      q21: Number(g2.score21.toFixed(2)),
      q22: Number(g2.score22.toFixed(2)),
      startedAtMs,
      finishedAtMs,
      elapsedMs,
      submittedAt: finishedAt,
      finishedAt,
      timedOut: force
    };

    saveResultHistory(resultRecord);
    renderHistoryTable();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveResultHistory(record) {
    try {
      const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      history.unshift(record);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
    } catch (_) {}
  }

  function renderHistoryTable() {
    const container = $("historyTableContainer");
    if (!container) return;
    try {
      const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      if (history.length === 0) {
        container.innerHTML = `<p class="muted">ยังไม่มีประวัติการสอบ</p>`;
        return;
      }

      let html = `
        <table class="history-table">
          <thead>
            <tr>
              <th>ชื่อ-นามสกุล</th>
              <th>ชั้น/เลขที่</th>
              <th>คะแนนเต็ม 5</th>
              <th>ข้อ 1</th>
              <th>ข้อ 2.1</th>
              <th>ข้อ 2.2</th>
              <th>เวลาที่ใช้</th>
              <th>ทำเสร็จเมื่อ</th>
            </tr>
          </thead>
          <tbody>
      `;

      history.forEach(item => {
        const elapsed = Number.isFinite(item.elapsedMs) ? formatElapsed(item.elapsedMs) : "-";
        const finishedAt = item.finishedAt || item.submittedAt || "-";
        html += `
          <tr>
            <td><b>${item.name}</b></td>
            <td>${item.className} เลขที่ ${item.studentNo}</td>
            <td><b style="color:var(--blue)">${item.score.toFixed(2)}</b></td>
            <td>${item.q1.toFixed(2)}</td>
            <td>${item.q21.toFixed(2)}</td>
            <td>${item.q22.toFixed(2)}</td>
            <td>${elapsed}</td>
            <td><small class="muted">${finishedAt} ${item.timedOut ? "(หมดเวลา)" : ""}</small></td>
          </tr>
        `;
      });

      html += `</tbody></table>`;
      container.innerHTML = html;
    } catch (_) {
      container.innerHTML = `<p class="muted">ไม่สามารถดึงประวัติการสอบได้</p>`;
    }
  }

  function restoreExistingSession() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    try {
      const saved = JSON.parse(raw);
      if (!saved || !saved.deadline || !saved.studentNo) return false;
      if (!Number.isInteger(saved.q2Base) || saved.q2Base < 1 || saved.q2Base > 99) {
        saved.q2Base = 30;
      }
      exam = saved;
      renderExam();
      if (Date.now() >= exam.deadline) {
        setTimeout(() => submitExam(true), 0);
      }
      return true;
    } catch (_) {
      sessionStorage.removeItem(SESSION_KEY);
      return false;
    }
  }

  function retakeExam() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.reload();
  }

  document.addEventListener("DOMContentLoaded", () => {
    if ($("startExam")) $("startExam").addEventListener("click", startExam);
    if ($("submitExam")) $("submitExam").addEventListener("click", () => submitExam(false));
    if ($("retakeExam")) $("retakeExam").addEventListener("click", retakeExam);
    if ($("printResult")) $("printResult").addEventListener("click", () => window.print());

    renderHistoryTable();
    if (!restoreExistingSession()) setExamControlsDisabled(true);
  });
})();
