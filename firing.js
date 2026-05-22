/* firing.js — منطق قرارات الفصل */
(function () {
  'use strict';

  let generatedText = '';

  /* ── DOM refs ── */
  const reasonInp     = document.getElementById('firing-reason');
  const payMethodSel  = document.getElementById('payment-method');
  const invRow        = document.getElementById('invoice-row');
  const invUrl        = document.getElementById('invoice-url');
  
  const paramId       = document.getElementById('paramedic-id');
  const paramCode     = document.getElementById('paramedic-code');
  const paramName     = document.getElementById('paramedic-name');
  
  const banDurSel     = document.getElementById('ban-duration');
  const fineAmSel     = document.getElementById('fine-amount');
  const approverId    = document.getElementById('approver-id');
  const finalBanChk   = document.getElementById('final-ban');
  const errorEl       = document.getElementById('lv-error');

  /* ── UI Logic ── */
  window.updateForm = function () {
    if (payMethodSel.value === 'فاتورة') {
      invRow.style.display = 'flex';
    } else {
      invRow.style.display = 'none';
      invUrl.value = ''; // clear when hidden
    }
  };

  /* ── Generate ── */
  window.issueFiring = function () {
    const errs = [];
    
    // Vals
    const reasonVal = reasonInp.value.trim();
    const payM      = payMethodSel.value;
    const invUrlVal = invUrl.value.trim();
    const pid       = paramId.value.trim();
    const pcod      = paramCode.value.trim();
    const pnam      = paramName.value.trim();
    const ban       = banDurSel.value;
    const fine      = fineAmSel.value;
    const apprv     = approverId.value.trim();

    // Validation
    if (!reasonVal) errs.push('• سبب الفصل مطلوب');
    if (!pid)       errs.push('• معرّف المسعف مطلوب');
    if (!pcod)      errs.push('• كود المسعف مطلوب');
    if (!pnam)      errs.push('• الاسم مطلوب');
    if (!apprv)     errs.push('• معرّف الاعتماد مطلوب');
    const roleReqBox = document.getElementById('role-request-check');
    if (roleReqBox && !roleReqBox.checked) errs.push('• يرجى تأكيد طلب رول');
    
    if (payM === 'فاتورة' && !invUrlVal) {
      errs.push('• يجب إدخال رابط الفاتورة');
    }

    if (errs.length) {
      errorEl.innerHTML = errs.join('<br/>');
      errorEl.classList.add('visible');
      return;
    }
    errorEl.classList.remove('visible');

    // Build the withdrawal type line
    let withLine = '';
    if (payM === 'فاتورة') {
      withLine = `\`نوع السحب : \`  [فاتورة](${invUrlVal})`;
    } else {
      withLine = `\`نوع السحب : \`  [رقابي]`;
    }

    const finalBanLine = finalBanChk.checked ? `\nرابعاً: منع نهائي من الهلال الاحمر` : '';

    // Build template
    generatedText = 
`*** ▬▬▬ ﷽ ▬▬
\`\`\`diff

-الموضوع : قرار فصل 
\`\`\`
\`\`\`cs
# بعد الاطلاع على نظام التوظيف والترقيات وانهاء الخدمة الصادر من ادارة الهلال الاحمر قررنا مايلي 
 
اولاً: تنهى خدمات المسعف ادناه اعتبارا من تاريخه
ثانيا: منع توظيف ${ban} يوم
ثالثا: غرامه مالية قدرها ${fine} تسلم الى خزينة الهلال الاحمر${finalBanLine}


\`\`\`
<@${pid}>  
[${pcod}] ${pnam}

\`\`\`وذلك بسبب : ${reasonVal} \`\`\`

${withLine}

\`اعتماد:\` <@${apprv}>                  

يرسل الاصل الى : 
<@&1404535885864632340> ***`;

    // Output
    const card = document.getElementById('lv-output-card');
    const pre  = document.getElementById('lv-output-text');
    pre.textContent = generatedText;
    card.classList.add('visible');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    document.getElementById('btn-copy').disabled = false;
  };

  /* ── Copy ── */
  window.copyFiring = function () {
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

  // Init display
  window.updateForm();

})();
