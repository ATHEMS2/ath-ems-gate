/* rewards.js — منطق الإنذارات والغرامات */
(function () {
  'use strict';

  let generatedText = '';

  const typeSel     = document.getElementById('warning-type');
  const reasonInp   = document.getElementById('reason');
  const fineRow     = document.getElementById('fine-row');
  const fineInp     = document.getElementById('fine-amount');
  
  const paramId     = document.getElementById('paramedic-id');
  const approverId  = document.getElementById('approver-id');
  const errorEl     = document.getElementById('lv-error');
  const confirmRegRow = document.getElementById('confirm-register-row');
  const confirmReg    = document.getElementById('confirm-register');

  function formatNumberWithCommas(value) {
    const digits = value.toString().replace(/[^\d]/g, '');
    if (!digits) return '';
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  if (fineInp) {
    fineInp.addEventListener('input', function () {
      this.value = formatNumberWithCommas(this.value);
    });
  }

  window.updateForm = function () {
    if (typeSel.value === 'شفهي') {
      fineRow.style.display = 'none';
      fineInp.value = '';
    } else {
      fineRow.style.display = 'flex';
    }
    if(confirmRegRow) confirmRegRow.style.display = 'flex'; // Always visible
  };

  window.issueWarning = function () {
    const errs = [];
    
    const typeVal  = typeSel.value;
    const reason   = reasonInp.value.trim();
    let fine       = fineInp.value.trim();
    
    if (fine && !isNaN(fine.replace(/,/g, ''))) {
      fine = Number(fine.replace(/,/g, '')).toLocaleString('en-US');
    }

    const pid      = paramId.value.trim();
    const apprv    = approverId.value.trim();

    if (!reason) errs.push('• السبب مطلوب');
    if (!pid)    errs.push('• معرّف المسعف مطلوب');
    if (!apprv)  errs.push('• معرّف الاعتماد مطلوب');
    
    if (typeVal !== 'شفهي') {
      if (!fine) {
        errs.push('• إدخال الغرامة مطلوب');
      }
    }
    
    if (confirmReg && !confirmReg.checked) {
      errs.push('• يرجى تأكيد تسجيل الإنذار/الغرامة بالجدول');
    }

    if (errs.length) {
      errorEl.innerHTML = errs.join('<br/>');
      errorEl.classList.add('visible');
      return;
    }
    errorEl.classList.remove('visible');

    let title = '';
    let firstLi = '';

    if (typeVal === 'شفهي') {
      generatedText = 
`*** ▬▬▬ ﷽ ▬▬

\`\`\`diff

-الموضوع : انذار شفهي
\`\`\`
\`\`\`cs
# بعد الاطلاع على نظام المخالفات والعقوبات الصادر من ادارة الهلال الاحمر قررنا مايلي 
 
اولاً : انذار شفهي
\`\`\`
<@${pid}>  

\`\`\`وذلك بسبب : ${reason}\`\`\`
\` توقيع واعتماد : \`  <@${apprv}>   

\` يرسل الاصل الى : \` <@&1404535885864632340>***`;
    } else {
      if (typeVal === 'أول') {
        title = 'انذار وظيفي';
        firstLi = 'انذار وظيفي أول';
      } else if (typeVal === 'ثاني') {
        title = 'انذار وظيفي';
        firstLi = 'انذار وظيفي ثاني';
      } else if (typeVal === 'نهائي') {
        title = 'انذار نهائي';
        firstLi = 'انذار نهائي بالفصل';
      } else if (typeVal === 'غرامة مالية بدون إنذار') {
        title = 'غرامة مالية';
        firstLi = 'غرامة مالية';
      }

      if (typeVal === 'غرامة مالية بدون إنذار') {
        generatedText = 
`*** ▬▬▬ ﷽ ▬▬

\`\`\`diff

-الموضوع : ${title}
\`\`\`
\`\`\`cs
# بعد الاطلاع على نظام المخالفات والعقوبات الصادر من ادارة الهلال الاحمر قررنا مايلي 
 
أولًا: غرامة مالية بقيمة ${fine} تسلم الى خزينة الهلال الأحمر
\`\`\`
<@${pid}>  

\`\`\`وذلك بسبب : ${reason}\`\`\`
\` ملاحظه : \`  [يرجى فتح تكت تواصل مع الشؤون الإدارية لتسديد الغرامة](https://ptb.discord.com/channels/1404512396923375696/1404536350614491238/1466234198389035257) 

\` توقيع واعتماد :\`  <@${apprv}>   

\` يرسل الاصل الى :\`  <@&1404535885864632340>***`;
      } else {
        generatedText = 
`*** ▬▬▬ ﷽ ▬▬

\`\`\`diff
-الموضوع : ${title}
\`\`\`
\`\`\`cs
# بعد الاطلاع على نظام المخالفات والعقوبات الصادر من ادارة الهلال الاحمر قررنا مايلي 
 
اولاً : ${firstLi}
ثانياً: غرامة مالية قدرها ${fine} تسلم الى خزينة الهلال الأحمر
\`\`\`
<@${pid}>  

\`\`\`وذلك بسبب : ${reason}\`\`\`
\` توقيع واعتماد : \`  <@${apprv}>   

\` يرسل الاصل الى : \` <@&1404535885864632340>***`;
      }
    }

    // Output
    const card = document.getElementById('lv-output-card');
    const pre  = document.getElementById('lv-output-text');
    pre.textContent = generatedText;
    card.classList.add('visible');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    document.getElementById('btn-copy').disabled = false;
  };

  window.copyWarning = function () {
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
