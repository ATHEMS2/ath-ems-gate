/* bonus.js — منطق المكافآت */
(function () {
  'use strict';

  let generatedText = '';
  let paramedicsStore = [];

  const amountInp   = document.getElementById('bonus-amount');
  const reasonInp   = document.getElementById('bonus-reason');
  const addIdInp    = document.getElementById('add-id-input');
  const addIdBtn    = document.getElementById('add-id-btn');
  const listEl      = document.getElementById('paramedics-list');
  const approverId  = document.getElementById('approver-id');
  const errorEl     = document.getElementById('lv-error');

  // Add ID to list
  function addParamedic() {
    const val = addIdInp.value.trim();
    if (!val) return;
    if (paramedicsStore.includes(val)) {
      addIdInp.value = '';
      return; // prevent duplicate
    }
    paramedicsStore.push(val);
    renderList();
    addIdInp.value = '';
    addIdInp.focus();
  }

  addIdBtn.addEventListener('click', () => addParamedic());
  addIdInp.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addParamedic();
    }
  });

  // Remove ID from list
  window.removeParamedic = function(idToRemove) {
    paramedicsStore = paramedicsStore.filter(id => id !== idToRemove);
    renderList();
  };

  function renderList() {
    listEl.innerHTML = '';
    paramedicsStore.forEach(id => {
      const tag = document.createElement('div');
      tag.style.cssText = 'background: rgba(0, 230, 118, 0.1); color: #00ff88; padding: 0.3rem 0.6rem; border-radius: 4px; display: flex; align-items: center; gap: 0.5rem; border: 1px solid rgba(0,255,136,0.3); font-size: 0.95rem; font-family: monospace;';
      tag.innerHTML = `
        <span dir="ltr">${id}</span>
        <button onclick="window.removeParamedic('${id}')" style="background:transparent; border:none; color:#ff5555; cursor:pointer; font-weight:bold; font-size:1.1rem; padding:0; display:flex; align-items:center; justify-content:center; width: 20px; height: 20px; border-radius: 50%;">×</button>
      `;
      listEl.appendChild(tag);
    });
  }

  window.issueBonus = function () {
    const errs = [];
    
    let fine       = amountInp.value.trim();
    if (fine && !isNaN(fine.replace(/,/g, ''))) {
      fine = Number(fine.replace(/,/g, '')).toLocaleString('en-US');
    }

    const reason   = reasonInp.value.trim();
    const apprv    = approverId.value.trim();

    if (!fine)   errs.push('• المبلغ مطلوب');
    if (!reason) errs.push('• السبب مطلوب');
    if (!apprv)  errs.push('• معرّف الاعتماد مطلوب');
    if (paramedicsStore.length === 0) errs.push('• يجب إضافة مسعف واحد على الأقل');

    if (errs.length) {
      errorEl.innerHTML = errs.join('<br/>');
      errorEl.classList.add('visible');
      return;
    }
    errorEl.classList.remove('visible');

    let idsMapped = paramedicsStore.map(id => `<@${id}>`).join('\n');

    generatedText = 
`*** ▬▬▬ ﷽ ▬▬
\`\`\`diff

الموضوع : مكافأة ماليه
\`\`\`
\`\`\`cs
# بعد الاطلاع على نظام المكافاة الصادر من ادارة الهلال الاحمر قررنا مايلي 
 
: يتم صرف مكافأة ماليه بقيمة ${fine} للمسعفين ادناه

\`\`\`

${idsMapped}

\`\`\`وذلك بسبب :  ${reason}  \`\`\`

\`يرجى فتح تكت مساعده من القياده لاستلام المكافاة خلال 48 ساعه\`

\`اعتماد:\`
<@${apprv}>     

يرسل الاصل الى : 
*** || <@&1404535887643021414> ||`;

    // Output
    const card = document.getElementById('lv-output-card');
    const pre  = document.getElementById('lv-output-text');
    pre.textContent = generatedText;
    card.classList.add('visible');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    document.getElementById('btn-copy').disabled = false;
  };

  window.copyBonus = function () {
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
