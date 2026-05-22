/* role_request.js — منطق نموذج طلب الرول */
(function () {
  'use strict';

  /* ================================================================
     CONFIG — أنواع الطلبات
     ================================================================ */
  const TYPES = {
    '1': {
      label:      'ازالة الاسم , ازاله رولات الهلال , منع توظيف 14 يوم',
      reasonMode: 'select', // dropdown choices
      reasons: [
        'استقالة برتبة متدرب',
        'فصل',
        'استقالة برتبة مستوى 1',
      ],
    },
    '2': {
      label:      'ازالة الاسم , ازاله رولات الهلال , منع توظيف 7 أيام',
      reasonMode: 'auto',
      autoReason: 'استقالة برتبة مستوى 1',
    },
    '3': {
      label:      'ازالة الاسم , ازاله رولات الهلال',
      reasonMode: 'select',
      reasons: [
        'استقالة بمستوى 2',
        'استقالة بمستوى 3',
        'استقالة بمستوى 4',
        'استقالة بمستوى 5',
        'استقالة بمستوى 6',
        'استقالة بمستوى 7',
        'استقالة بمستوى 8',
        'استقالة بمستوى 9',
      ],
    },
    '4': {
      label:      'اضافة رول اجازه وظيفيه',
      reasonMode: 'auto',
      autoReason: '   اجازه خارجيه ',
    },
    '5': {
      label:      'ازالة رول اجازه وظيفيه',
      reasonMode: 'auto',
      autoReason: '   عودة من اجازه خارجيه ',
    },
  };

  /* ================================================================
     DOM refs
     ================================================================ */
  const typeSelect   = document.getElementById('request-type');
  const reasonRow    = document.getElementById('reason-row');
  const reasonSel    = document.getElementById('reason-select');
  const reasonAuto   = document.getElementById('reason-auto');

  /* ================================================================
     onTypeChange — called when user picks a type
     ================================================================ */
  window.onTypeChange = function () {
    const val  = typeSelect.value;
    const conf = TYPES[val];

    // Hide everything first
    reasonRow.style.display  = 'none';
    reasonSel.style.display  = 'none';
    reasonAuto.style.display = 'none';
    reasonSel.innerHTML      = '<option value="">— اختر السبب —</option>';

    if (!conf) return;

    reasonRow.style.display = '';

    if (conf.reasonMode === 'select') {
      // Populate dropdown
      conf.reasons.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        reasonSel.appendChild(opt);
      });
      reasonSel.style.display = '';
    } else {
      // Auto fill
      reasonAuto.textContent  = conf.autoReason;
      reasonAuto.style.display = '';
    }
  };

  /* ================================================================
     Get current reason value
     ================================================================ */
  function getReason() {
    const val  = typeSelect.value;
    const conf = TYPES[val];
    if (!conf) return null;
    if (conf.reasonMode === 'auto') return conf.autoReason;
    return reasonSel.value || null;
  }

  /* ================================================================
     Issue (Generate)
     ================================================================ */
  const MENTIONS =
`<@&1404535891351048413>  \n<@&1404535891376214137> \n<@&1404535891401117767>`;

  let generatedText = '';

  window.issueRole = function () {
    const personId = document.getElementById('person-id').value.trim();
    const typeVal  = typeSelect.value;
    const reason   = getReason();
    const errorEl  = document.getElementById('lv-error');
    const conf     = TYPES[typeVal];

    const errs = [];
    if (!personId) errs.push('• معرّف الشخص مطلوب');
    if (!typeVal)  errs.push('• نوع الطلب مطلوب');
    if (conf && conf.reasonMode === 'select' && !reason)
      errs.push('• يرجى اختيار سبب الطلب');

    if (errs.length) {
      errorEl.innerHTML = errs.join('<br/>');
      errorEl.classList.add('visible');
      return;
    }
    errorEl.classList.remove('visible');

    generatedText =
`***السلام عليكم ورحمة الله وبركاته ,,***

***\`القيادة الموقرة نطلب منكم للمسعف : \` (   <@${personId}>   ) ***

***نوع الطلب : ( ${conf.label}) ***

***\`وذلك بسبب :\` ( ${reason} ) ***

*** للعلم مع التحية /***
${MENTIONS}`;

    const card = document.getElementById('lv-output-card');
    const pre  = document.getElementById('lv-output-text');
    pre.textContent = generatedText;
    card.classList.add('visible');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    document.getElementById('btn-copy').disabled = false;
  };

  /* ================================================================
     Copy
     ================================================================ */
  window.copyRole = function () {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText).then(() => {
      flash(document.getElementById('btn-copy'));
      const hBtn = document.querySelector('.lv-output-copy-btn');
      if (hBtn) flash(hBtn);
    });
  };

  function flash(btn) {
    const orig = btn.innerHTML;
    btn.innerHTML = '✅ تم النسخ';
    btn.classList.add('copied');
    setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('copied'); }, 2200);
  }

})();
