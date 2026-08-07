/* ============================================================
   checker.js — تصحيح تقارير العمليات
   ============================================================ */

const LOCATION_CONFIG = {
  "لوس سانتوس": {
    prioritySections: ["لام 1", "لام 2", "لام 3", "لام 4"],
    requiredSection: "لام 2",
    sequence: ["لام 2","لام 3","لام 1","لام 4","لام 2","لام 3","لام 1","لام 2","لام 2","لام 3"],
    noDupSections: ["لام 1", "لام 2", "لام 3", "لام 4", "فرسان", "دعم", "وحدات البحث والانقاذ"]
  },
  "ساندي و بوليتو": {
    prioritySections: ["سين", "سين 1", "باء 1", "باء"],
    requiredSection: "سين",
    sequence: ["سين","سين 1","باء 1","باء","سين","سين 1","باء 1","سين","سين 1","باء 1"],
    noDupSections: ["سين", "سين 1", "باء 1", "باء", "فرسان", "دعم", "وحدات البحث والانقاذ"]
  }
};

function detectLocation(firstLine) {
  for (const key of Object.keys(LOCATION_CONFIG)) {
    if (firstLine.includes(key)) return key;
  }
  return null;
}

function computeExpectedDistribution(sequence, total) {
  const counts = {};
  sequence.forEach(s => { counts[s] = 0; });
  for (let i = 0; i < total; i++) {
    const slot = sequence[i % sequence.length];
    counts[slot] = (counts[slot] || 0) + 1;
  }
  return counts;
}

function validateSpacing(rawText) {
  const errors = [];
  const rawLines = rawText.split('\n').map(l => l.trim());

  for (let i = 0; i < rawLines.length - 1; i++) {
    if (rawLines[i] === '' && rawLines[i + 1] === '') {
      errors.push("يوجد أكثر من سطر فارغ متتالي بين الأقسام (المسافة يجب أن تكون سطرًا فارغًا واحدًا فقط).");
      break;
    }
  }

  for (let i = 2; i < rawLines.length; i++) {
    const line = rawLines[i];
    const isHeader = line.includes(':') && !line.startsWith("تم تحديث تقرير");
    if (isHeader) {
      const prev = rawLines[i - 1];
      if (prev !== '') {
        errors.push(`القسم "${line}" غير مسبوق بسطر فارغ (تحقق من المسافات بين الأقسام).`);
      }
    }
  }

  return errors;
}

function validateTime(firstLine) {
  const timeMatch = firstLine.match(/الساعة\s*\(\s*(\d{1,2}):(\d{2})\s*([صم])\s*\)/);
  if (!timeMatch) return ["تعذر العثور على الوقت بالصيغة الصحيحة ( الساعة ( HH:MM ص/م ) )."];
  const minutes = timeMatch[2];
  if (minutes !== "00" && minutes !== "30") {
    return [`الوقت يجب أن يكون بدقائق 00 أو 30 فقط — الموجود: ${timeMatch[1]}:${minutes}`];
  }
  return [];
}

