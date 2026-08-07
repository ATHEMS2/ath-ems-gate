/* ============================================================
   supervision.js — استخراج تقرير الإشراف الميداني
   ============================================================ */

var currentReport = '';

function showMessage(text, isSuccess) {
  var msg = document.getElementById('message');
  if (msg) {
    msg.textContent = text;
    msg.className = 'lv-error visible' + (isSuccess ? ' success' : '');
  }
}

function formatMention(raw){
  if(!raw) return null;
  var v = raw.trim();
  if(!v) return null;
  if(/^<@\d+>$/.test(v)) return v;
  var digits = v.replace(/\D/g,'');
  if(!digits) return null;
  return '<@' + digits + '>';
}

function addMentionRow(groupId){
  var group = document.getElementById(groupId);
  var row = document.createElement('div');
  row.className = 'mention-row';
  row.innerHTML = '<input type="text" class="lv-input mention-input" placeholder="آيدي الشخص">' +
                   '<button type="button" class="remove-row-btn" onclick="removeMentionRow(this)">×</button>';
  group.appendChild(row);
}

function removeMentionRow(btn){
  var group = btn.closest('.mention-group');
  if(group.children.length > 1){
    btn.closest('.mention-row').remove();
  }
}

function getMentionsFromGroup(groupId){
  var inputs = document.querySelectorAll('#' + groupId + ' .mention-input');
  var out = [];
  inputs.forEach(function(inp){
    var m = formatMention(inp.value);
    if(m) out.push(m);
  });
  return out;
}

/* Time: Latin digits, fixed to GMT+3, rounded to the start of the hour.
   "to" = start of current hour, "from" = one hour before that. */
function formatTime(date){
  return date.toLocaleTimeString('ar-EG-u-nu-latn', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Riyadh'
  });
}

function getTimeRange(){
  var now = new Date();

  var currentHourStart = new Date(now);
  currentHourStart.setMinutes(0, 0, 0);

  var oneHourBefore = new Date(currentHourStart.getTime() - (60 * 60 * 1000));

  return {
    from: formatTime(oneHourBefore),
    to: formatTime(currentHourStart)
  };
}

function generateSupervisionReport() {
  var generalMentions = getMentionsFromGroup('group-general');
  var fieldMentions    = getMentionsFromGroup('group-field');
  var responsible      = formatMention(document.getElementById('responsibleInput').value);

  var link1 = document.getElementById('link1').value.trim();
  var link2 = document.getElementById('link2').value.trim();
  var link3 = document.getElementById('link3').value.trim();
  var link4 = document.getElementById('link4').value.trim();

  var reason = document.getElementById('reasonLate').value.trim() || 'لا يوجد';
  var correctionLink = document.getElementById('correctionLink').value.trim();

  if (!responsible) {
    showMessage("يرجى إدخال آيدي المسؤول الميداني.", false);
    return;
  }

  var range = getTimeRange();

  var lines = [];
  lines.push('``تـم اسـتـلام تقرير (الاشراف الميداني) من الساعة ' + range.from + ' إلى الساعة ' + range.to + '``');
  lines.push('');
  lines.push('``الاشراف العام :``');
  lines = lines.concat(generalMentions.length > 0 ? generalMentions : ['لا يوجد']);
  lines.push('');
  lines.push('``الاشراف الميداني :``');
  lines = lines.concat(fieldMentions.length > 0 ? fieldMentions : ['لا يوجد']);
  lines.push('');
  lines.push('``المسؤول الميداني :``');
  lines.push(responsible);
  lines.push('');
  lines.push('``تم مراجعة وتصحيح تقرير العمليات :``');
  if (link1) { lines.push('[رابط تقرير نائب العمليات الاول لمنطقه لوس سانتوس](' + link1 + ')'); lines.push(''); }
  if (link2) { lines.push('[رابط تقرير نائب العمليات الثاني لمنطقه لوس سانتوس](' + link2 + ')'); lines.push(''); }
  if (link3) { lines.push('[رابط تقرير نائب العمليات الاول لمنطقتي ساندي وبوليتو](' + link3 + ')'); lines.push(''); }
  if (link4) { lines.push('[رابط تقرير نائب العمليات الثاني لمنطقتي ساندي وبوليتو](' + link4 + ')'); lines.push(''); }
  lines.push('``سبب نزول التقرير متأخر :`` ' + reason);
  lines.push('');
  lines.push('``ملاحظه تصحيح التقرير :`` ' + (correctionLink || '—'));

  currentReport = lines.join('\n');

  var resultDiv = document.getElementById('resultBox');
  var outputCard = document.getElementById('lv-output-card-wrap');
  if (resultDiv) {
    resultDiv.textContent = currentReport;
    outputCard.classList.add('visible');
    outputCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showMessage("✓ تم إنشاء تقرير الإشراف بنجاح!", true);
  }
}

function copyResult() {
  if (!currentReport || currentReport.trim() === '') {
    showMessage("لا يوجد تقرير للنسخ. استخرج التقرير أولًا.", false);
    return;
  }

  var textarea = document.createElement('textarea');
  textarea.value = currentReport;
  textarea.style.position = 'fixed';
  textarea.style.top = '-1000px';
  document.body.appendChild(textarea);
  textarea.select();

  var success = false;
  try {
    success = document.execCommand('copy');
  } catch (e) {
    success = false;
  }

  document.body.removeChild(textarea);

  if (success) {
    showMessage("✓ تم نسخ التقرير!", true);
  } else {
    showMessage("فشل النسخ. انسخ يدويًا من المربع.", false);
  }
}
