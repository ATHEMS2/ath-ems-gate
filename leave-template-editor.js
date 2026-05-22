/* leave-template-editor.js — محرر القالب داخل الصفحة + حفظ محلي */

(function () {
  'use strict';

  const STORAGE_KEY = 'hlal_leave_template';

  window.getLeaveTemplate = function () {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && saved.trim() ? saved : window.HLAL_LEAVE_DEFAULT_TEMPLATE;
  };

  window.renderLeaveTemplate = function (template, vars) {
    const cfg = window.HLAL_LEAVE_CONFIG || {};
    const all = {
      rulesUrl: cfg.rulesUrl || '',
      approvalRole: cfg.approvalRoleId || '',
      ...vars,
    };
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
      Object.prototype.hasOwnProperty.call(all, key) ? String(all[key]) : ''
    );
  };

  window.initLeaveTemplateEditor = function () {
    const panel = document.getElementById('lv-template-editor');
    const textarea = document.getElementById('lv-template-text');
    const status = document.getElementById('lv-template-status');
    if (!panel || !textarea) return;

    const loadIntoEditor = () => {
      textarea.value = getLeaveTemplate();
    };

    loadIntoEditor();

    document.getElementById('lv-template-save')?.addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEY, textarea.value);
      if (status) {
        status.textContent = 'تم الحفظ — يُستخدم عند إصدار الصادر التالي.';
        status.className = 'lv-template-status ok';
      }
    });

    document.getElementById('lv-template-reset')?.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      textarea.value = window.HLAL_LEAVE_DEFAULT_TEMPLATE;
      if (status) {
        status.textContent = 'تمت استعادة القالب الافتراضي من leave-template.js';
        status.className = 'lv-template-status ok';
      }
    });

    document.getElementById('lv-template-open-file')?.addEventListener('click', () => {
      if (status) {
        status.innerHTML =
          'للتعديل الدائم في المشروع: افتح الملف <code>leave-template.js</code> في Cursor، ثم احفظ وحدّث الصفحة.';
        status.className = 'lv-template-status hint';
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initLeaveTemplateEditor);
  } else {
    window.initLeaveTemplateEditor();
  }
})();
