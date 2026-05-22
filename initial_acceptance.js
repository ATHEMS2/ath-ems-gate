/* initial_acceptance.js — نموذج القبول المبدئي */
(function () {
  'use strict';

  let generatedText = '';
  
  const statusSel = document.getElementById('ia-status');
  const reasonRow = document.getElementById('ia-reason-row');
  const reasonInp = document.getElementById('ia-reason');
  const errorEl   = document.getElementById('lv-error');

  window.updateStatus = function () {
    if (statusSel.value === 'rejected') {
      reasonRow.style.display = 'flex';
    } else {
      reasonRow.style.display = 'none';
      reasonInp.value = '';
    }
  };

  window.issueAcceptance = function () {
    const errs = [];
    
    const nameStr = document.getElementById('ia-name').value.trim();
    const idStr   = document.getElementById('ia-id').value.trim();
    const expStr  = document.getElementById('ia-exp').value.trim();
    const ageStr  = document.getElementById('ia-age').value.trim();
    
    const q1 = document.getElementById('ia-q1').value;
    const q2 = document.getElementById('ia-q2').value;
    const q3 = document.getElementById('ia-q3').value;
    const q4 = document.getElementById('ia-q4').value;
    const q5 = document.getElementById('ia-q5').value;
    
    const status = statusSel.value;
    const reason = reasonInp.value.trim();

    if (!nameStr) errs.push('• اسم المواطن مطلوب');
    if (!idStr)   errs.push('• الآيدي الديسكورد مطلوب');
    if (!expStr)  errs.push('• الخبرة مطلوبة');
    if (!ageStr)  errs.push('• العمر مطلوب');
    
    if (status === 'rejected' && !reason) {
      errs.push('• يرجى ذكر سبب الرفض');
    }

    if (errs.length) {
      errorEl.innerHTML = errs.join('<br/>');
      errorEl.classList.add('visible');
      return;
    }
    errorEl.classList.remove('visible');

    let out = 
`***\`اسم المواطن:\` ${nameStr} ***

***\`الكوبي ايدي الديسكورد : ${idStr}\`***

***  \`حساب الدسكورد :\`   <@${idStr}>*** 

**** ${expStr} \`الخبرة:\`   **

*** ${ageStr}  \`العمر :\`  ***

***\`هل الاسم مطابق في المقاطعة , الديسكورد:\` ${q1}***

***\`هل يحمل مبلغ 150 الف :\` ${q2}***

***\`هل قرات جميع التنويهات والقوانين الخاصة بالهلال الأحمر ؟  :\` ${q3}  ***

***\`هل تتعهد على ذلك :\` ${q4}***

***\`في حال رصدك مخالفًا لأي قانون سيتم محاسبتك دون إنذار مسبق\` : ${q5}  ***
`;

    if (status === 'accepted') {
      out += `\n\n***مقبول في الهلال الاحمر ***`;
    } else {
      out += `\n\n***مرفوض من الهلال الاحمر ⛔  ***\n\n ***\`بسبب :\` ${reason}***`;
    }

    generatedText = out;

    const card = document.getElementById('lv-output-card');
    const pre  = document.getElementById('lv-output-text');
    pre.textContent = generatedText;
    card.classList.add('visible');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    document.getElementById('btn-copy').disabled = false;
  };

  window.copyAcceptance = function () {
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
