/* leave.js — منطق نموذج الإجازة الداخلية */

(function () {
  'use strict';

  /* ---- Helpers ---- */
  const SA_TZ = 'Asia/Riyadh'; // توقيت السعودية UTC+3

  // Arabic AM/PM format using Saudi timezone: HH:MM ص/م | YYYY/MM/DD
  function formatArabic(date) {
    const opts = { timeZone: SA_TZ, hour: '2-digit', minute: '2-digit', hour12: true,
                   year: 'numeric', month: '2-digit', day: '2-digit' };
    const parts = new Intl.DateTimeFormat('en-US', opts).formatToParts(date);
    const p = {};
    parts.forEach(x => { p[x.type] = x.value; });
    const ampm = p.dayPeriod === 'AM' ? 'ص' : 'م';
    return `${p.hour}:${p.minute} ${ampm} | ${p.year}/${p.month}/${p.day}`;
  }

  // Add hours to a date
  function addHours(date, hrs) {
    return new Date(date.getTime() + hrs * 3600000);
  }

  // Format duration nicely
  function formatDuration(hrs) {
    if (Number.isInteger(hrs)) {
      return hrs === 1 ? '1 ساعة' : `${hrs} ساعة`;
    }
    const h = Math.floor(hrs);
    const m = Math.round((hrs - h) * 60);
    if (h === 0) return `${m} دقيقة`;
    return `${h} ساعة و ${m} دقيقة`;
  }

  /* ---- Live preview: times & balance ---- */
  const durationInput = document.getElementById('duration');
  const balanceInput  = document.getElementById('balance');
  const issueTimeEl   = document.getElementById('issue-time-val');
  const endTimeEl     = document.getElementById('end-time-val');
  const bpValue       = document.getElementById('bp-value');
  const bpPreview     = document.getElementById('balance-preview');

  function updatePreview() {
    const now      = new Date();
    const durationH = parseFloat(durationInput.value) || 0;
    const balanceH  = parseFloat(balanceInput.value);

    issueTimeEl.textContent = formatArabic(now);

    if (durationH > 0) {
      endTimeEl.textContent = formatArabic(addHours(now, durationH));
    } else {
      endTimeEl.textContent = '—';
    }

    if (!isNaN(balanceH)) {
      const remaining = balanceH - durationH;
      bpValue.textContent = remaining % 1 === 0 ? remaining : remaining.toFixed(1);
      bpValue.className = 'bp-value' + (remaining < 0 ? ' bp-negative' : '');
      bpPreview.style.display = 'flex';
    } else {
      bpPreview.style.display = 'none';
    }
  }

  durationInput.addEventListener('input', updatePreview);
  balanceInput.addEventListener('input', updatePreview);

  // Initial call
  updatePreview();
  setInterval(() => {
    if (!durationInput.value) issueTimeEl.textContent = formatArabic(new Date());
  }, 10000);

  /* ---- Generate Leave ---- */
  window.generateLeave = function () {
    const paramId  = document.getElementById('paramedic-id').value.trim();
    const editorId = document.getElementById('editor-id').value.trim();
    const durationH = parseFloat(durationInput.value);
    const balanceH  = parseFloat(balanceInput.value);
    const errorEl   = document.getElementById('error-msg');

    // Validation
    const errors = [];
    if (!paramId)         errors.push('• معرّف المسعف مطلوب');
    if (isNaN(durationH) || durationH <= 0) errors.push('• المدة يجب أن تكون أكبر من صفر');
    if (isNaN(balanceH))  errors.push('• الرصيد الحالي مطلوب');
    if (!editorId)        errors.push('• معرّف محرر الإجازة مطلوب');

    if (errors.length) {
      errorEl.innerHTML = errors.join('<br/>');
      errorEl.classList.add('visible');
      return;
    }
    errorEl.classList.remove('visible');

    const now         = new Date();
    const endTime     = addHours(now, durationH);
    const remaining   = balanceH - durationH;
    const durationStr = formatDuration(durationH);
    const remStr      = remaining % 1 === 0
      ? `${remaining}`
      : `${remaining.toFixed(1)}`;

    const text =
`***﷽

\` الموضوع :\` إجازة داخلية 

\` للمسعف المحترم :\` <@${paramId}>

\` مدة الإجازة :\`  ${durationStr} 

\` الرصيد المتبقي :\`  ${remStr} ساعة 

\` من الساعة :\` ${formatArabic(now)}

\` إلى الساعة :\` ${formatArabic(endTime)}

[يرجى قراءه القوانين قبل تغيير الوظيفة](https://discord.com/channels/1404512396923375696/1404536315537526794/1471261658969014393)

\` يرسل الاصل الى :\` <@&1404535885864632340>***`;

    const outputText   = document.getElementById('output-text');
    const outputResult = document.getElementById('output-result');
    const outputEmpty  = document.getElementById('output-empty');

    outputText.textContent = text;
    outputResult.style.display = 'block';
    outputEmpty.style.display  = 'none';

    // Scroll to output on mobile
    if (window.innerWidth < 900) {
      outputResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /* ---- Copy Output ---- */
  window.copyOutput = function () {
    const text = document.getElementById('output-text').textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      // Animate both copy buttons
      ['copy-btn', 'copy-btn-2'].forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;
        const original = btn.innerHTML;
        btn.innerHTML = '✅ تم نسخ الصادر';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = original;
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  };

})();
