/* new_batch.js — منطق التعيين وتكوين دفعة جديدة */
(function () {
  'use strict';

  let generatedText = '';
  let paramedicsStore = [];

  const batchNumInp   = document.getElementById('batch-num');
  const acceptedInp   = document.getElementById('accepted-count');
  const empLevelSel   = document.getElementById('emp-level');
  
  const managerId     = document.getElementById('manager-id');
  const leaderId      = document.getElementById('leader-id');
  const deputyId      = document.getElementById('deputy-id');

  const addIdInp      = document.getElementById('add-id-input');
  const addIdBtn      = document.getElementById('add-id-btn');
  const listEl        = document.getElementById('paramedics-list');
  const errorEl       = document.getElementById('lv-error');

  // Add ID to list
  function addParamedic() {
    const val = addIdInp.value.trim();
    if (!val) return;
    if (paramedicsStore.includes(val)) {
      addIdInp.value = '';
      return;
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
      tag.style.cssText = 'background: rgba(0, 204, 255, 0.1); color: #00ddff; padding: 0.3rem 0.6rem; border-radius: 4px; display: flex; align-items: center; gap: 0.5rem; border: 1px solid rgba(0, 204, 255, 0.3); font-size: 0.95rem; font-family: monospace;';
      tag.innerHTML = `
        <span dir="ltr">${id}</span>
        <button onclick="window.removeParamedic('${id}')" style="background:transparent; border:none; color:#ff5555; cursor:pointer; font-weight:bold; font-size:1.1rem; padding:0; display:flex; align-items:center; justify-content:center; width: 20px; height: 20px; border-radius: 50%;">×</button>
      `;
      listEl.appendChild(tag);
    });
  }

  window.issueBatch = function () {
    const errs = [];
    
    const batchNum = batchNumInp.value.trim();
    const accCount = acceptedInp.value.trim();
    const level    = empLevelSel.value;
    const mgr      = managerId.value.trim();
    const ldr      = leaderId.value.trim();
    const dep      = deputyId.value.trim();

    if (!batchNum) errs.push('• رقم الدفعة مطلوب');
    if (!accCount) errs.push('• عدد المقبولين مطلوب');
    if (!mgr)      errs.push('• ID شؤون التوظيف مطلوب');
    if (!ldr)      errs.push('• ID توقيع القائد مطلوب');
    if (!dep)      errs.push('• ID توقيع نائب القائد مطلوب');
    if (paramedicsStore.length === 0) errs.push('• يجب إضافة مسعف واحد على الأقل');

    if (errs.length) {
      errorEl.innerHTML = errs.join('<br/>');
      errorEl.classList.add('visible');
      return;
    }
    errorEl.classList.remove('visible');

    let idsMapped = paramedicsStore.map(id => `<@${id}>`).join('\n');

    generatedText = 
`▬▬▬ ﷽ ▬▬▬
\`\`\`diff
-الموضوع: تعين الدفعه رقم (${batchNum})  .
\`\`\`

\`\`\`cs
# بعد الاطلاع على نظام التعينات واحصائيات شؤون التوظيف هذا اليوم الصادر من قبل قيادة الهلال الاحمر قررنا مايلي:
\`\`\`
\`\`\`
أولا: الموافقة على تعيين الدفعه رقم (${batchNum}) و تشمل (${accCount}) مسعف بمستوى ${level} اعتباراً من صدور هذا القرار
ثانياً: على مدير قسم السجلات اعتماد اكوادهم الجديدة وابلاغهم مضمونه
ثالثاً:  على مدير قسم الدورات الحاقهم بدورة العمليات 
ـــــــــــــــــــــــــــــــــــــــــــــــــــــــ
\`\`\`

${idsMapped}

* مع تمنياتنا لهم بالتوفيق والنجاح  .

**اعتماد:**
**مـــديـــر قــســم شــؤون الـــتـــوظـــيــف**
<@${mgr}> 
<@&1404535891401117767> 

**توقيع و إعتماد: ** 
<@${ldr}> 
<@&1404535891443060886> 
<@${dep}>
<@&1404535891351048413> 


ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ
**يرسل الاصل / ** <@&1404535885864632340> 

**للعلم والاحاطة / ** <@&1404535887643021414>`;

    // Output
    const card = document.getElementById('lv-output-card');
    const pre  = document.getElementById('lv-output-text');
    pre.textContent = generatedText;
    card.classList.add('visible');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    document.getElementById('btn-copy').disabled = false;
  };

  window.copyBatch = function () {
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
