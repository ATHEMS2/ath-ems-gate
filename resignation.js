/* resignation.js — منطق الاستقالات */
(function () {
  'use strict';

  let generatedText = '';

  /* ── DOM refs ── */
  const levelSel      = document.getElementById('level');
  const payMethodSel  = document.getElementById('payment-method');
  const payCol        = document.getElementById('payment-col');
  const penCol        = document.getElementById('penalties-col');
  const invRow        = document.getElementById('invoice-row');
  const invUrl        = document.getElementById('invoice-url');
  
  const paramId       = document.getElementById('paramedic-id');
  const paramCode     = document.getElementById('paramedic-code');
  const paramName     = document.getElementById('paramedic-name');
  
  const banDurSel     = document.getElementById('ban-duration');
  const fineAmSel     = document.getElementById('fine-amount');
  const approverId    = document.getElementById('approver-id');
  const errorEl       = document.getElementById('lv-error');

  /* ── UI Logic ── */
  window.updateForm = function () {
    const lvl = levelSel.value;
    const isBasic = (lvl === 'متدرب' || lvl === '1');

    if (isBasic) {
      // Show payment & penalties cols
      if(payCol) payCol.style.display = 'flex';
      if(penCol) penCol.style.display = 'flex';
      
      if (payMethodSel.value === 'فاتورة') {
        invRow.style.display = 'flex';
      } else {
        invRow.style.display = 'none';
        invUrl.value = ''; // clear when hidden
      }
    } else {
      // Levels 2-9: Hide payment, invoice, and penalties
      if(payCol) payCol.style.display = 'none';
      if(penCol) penCol.style.display = 'none';
      invRow.style.display = 'none';
      invUrl.value = '';
    }
  };

  /* ── Generate ── */
  window.issueResignation = function () {
    const errs = [];
    
    // Vals
    const lvl    = levelSel.value;
    const payM   = payMethodSel.value;
    const invUrlVal = invUrl.value.trim();
    const pid    = paramId.value.trim();
    const pcod   = paramCode.value.trim();
    const pnam   = paramName.value.trim();
    const ban    = banDurSel.value;
    const fine   = fineAmSel.value;
    const apprv  = approverId.value.trim();

    // Validation
    const isBasic = (lvl === 'متدرب' || lvl === '1');

    if (!pid)  errs.push('• معرّف المسعف مطلوب');
    if (!pcod) errs.push('• كود المسعف مطلوب');
    if (!pnam) errs.push('• الاسم مطلوب');
    if (!apprv) errs.push('• معرّف الاعتماد مطلوب');
    const roleReqBox = document.getElementById('role-request-check');
    if (roleReqBox && !roleReqBox.checked) errs.push('• يرجى تأكيد طلب رول');
    
    if (isBasic && payM === 'فاتورة' && !invUrlVal) {
      errs.push('• يجب إدخال رابط الفاتورة');
    }

    if (errs.length) {
      errorEl.innerHTML = errs.join('<br/>');
      errorEl.classList.add('visible');
      return;
    }
    errorEl.classList.remove('visible');

    // Build the specific template based on the level
    if (isBasic) {
      let withLine = '';
      if (payM === 'فاتورة') {
        withLine = `\`نوع السحب :\`  [فاتورة](${invUrlVal})`;
      } else {
        withLine = `\`نوع السحب :\`  رقابي`; // updated to رقابي
      }

      const lvlText = lvl === 'متدرب' ? 'استقالة برتبة متدرب' : 'استقالة برتبة مستوى 1';

      generatedText = 
`*** ▬▬▬ ﷽ ▬▬
\`\`\`diff

-الموضوع : قرار انهاء خدمات 
\`\`\`
\`\`\`cs
# بعد الاطلاع على نظام التوظيف والترقيات وانهاء الخدمة الصادر من ادارة الهلال الاحمر قررنا مايلي 
 
اولاً: تنهى خدمات المسعف ادناه اعتبارا من تاريخه
ثانيا: منع توظيف ${ban} يوم
ثالثا: غرامه مالية قدرها ${fine} تسلم الى خزينة الهلال الاحمر


\`\`\`

<@${pid}>
[${pcod}] ${pnam}

\`\`\`وذلك بسبب :${lvlText}\`\`\`

${withLine}

\`اعتماد:\`  <@${apprv}>                 

يرسل الاصل الى : 
<@&1404535885864632340> ***`;

    } else {
      // Template for levels 2-9
      const lvlText = `استقالة برتبة مستوى (${lvl}) بناءاً على طلبه`;

      generatedText = 
`*** ▬▬▬ ﷽ ▬▬
\`\`\`diff

-الموضوع : قرار انهاء خدمات
\`\`\`
\`\`\`cs
# بعد الاطلاع على نظام التوظيف والترقيات وانهاء الخدمة الصدر من ادارة الهلال الاحمر قررنا مايلي 
 
اولاً: تنهى خدمات المسعف ادناه اعتبارا من تاريخه\`\`\`

<@${pid}>
[${pcod}] ${pnam}

\`\`\`وذلك بسبب : ${lvlText} \`\`\`

\`اعتماد:\`  <@${apprv}>      
   

\`يرسل الاصل الى : \`
*** <@&1404535885864632340>`;
    }

    // Output
    const card = document.getElementById('lv-output-card');
    const pre  = document.getElementById('lv-output-text');
    pre.textContent = generatedText;
    card.classList.add('visible');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    document.getElementById('btn-copy').disabled = false;
  };

  /* ── Copy ── */
  window.copyResignation = function () {
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
