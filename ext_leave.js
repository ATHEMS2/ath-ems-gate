/* ext_leave.js — منطق نموذج الإجازة الخارجية */
(function () {
  'use strict';

  const SA_TZ = 'Asia/Riyadh'; // توقيت السعودية UTC+3

  /* ── Get today's date in Saudi timezone ── */
  function getSaudiDateParts(date) {
    const opts = { timeZone: SA_TZ, year: 'numeric', month: '2-digit', day: '2-digit' };
    const parts = new Intl.DateTimeFormat('en-CA', opts).formatToParts(date);
    // en-CA gives YYYY-MM-DD parts
    const p = {};
    parts.forEach(x => { p[x.type] = x.value; });
    return { y: parseInt(p.year), m: parseInt(p.month), d: parseInt(p.day) };
  }

  /* Format date as YYYY/MM/DD */
  function fmtDate(dateObj) {
    return `${dateObj.y}/${String(dateObj.m).padStart(2,'0')}/${String(dateObj.d).padStart(2,'0')}`;
  }

  /* Add N days to a Saudi date (year/month/day object) */
  function addDaysSaudi(parts, n) {
    // Build a UTC-safe date at noon Saudi time to avoid DST issues
    const saOffsetMs = 3 * 3600000;
    const utcBase = Date.UTC(parts.y, parts.m - 1, parts.d, 12, 0) - saOffsetMs;
    const newDate  = new Date(utcBase + n * 86400000);
    return getSaudiDateParts(newDate);
  }

  /* ── DOM refs ── */
  const daysInput    = document.getElementById('days');
  const startDisplay = document.getElementById('start-date-display');
  const endDisplay   = document.getElementById('end-date-display');

  /* ── Init: show today ── */
  const todayParts = getSaudiDateParts(new Date());
  startDisplay.textContent = fmtDate(todayParts);

  /* ── Live update end date ── */
  function updateEndDate() {
    const n = parseInt(daysInput.value);
    if (!isNaN(n) && n > 0) {
      const endParts = addDaysSaudi(todayParts, n);
      endDisplay.textContent = fmtDate(endParts);
      endDisplay.classList.add('active');
    } else {
      endDisplay.textContent = '—';
      endDisplay.classList.remove('active');
    }
  }

  daysInput.addEventListener('input', updateEndDate);

  /* ── Return Toggle ── */
  window.toggleReturnMode = function() {
    const isReturn = document.getElementById('return-leave-check').checked;
    document.getElementById('days-field').style.display = isReturn ? 'none' : 'flex';
    document.getElementById('editor-field').style.display = isReturn ? 'flex' : 'none';
    const datesRow = document.querySelector('.ext-dates-row');
    if (datesRow) datesRow.style.display = isReturn ? 'none' : 'flex';
    const roleReq = document.getElementById('role-request-check');
    if (roleReq) roleReq.parentElement.style.display = isReturn ? 'none' : 'flex';
  };

  /* ── Issue ── */
  let generatedText = '';

  window.issueExtLeave = function () {
    const paramId = document.getElementById('paramedic-id').value.trim();
    const isReturn = document.getElementById('return-leave-check') ? document.getElementById('return-leave-check').checked : false;
    const editorId = document.getElementById('editor-id') ? document.getElementById('editor-id').value.trim() : '';

    const n       = parseInt(daysInput.value);
    const errorEl = document.getElementById('lv-error');

    const errs = [];
    if (!paramId)          errs.push('• معرّف المسعف مطلوب');
    
    if (isReturn) {
      if (!editorId) errs.push('• معرّف الإعتماد مطلوب');
    } else {
      if (isNaN(n) || n < 1) errs.push('• عدد الأيام يجب أن يكون 1 على الأقل');
      const roleReqBox = document.getElementById('role-request-check');
      if (roleReqBox && !roleReqBox.checked) errs.push('• يرجى تأكيد طلب رول');
    }

    if (errs.length) {
      errorEl.innerHTML = errs.join('<br/>');
      errorEl.classList.add('visible');
      return;
    }
    errorEl.classList.remove('visible');

    const todayStr = fmtDate(todayParts);

    if (isReturn) {
      generatedText =
`***﷽

\`الموضوع :\` انتهاء إجازة خارجية

 \`للمسعف المحترم :\` <@${paramId}>   

\`تاريخ الانتهاء :\`   ${todayStr} 

\`توقيع واعتماد :\` <@${editorId}>

\`يرسل الاصل الى :\` <@&1404535885864632340>***`;
    } else {
      const startStr = fmtDate(todayParts);
      const endParts = addDaysSaudi(todayParts, n);
      const endStr   = fmtDate(endParts);
      const dayWord  = n === 1 ? 'يوم' : 'يوم';

      generatedText =
`***﷽

\` الموضوع :\` إجازة خارجيه

\` للمسعف المحترم :\` <@${paramId}>

\` مدة الإجازة :\`  ${n} ${dayWord} 

\` من تاريخ :\`  ${startStr}

\` إلى تاريخ :\`  ${endStr}

[يرجى قراءه القوانين قبل اخذ اجازه خارجية](https://discord.com/channels/1404512396923375696/1404536315537526794/1471261658969014393)

\` يرسل الاصل الى :\` <@&1404535885864632340>***`;
    }

    const card = document.getElementById('lv-output-card');
    const pre  = document.getElementById('lv-output-text');
    pre.textContent = generatedText;
    card.classList.add('visible');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    document.getElementById('btn-copy').disabled = false;
  };

  /* ── Copy ── */
  window.copyExtLeave = function () {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText).then(() => {
      flashBtn(document.getElementById('btn-copy'), '✅ تم النسخ');
      const hBtn = document.querySelector('.lv-output-copy-btn');
      if (hBtn) flashBtn(hBtn, '✅ تم النسخ');
    });
  };

  function flashBtn(btn, msg) {
    const orig = btn.innerHTML;
    btn.innerHTML = msg;
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.classList.remove('copied');
    }, 2200);
  }

})();
