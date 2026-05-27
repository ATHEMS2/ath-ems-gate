/* leave2.js — منطق نموذج الإجازة (التصميم الجديد) */
(function () {
  'use strict';

  /* ── Helpers ── */
  const SA_TZ = 'Asia/Riyadh'; // توقيت السعودية UTC+3

  function getSaudiNow() {
    // Returns a Date adjusted so that .getHours()/.getMinutes() etc. reflect Saudi time
    const now = new Date();
    const saStr = now.toLocaleString('en-US', { timeZone: SA_TZ });
    return new Date(saStr);
  }

  function formatArabicFull(date) {
    // Format using Saudi timezone
    const opts = { timeZone: SA_TZ, hour: '2-digit', minute: '2-digit', hour12: true,
                   year: 'numeric', month: '2-digit', day: '2-digit' };
    const parts = new Intl.DateTimeFormat('en-US', opts).formatToParts(date);
    const p = {};
    parts.forEach(x => { p[x.type] = x.value; });
    const ampm = p.dayPeriod === 'AM' ? 'ص' : 'م';
    return `${p.hour}:${p.minute} ${ampm} | ${p.year}/${p.month}/${p.day}`;
  }

  function formatTimeShort(date) {
    const opts = { timeZone: SA_TZ, hour: '2-digit', minute: '2-digit', hour12: true };
    const parts = new Intl.DateTimeFormat('en-US', opts).formatToParts(date);
    const p = {};
    parts.forEach(x => { p[x.type] = x.value; });
    const ampm = p.dayPeriod === 'AM' ? 'ص' : 'م';
    return `${p.hour}:${p.minute} ${ampm}`;
  }

  function addHours(date, hrs) {
    return new Date(date.getTime() + hrs * 3600000);
  }

  function formatDuration(hrs) {
    if (Number.isInteger(hrs))
      return hrs === 1 ? '1 ساعة' : `${hrs} ساعة`;
    const h = Math.floor(hrs);
    const m = Math.round((hrs - h) * 60);
    if (h === 0) return `${m} دقيقة`;
    return `${h} ساعة و ${m} دقيقة`;
  }

  /* ── LEAVE TEMPLATE ── */
  window.HLAL_LEAVE_DEFAULT_TEMPLATE = `***﷽

\` الموضوع :\` إجازة داخلية

\` للمسعف المحترم :\` <@{{paramId}}>

\` مدة الإجازة :\`  {{duration}} 

\` الرصيد المتبقي :\`  {{remaining}} ساعة 

\` من الساعة :\` {{startTime}}

\` إلى الساعة :\` {{endTime}}

[يرجى قراءه قوانين الإجازات قبل تغيير الوظيفة](https://discord.com/channels/1404512396923375696/1404536315537526794/1509034080019288104)

\` يرسل الاصل الى :\` <@&1404535885864632340>***`;

  /* ── Grab elements ── */
  const startDisplay   = document.getElementById('start-time-display');
  const startOverride  = document.getElementById('start-override');
  const durationInput  = document.getElementById('duration');
  const balanceInput   = document.getElementById('balance');
  const remainingEl    = document.getElementById('remaining-display');

  /* ── Tick: update start time display ── */
  function tick() {
    if (startOverride && !startOverride.value) {
      startDisplay.textContent = formatTimeShort(new Date());
    }
  }
  tick();
  setInterval(tick, 15000);

  /* ── Override time input changes ── */
  startOverride.addEventListener('change', () => {
    if (startOverride.value) {
      const [hh, mm] = startOverride.value.split(':').map(Number);
      const d = new Date();
      d.setHours(hh, mm, 0, 0);
      startDisplay.textContent = formatTimeShort(d);
    } else {
      startDisplay.textContent = formatTimeShort(new Date());
    }
    updateRemaining();
  });

  /* ── Live remaining balance calc ── */
  function updateRemaining() {
    const dur = parseFloat(durationInput.value);
    const bal = parseFloat(balanceInput.value);
    if (!isNaN(dur) && !isNaN(bal)) {
      const rem = bal - dur;
      remainingEl.textContent = rem % 1 === 0 ? rem : rem.toFixed(1);
      remainingEl.className = 'lv-auto-val' + (rem < 0 ? ' negative' : '');
    } else {
      remainingEl.textContent = '—';
      remainingEl.className = 'lv-auto-val';
    }
  }

  durationInput.addEventListener('input', updateRemaining);
  balanceInput.addEventListener('input', updateRemaining);

  /* ── Resolve start date ── */
  function getStartDate() {
    if (startOverride.value) {
      // Build a date in Saudi timezone from the time override input
      const [hh, mm] = startOverride.value.split(':').map(Number);
      // Get current Saudi date components
      const saDateStr = new Date().toLocaleDateString('en-CA', { timeZone: SA_TZ }); // YYYY-MM-DD
      const [yr, mo, dy] = saDateStr.split('-').map(Number);
      // Create UTC date matching that Saudi local time
      const saOffsetMs = 3 * 3600000; // UTC+3
      const utcMs = Date.UTC(yr, mo - 1, dy, hh, mm) - saOffsetMs;
      return new Date(utcMs);
    }
    return new Date();
  }

  /* ── Issue (Generate) ── */
  let generatedText = '';

  // Render template with variables
  window.renderLeaveTemplate = function (template, vars) {
    if (!template) return '';
    let result = template;
    for (const key in vars) {
      if (vars.hasOwnProperty(key)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, vars[key]);
      }
    }
    return result;
  };

  window.issueLeave = function () {
    const paramId  = document.getElementById('paramedic-id').value.trim();
    const dur      = parseFloat(durationInput.value);
    const bal      = parseFloat(balanceInput.value);
    const errorEl  = document.getElementById('lv-error');

    const errs = [];
    if (!paramId)              errs.push('• معرّف المسعف مطلوب');
    if (isNaN(dur) || dur <= 0) errs.push('• المدة يجب أن تكون أكبر من صفر');
    if (isNaN(bal))            errs.push('• الرصيد الحالي مطلوب');
    const confirmBox = document.getElementById('confirm-register');
    if (confirmBox && !confirmBox.checked) errs.push('• يرجى تأكيد تسجيل الإجازة بجدول الإجازات');

    if (errs.length) {
      errorEl.innerHTML = errs.join('<br/>');
      errorEl.classList.add('visible');
      return;
    }
    errorEl.classList.remove('visible');

    const startDate = getStartDate();
    const endDate   = addHours(startDate, dur);
    const remaining = bal - dur;
    const remStr    = remaining % 1 === 0 ? `${remaining}` : `${remaining.toFixed(1)}`;

    const template = typeof getLeaveTemplate === 'function'
      ? getLeaveTemplate()
      : window.HLAL_LEAVE_DEFAULT_TEMPLATE;

    generatedText = typeof renderLeaveTemplate === 'function'
      ? renderLeaveTemplate(template, {
          paramId,
          duration: formatDuration(dur),
          remaining: remStr,
          startTime: formatArabicFull(startDate),
          endTime: formatArabicFull(endDate),
        })
      : template;

    // Show output card
    const card = document.getElementById('lv-output-card');
    const pre  = document.getElementById('lv-output-text');
    pre.textContent = generatedText;
    card.classList.add('visible');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Enable copy button
    document.getElementById('btn-copy').disabled = false;
  };

  /* ── Copy ── */
  window.copyLeave = function () {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText).then(() => {
      // Flash main copy button
      flashBtn(document.getElementById('btn-copy'), '📋', '✅ تم النسخ');
      // Flash output header copy btn
      const hBtn = document.querySelector('.lv-output-copy-btn');
      if (hBtn) flashBtn(hBtn, '📋 نسخ الصادر', '✅ تم النسخ', true);
    });
  };

  function flashBtn(btn, originalHTML, newHTML, isText = false) {
    const orig = isText ? btn.textContent : btn.innerHTML;
    if (isText) btn.textContent = newHTML;
    else btn.innerHTML = newHTML;
    btn.classList.add('copied');
    setTimeout(() => {
      if (isText) btn.textContent = orig;
      else btn.innerHTML = orig;
      btn.classList.remove('copied');
    }, 2200);
  }

})();
