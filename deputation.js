/* deputation.js — منطق نماذج الانتداب */
(function () {
  'use strict';

  let generatedText = '';

  /* ── DOM refs ── */
  const depId      = document.getElementById('dep-id');
  const depName    = document.getElementById('dep-name');
  const depSector  = document.getElementById('dep-sector');
  const depDur     = document.getElementById('dep-duration');
  const errorEl    = document.getElementById('lv-error');

  /* ── Generate ── */
  window.issueDeputation = function () {
    const errs = [];
    
    // Vals
    const pid    = depId.value.trim();
    const pnam   = depName.value.trim();
    const sector = depSector.value;
    const dur    = depDur.value;

    // Validation
    if (!pid)  errs.push('• معرّف المسعف (ID) مطلوب');
    if (!pnam) errs.push('• اسم وكود الموظف مطلوب');

    if (errs.length) {
      errorEl.innerHTML = errs.join('<br/>');
      errorEl.classList.add('visible');
      return;
    }
    errorEl.classList.remove('visible');

    // Build template
    generatedText = 
`*** ▬▬▬ ﷽ ▬▬
\`\`\`الموضوع : انتداب خارجي \`\`\`
السلام عليكم ورحمة الله وبركاته، وبعد:
 \`\`\`cs
 # : طلب الموافقه بشأن الانتداب خارج الهلال الاحمر 
\`\`\`

 \`الاسم :\`  <@${pid}>  

\` اسم وكود الموظف :\` ${pnam}

 \`القطاع المنتدب له:\` ${sector}

 \`المدة :\`${dur}

[مع العلم تم قراءة آلية الانتداب](https://discord.com/channels/1404512396923375696/1404536315537526794/1469961212027469924) 

<@&1404535891351048413> 
<@&1404535891376214137> 
<@&1404535891401117767>***`;

    // Output
    const card = document.getElementById('lv-output-card');
    const pre  = document.getElementById('lv-output-text');
    pre.textContent = generatedText;
    card.classList.add('visible');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    document.getElementById('btn-copy').disabled = false;
  };

  /* ── Copy ── */
  window.copyDeputation = function () {
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