function checkReport() {
  const input = document.getElementById("reportInput").value.trim();
  const resultDiv = document.getElementById("result");
  resultDiv.classList.add("hidden");

  const errors = [];
  if (!input) {
    errors.push("يرجى لصق تقرير العمليات أولًا.");
    showResult(errors, false);
    return;
  }

  const lines = input.split('\n').map(line => line.trim()).filter(line => line);
  const firstLine = lines[0];
  if (!firstLine.startsWith("تم تحديث تقرير عمليات") ||
      !firstLine.includes("رقم") ||
      !firstLine.includes("الساعة")) {
    errors.push("السطر الأول يجب أن يبدأ بـ: \"تم تحديث تقرير عمليات ... رقم ... الساعة ...\"");
  }

  errors.push(...validateTime(firstLine));
  errors.push(...validateSpacing(input));

  const location = detectLocation(firstLine);
  const config = location ? LOCATION_CONFIG[location] : null;
  if (!location) {
    errors.push("تعذر تحديد نوع التقرير (لوس سانتوس / ساندي و بوليتو) من السطر الأول.");
  }

  const reportData = {};
  let currentSection = null;
  let hasSections = false;
  let structureValid = true;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes(':')) {
      const parts = line.split(':');
      const section = parts[0].trim();
      const valuePart = parts.slice(1).join(':').trim();
      if (!section) {
        structureValid = false;
        if (!errors.some(e => e.includes("سطر غير صالح"))) errors.push("يوجد سطر غير صالح: يحتوي على ':' بدون اسم قسم.");
      } else {
        currentSection = section;
        hasSections = true;
        reportData[section] = valuePart ? valuePart.split(/\s+/).filter(v => v) : [];
      }
    } else {
      if (currentSection === null) {
        structureValid = false;
        if (!errors.some(e => e.includes("نص خارج هيكل"))) errors.push("يوجد نص خارج هيكل التقرير (سطر غير مرتبط بأي قسم).");
      } else {
        reportData[currentSection] = reportData[currentSection] || [];
        reportData[currentSection].push(line);
      }
    }
  }

  if (!hasSections && errors.length === 0) errors.push("التقرير لا يحتوي على أي أقسام.");

  if (structureValid) {
    const emptySections = Object.keys(reportData).filter(sec => reportData[sec].length === 0);
    if (emptySections.length > 0) errors.push(`الأقسام التالية فارغة: ${emptySections.join(', ')}`);

    const idPattern = /^<@\d+>$/;
    const codePattern = /^[A-Z]-\d{3}$/;
    const idLocations = {};
    const codeLocations = {};

    for (const [section, values] of Object.entries(reportData)) {
      for (const val of values) {
        if (idPattern.test(val)) {
          if (!idLocations[val]) idLocations[val] = [];
          idLocations[val].push(section);
        } else if (codePattern.test(val)) {
          if (val === "E-000") continue;
          if (!codeLocations[val]) codeLocations[val] = [];
          codeLocations[val].push(section);
        }
      }
    }

    for (const [id, locations] of Object.entries(idLocations)) {
      if (locations.length > 1) {
        const uniqueLocs = [...new Set(locations)];
        errors.push(`هناك شخص تم منشنته مرتين: ${id} — في: ${uniqueLocs.join('، ')}`);
      }
    }

    for (const [code, locations] of Object.entries(codeLocations)) {
      if (locations.length > 1) {
        const uniqueLocs = [...new Set(locations)];
        errors.push(`الرمز "${code}" مكرر — في: ${uniqueLocs.join('، ')}`);
      }
    }

    if (config) {
      config.noDupSections.forEach(sec => {
        const values = reportData[sec] || [];
        const seen = {};
        values.forEach(val => {
          if (codePattern.test(val) && val !== "E-000") {
            seen[val] = (seen[val] || 0) + 1;
          }
        });
        Object.entries(seen).forEach(([code, count]) => {
          if (count > 1) {
            errors.push(`الرمز "${code}" مكرر داخل نفس القسم "${sec}" (${count} مرات).`);
          }
        });
      });

      const requiredVals = (reportData[config.requiredSection] || []).filter(v => v !== "E-000");
      if (requiredVals.length === 0) {
        errors.push(`القسم "${config.requiredSection}" لا يمكن أن يكون فارغًا أو يحتوي على E-000 فقط.`);
      }

      const codePattern2 = /^[A-Z]-\d{3}$/;
      let totalPeople = 0;
      const actualCounts = {};
      config.prioritySections.forEach(sec => {
        const values = reportData[sec] || [];
        const realCodes = values.filter(v => codePattern2.test(v) && v !== "E-000");
        actualCounts[sec] = realCodes.length;
        totalPeople += realCodes.length;
      });

      if (totalPeople > 0) {
        const expected = computeExpectedDistribution(config.sequence, totalPeople);
        config.prioritySections.forEach(sec => {
          const exp = expected[sec] || 0;
          const act = actualCounts[sec] || 0;
          if (exp !== act) {
            errors.push(`توزيع "${sec}" غير مطابق للتسلسل — المتوقع: ${exp}، الموجود: ${act} (إجمالي الأشخاص: ${totalPeople}).`);
          }
        });
      }
    }
  }

  errors.length === 0 ? showResult(["✅ التقرير سليم وجاهز للإرسال"], true) : showResult(errors, false);
}

function showResult(messages, isSuccess) {
  const resultDiv = document.getElementById("result");
  if (isSuccess) {
    resultDiv.innerHTML = messages[0];
    resultDiv.className = "checker-result success";
  } else {
    let listHTML = '<ul>';
    messages.forEach(msg => { listHTML += `<li>${msg.replace(/\n/g, '<br>')}</li>`; });
    listHTML += '</ul>';
    resultDiv.innerHTML = '<strong>الأخطاء المكتشفة:</strong>' + listHTML;
    resultDiv.className = "checker-result error";
  }
  resultDiv.classList.remove("hidden");
}
