/* promotion.js — منطق نموذج الترقيات */
(function () {
  'use strict';

  let generatedText = '';
  let paramedicsStore = [];

  const currentLevelSel = document.getElementById('current-level');
  const newLevelSel     = document.getElementById('new-level');
  const addIdInp        = document.getElementById('add-id-input');
  const addIdBtn        = document.getElementById('add-id-btn');
  const listEl          = document.getElementById('paramedics-list');
  const errorEl         = document.getElementById('lv-error');

  /* ── Add ID ── */
  function addParamedic() {
    const val = addIdInp.value.trim();
    if (!val) return;
    if (paramedicsStore.includes(val)) { addIdInp.value = ''; return; }
    paramedicsStore.push(val);
    renderList();
    addIdInp.value = '';
    addIdInp.focus();
  }

  addIdBtn.addEventListener('click', () => addParamedic());
  addIdInp.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addParamedic(); }
  });

  /* ── Remove ID ── */
  window.removeParamedic = function (idToRemove) {
    paramedicsStore = paramedicsStore.filter(id => id !== idToRemove);
    renderList();
  };

  /* ── Render ID tags ── */
  function renderList() {
    listEl.innerHTML = '';
    paramedicsStore.forEach(id => {
      const tag = document.createElement('div');
      tag.style.cssText = 'background: rgba(220,20,60,0.10); color: #ff6070; padding: 0.3rem 0.6rem; border-radius: 4px; display: flex; align-items: center; gap: 0.5rem; border: 1px solid rgba(220,20,60,0.3); font-size: 0.95rem; font-family: monospace;';
      tag.innerHTML = `
        <span dir="ltr">${id}</span>
        <button onclick="window.removeParamedic('${id}')" style="background:transparent; border:none; color:#ff5555; cursor:pointer; font-weight:bold; font-size:1.1rem; padding:0; display:flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:50%;">×</button>
      `;
      listEl.appendChild(tag);
    });
  }

  /* ── Shared footer used by all 3 templates ── */
  function sharedFooter() {
    return `توقيع / مسؤول قسم السجلات والترقيات
<@510191753165537280>
<@&1404535891351048413>

 اعتماد /
<@1243196849372790916>
<@&1404535891443060886>

  للعلم و الاحاطه / 
||<@&1404535887643021414>||**`;
  }

  /* ── Issue ── */
  window.issuePromotion = function () {
    const errs = [];
    const currentLevel  = currentLevelSel.value;
    const newLevel      = newLevelSel.value;
    const isExceptional = document.getElementById('exceptional-check').checked;
    const isCertified   = document.getElementById('certified-check').checked;

    if (parseInt(newLevel) <= parseInt(currentLevel)) {
      errs.push('• المستوى الجديد يجب أن يكون أعلى من المستوى الحالي');
    }
    if (paramedicsStore.length === 0) {
      errs.push('• يجب إضافة مسعف واحد على الأقل');
    }

    if (errs.length) {
      errorEl.innerHTML = errs.join('<br/>');
      errorEl.classList.add('visible');
      return;
    }
    errorEl.classList.remove('visible');

    const idsMapped = paramedicsStore.map(raw => {
      const id = (raw || '').toString().trim();
      // If already a mention like <@123> or contains <@, keep as-is
      if (/^<@.+>$/.test(id) || id.includes('<@')) return id;
      // strip any surrounding braces or stray angle brackets, then wrap
      const clean = id.replace(/^[{<\s]+|[}>\s]+$/g, '');
      return `<@${clean}>`;
    }).join('\n');

    if (isExceptional && isCertified) {
      // ── ترقية استثنائية + معتمد (نفس قالب الاستثنائية) ──
      generatedText =
`**▬▬▬ ﷽ ▬▬▬

\`\`\`diff
-الموضوع : ترقيات المعتمدين الاستثنائيه الى مستوى ${newLevel}

\`\`\`
\`\`\`cs
# بعد الاطلاع على نظام التعيينات واحصائيات شؤون المعتمدين الصادر من قبل قيادة الهلال الاحمر قررنا مايلي :
\`\`\`
\`\`\`diff
أولًا: ترقية التالي اسمائهم ادناه من مستوى ( ${currentLevel} ) الى مستوى ( ${newLevel} ) اعتباراً من صدور هذا القرار 
ثانيًا: على مدير قسم السجلات اعتماد مستوياتهم الجديده و رفع رتبهم للمستوى المطلوب 
ثالثًا: على مسؤول شؤون الدورات الحاقهم بالدورات المستحقه 
\`\`\`
 ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

${idsMapped}

 ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

مع تمنياتنا لهم بالتوفيق والنجاح  .

توقيع / مسؤول شؤون المعتمدين
<@1466404933631738040>
<@&1404535891401117767>

 اعتماد /
<@1243196849372790916>
<@&1404535891443060886>

  للعلم و الاحاطه / 
||<@&1404535887643021414>||**`;

    } else if (isExceptional) {
      // ── ترقية استثنائية ──
      generatedText =
`**▬▬▬ ﷽ ▬▬▬

\`\`\`diff
-الموضوع: ترقيات استثنائيه الى مستوى ${newLevel}

\`\`\`
\`\`\`cs
#بعد الاطلاع على نظام الترقيات واحصائيات السجلات الصادر من قبل إدارة الهلال الاحمر الموقره قررنا مايلي 
\`\`\`
\`\`\`diff
أولًا: ترقية التالي اسمائهم ادناه من مستوى ( ${currentLevel} ) الى مستوى ( ${newLevel} ) اعتباراً من صدور هذا القرار 
ثانيًا: على مدير قسم السجلات اعتماد اكوادهم الجديده و رفع رتبهم للمستوى المطلوب 
ثالثًا: على مسؤول شؤون الدورات الحاقهم بالدورات المستحقه 
\`\`\`
 ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

${idsMapped}

 ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

مع تمنياتنا لهم بالتوفيق والنجاح  .

 
${sharedFooter()}`;

    } else if (isCertified) {
      // ── ترقية معتمد ──
      generatedText =
`**▬▬▬ ﷽ ▬▬▬

\`\`\`diff
-الموضوع: ترقيات المعتمدين مستوى ${currentLevel}

\`\`\`
\`\`\`cs
# بعد الاطلاع على نظام التعيينات واحصائيات شؤون المعتمدين الصادر من قبل قيادة الهلال الاحمر والاتفاقيه المعلنه بين قطاع الهلال الاحمر و قسم اللاعب المعتمد قررنا مايلي :
\`\`\`
\`\`\`diff
أولًا: ترقية التالي اسمائهم ادناه من مستوى ( ${currentLevel} ) الى مستوى ( ${newLevel} ) اعتباراً من صدور هذا القرار 
ثانيًا: على مدير قسم السجلات اعتماد مستوياتهم الجديده و رفع رتبهم للمستوى المطلوب 
ثالثًا: على مسؤول شؤون الدورات الحاقهم بالدورات المستحقه 
\`\`\`
 ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

${idsMapped}

 ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

مع تمنياتنا لهم بالتوفيق والنجاح  .

 توقيع / مسؤول شؤون المعتمدين
<@1466404933631738040>
<@&1404535891401117767>

 اعتماد /
<@1243196849372790916>
<@&1404535891443060886>

  للعلم و الاحاطه / 
||<@&1404535887643021414>||**`;

    } else {
      // ── ترقية عادية ──
      generatedText =
`**▬▬▬ ﷽ ▬▬▬
\`\`\`diff
-الموضوع: ترقيات مستوى ${currentLevel}  
\`\`\`
\`\`\`cs
#بعد الاطلاع على نظام الترقيات واحصائيات السجلات الصادر من قبل إدارة الهلال الاحمر الموقره قررنا مايلي 
\`\`\`
\`\`\`diff
أولًا: ترقية التالي اسمائهم ادناه من مستوى ( ${currentLevel} ) الى مستوى ( ${newLevel} ) اعتباراً من صدور هذا القرار 
ثانيًا: على مدير قسم السجلات اعتماد اكوادهم الجديده و رفع رتبهم للمستوى المطلوب 
ثالثًا: على مسؤول شؤون الدورات الحاقهم بالدورات المستحقه 
\`\`\`
 ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

${idsMapped}

 ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ

 مع تمنياتنا لهم بالتوفيق والنجاح  .

 
${sharedFooter()}`;
    }

    const card = document.getElementById('lv-output-card');
    const pre  = document.getElementById('lv-output-text');
    pre.textContent = generatedText;
    card.classList.add('visible');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    document.getElementById('btn-copy').disabled = false;
  };

  /* ── Copy ── */
  window.copyPromotion = function () {
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
