/**
 * Physics Coolnut Lesson — Free Falling
 * Index Page Logic (Practice & Revision)
 */

(() => {
  "use strict";

  const {
    clampStudentNo,
    pickRandom,
    randomInt,
    withinTolerance,
    fmt,
    signed,
    signOf,
    unitText,
    makeQ1,
    makeQ2
  } = window.CoolnutFreeFall;

  let currentQ1 = null;
  let q1HintLevel = 0;
  let q2HintLevel = 0;
  let currentQ2 = null;

  const $ = (id) => document.getElementById(id);

  function getGlobalStudentNo() {
    const el = $("studentNoGlobal");
    return el ? clampStudentNo(el.value) : 1;
  }

  function renderMathIfAvailable() {
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false
      });
    }
  }

  function resetQ1UI() {
    $("q1Sign").value = "";
    $("q1Value").value = "";
    $("q1Unit").value = "";
    $("feedbackQ1").className = "feedback";
    $("feedbackQ1").innerHTML = "";
    $("hintBoxQ1").className = "hint-box";
    $("hintBoxQ1").innerHTML = "";
    $("solutionBoxQ1").className = "solution";
    $("solutionBoxQ1").innerHTML = "";
    q1HintLevel = 0;
    $("hintQ1").textContent = "Hint 1/2";
    $("hintQ1").disabled = false;
  }

  function generateQ1() {
    const n = getGlobalStudentNo();
    const familyId = pickRandom([1, 2, 3, 4]);
    currentQ1 = makeQ1(n, familyId, randomInt(1, 99));
    resetQ1UI();
    $("q1Family").textContent = currentQ1.familyName;
    $("q1Text").innerHTML = currentQ1.text;
    renderMathIfAvailable();
  }

  function checkQ1() {
    if (!currentQ1) return;
    const rawValue = Number($("q1Value").value);
    const selectedSign = $("q1Sign").value;
    const selectedUnit = $("q1Unit").value;
    const hasValue = $("q1Value").value.trim() !== "" && Number.isFinite(rawValue);
    const magCorrect = hasValue && withinTolerance(Math.abs(rawValue), Math.abs(currentQ1.answer));
    const signCorrect = selectedSign === signOf(currentQ1.answer);
    const unitCorrect = selectedUnit === currentQ1.unit;

    const score = (magCorrect ? 1 : 0) + (signCorrect ? 0.5 : 0) + (unitCorrect ? 0.5 : 0);
    const all = magCorrect && signCorrect && unitCorrect;
    const box = $("feedbackQ1");
    box.className = `feedback show ${all ? "good" : "bad"}`;
    box.innerHTML = `
      <b>คะแนนจำลอง ${score.toFixed(2)} / 2.00</b>
      <div class="checklist">
        <div class="check ${magCorrect ? "ok" : "no"}">${magCorrect ? "✓" : "✗"} ค่าตัวเลข/ขนาด ${magCorrect ? "ถูกต้อง" : `ยังไม่ถูก (คำตอบมีขนาด ${fmt(Math.abs(currentQ1.answer))})`}</div>
        <div class="check ${signCorrect ? "ok" : "no"}">${signCorrect ? "✓" : "✗"} เครื่องหมาย ${signCorrect ? "ถูกต้อง" : `ควรเป็น ${signOf(currentQ1.answer)}`}</div>
        <div class="check ${unitCorrect ? "ok" : "no"}">${unitCorrect ? "✓" : "✗"} หน่วย ${unitCorrect ? "ถูกต้อง" : `ควรเป็น ${unitText(currentQ1.unit)}`}</div>
      </div>
    `;
    renderMathIfAvailable();
  }

  function showQ1Hint() {
    if (!currentQ1) return;
    q1HintLevel += 1;
    const box = $("hintBoxQ1");
    box.className = "hint-box show";

    if (q1HintLevel === 1) {
      box.innerHTML = `<b>Hint 1:</b> เริ่มจากกำหนด +y ขึ้น แล้วถอดข้อมูลเป็นตัวแปรก่อน<br><span class="muted">${currentQ1.known}</span>`;
      $("hintQ1").textContent = "Hint 2/2";
    } else {
      box.innerHTML = `<b>Hint 2:</b> สมการที่เหมาะสมคือ <span class="eq">${currentQ1.formula}</span><br>แทนค่าพร้อมเครื่องหมายของแต่ละตัวแปร แล้วค่อยตรวจทิศทางของคำตอบ`;
      $("hintQ1").textContent = "ใช้ Hint ครบแล้ว";
      $("hintQ1").disabled = true;
    }
    renderMathIfAvailable();
  }

  function showQ1Solution() {
    if (!currentQ1) return;
    const box = $("solutionBoxQ1");
    box.className = "solution show";
    box.innerHTML = `
      <b>เฉลย</b><br>
      1) ${currentQ1.known}<br>
      2) ใช้ <span class="eq">${currentQ1.formula}</span><br>
      3) ${currentQ1.substitution}<br>
      <b>ตอบ ${currentQ1.target} = ${signed(currentQ1.answer)} ${unitText(currentQ1.unit)}</b>
    `;
    renderMathIfAvailable();
  }

  function resetQ2UI() {
    $("q2Time").value = "";
    $("q2TimeUnit").value = "";
    $("q2Height").value = "";
    $("q2HeightUnit").value = "";
    $("feedbackQ2").className = "feedback";
    $("feedbackQ2").innerHTML = "";
    $("hintBoxQ2").className = "hint-box";
    $("hintBoxQ2").innerHTML = "";
    $("solutionBoxQ2").className = "solution";
    $("solutionBoxQ2").innerHTML = "";
    q2HintLevel = 0;
    $("hintQ2").textContent = "Hint 1/2";
    $("hintQ2").disabled = false;
  }

  function buildQ2() {
    const n = getGlobalStudentNo();
    currentQ2 = makeQ2(n, randomInt(1, 99));
    resetQ2UI();
    $("q2Text").innerHTML = `โยนวัตถุขึ้นในแนวดิ่งจากจุดปล่อยด้วยความเร็วต้น <b>uᵧ = ${currentQ2.baseU} + ${n} = +${currentQ2.u} m/s</b> จงหา (1) เวลาที่ขึ้นถึงจุดสูงสุด และ (2) ความสูงสูงสุดจากจุดปล่อย`;
    renderMathIfAvailable();
  }

  function checkQ2() {
    if (!currentQ2) return;

    const time = Number($("q2Time").value);
    const height = Number($("q2Height").value);
    const timeOk = $("q2Time").value.trim() !== "" && withinTolerance(time, currentQ2.tTop);
    const timeUnitOk = $("q2TimeUnit").value === "s";
    const heightOk = $("q2Height").value.trim() !== "" && withinTolerance(height, currentQ2.hMax);
    const heightUnitOk = $("q2HeightUnit").value === "m";

    const score = (timeOk ? 1 : 0) + (timeUnitOk ? 0.5 : 0) + (heightOk ? 1 : 0) + (heightUnitOk ? 0.5 : 0);
    const all = timeOk && timeUnitOk && heightOk && heightUnitOk;
    const box = $("feedbackQ2");
    box.className = `feedback show ${all ? "good" : "bad"}`;
    box.innerHTML = `
      <b>คะแนนจำลอง ${score.toFixed(2)} / 3.00</b>
      <div class="checklist">
        <div class="check ${timeOk ? "ok" : "no"}">${timeOk ? "✓" : "✗"} เวลา ${timeOk ? "ถูกต้อง" : `ควรได้ ${fmt(currentQ2.tTop)}`}</div>
        <div class="check ${timeUnitOk ? "ok" : "no"}">${timeUnitOk ? "✓" : "✗"} หน่วยเวลา ${timeUnitOk ? "ถูกต้อง" : "ควรเป็น s"}</div>
        <div class="check ${heightOk ? "ok" : "no"}">${heightOk ? "✓" : "✗"} ความสูงสูงสุด ${heightOk ? "ถูกต้อง" : `ควรได้ ${fmt(currentQ2.hMax)}`}</div>
        <div class="check ${heightUnitOk ? "ok" : "no"}">${heightUnitOk ? "✓" : "✗"} หน่วยความสูง ${heightUnitOk ? "ถูกต้อง" : "ควรเป็น m"}</div>
      </div>
    `;
    renderMathIfAvailable();
  }

  function showQ2Hint() {
    if (!currentQ2) return;
    q2HintLevel += 1;
    const box = $("hintBoxQ2");
    box.className = "hint-box show";

    if (q2HintLevel === 1) {
      box.innerHTML = `<b>Hint 1:</b> ที่จุดสูงสุด <b>vᵧ = 0 m/s</b> และตลอดโจทย์ใช้ <b>g = −9.8 m/s²</b>`;
      $("hintQ2").textContent = "Hint 2/2";
    } else {
      box.innerHTML = `<b>Hint 2:</b> หาเวลาโดยใช้ <span class="eq">vᵧ = uᵧ + gt</span> และหาความสูงโดยใช้ <span class="eq">vᵧ² = uᵧ² + 2gSᵧ</span>`;
      $("hintQ2").textContent = "ใช้ Hint ครบแล้ว";
      $("hintQ2").disabled = true;
    }
    renderMathIfAvailable();
  }

  function showQ2Solution() {
    if (!currentQ2) return;
    const box = $("solutionBoxQ2");
    box.className = "solution show";
    box.innerHTML = `
      <b>เฉลย</b><br>
      กำหนด uᵧ = +${currentQ2.u} m/s, vᵧ = 0 m/s, g = −9.8 m/s²<br><br>
      <b>1) เวลาไปถึงจุดสูงสุด</b><br>
      0 = ${currentQ2.u} + (−9.8)t<br>
      t = ${currentQ2.u}/9.8 = <b>${fmt(currentQ2.tTop)} s</b><br><br>
      <b>2) ความสูงสูงสุด</b><br>
      0² = (${currentQ2.u})² + 2(−9.8)Sᵧ<br>
      Sᵧ = (${currentQ2.u})²/19.6 = <b>${fmt(currentQ2.hMax)} m</b>
    `;
    renderMathIfAvailable();
  }

  function handleStudentNoChange() {
    const el = $("studentNoGlobal");
    if (el) {
      const n = clampStudentNo(el.value);
      el.value = n;
      generateQ1();
      buildQ2();
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("newQ1").addEventListener("click", generateQ1);
    $("checkQ1").addEventListener("click", checkQ1);
    $("hintQ1").addEventListener("click", showQ1Hint);
    $("solutionQ1").addEventListener("click", showQ1Solution);

    $("checkQ2").addEventListener("click", checkQ2);
    $("hintQ2").addEventListener("click", showQ2Hint);
    $("solutionQ2").addEventListener("click", showQ2Solution);

    const studentNoEl = $("studentNoGlobal");
    if (studentNoEl) {
      studentNoEl.addEventListener("change", handleStudentNoChange);
      studentNoEl.addEventListener("input", handleStudentNoChange);
    }

    generateQ1();
    buildQ2();
  });
})();
