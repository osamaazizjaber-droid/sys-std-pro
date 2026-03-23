/**
 * SYS WMS Pro — Global Settings Engine v8.3
 * Features: Restored Full Translation Dictionary + Global Font Force + Singleton Guard
 * FIXED: Exposed FONT_URLS and applyT to global scope for settings.html compatibility
 */
if (!window.WMS_SETTINGS_LOADED) {
  window.WMS_SETTINGS_LOADED = true;

  (function () {
    const ROOT = document.documentElement;
    const DEFAULTS = { theme: 'forge', dark: 'false', lang: 'en', font: 'Inter' };

    window.WMS_I18N = {
      en: {
        'scanner-setup-title': 'Mobile Scanner Setup', 'scanner-setup-desc': 'Use this secure Company Code to link your field smartphones to the live attendance scanner.', 'open-scanner': 'Open Scanner App', 'company-code': 'Company Code',
        'settings-desc': 'Customize the appearance and language of SYS WMS Pro.', 'language-section': 'Language', 'lang-en': 'English', 'lang-en-desc': 'Left-to-right layout', 'lang-ar': 'العربية', 'lang-ar-desc': 'Right-to-left layout', 'font-section': 'Font', 'appearance-section': 'Appearance', 'mode-light': 'Light', 'mode-light-desc': 'Clean and bright', 'mode-dark': 'Dark', 'mode-dark-desc': 'Easy on the eyes', 'mode-auto': 'Auto', 'mode-auto-desc': 'Follow system', 'theme-section': 'Color Theme', 'footer-text': 'SYS WMS Pro © 2026 — All preferences saved automatically.', 'latin': 'Latin', 'arabic-latin': 'Arabic + Latin', 'settings-title': 'Settings', 'language-label': 'Language', 'font-label': 'System Font', 'dark-label': 'System Theme', 'open-settings': 'Open Full Settings', 'logout': 'Log Out', 'absent': 'Absent', 'accent-color': 'Accent Color', 'actions': 'Actions', 'active-roster': 'Active Roster', 'add-worker': 'Add Worker', 'advances': 'Advances', 'advances-deducted': 'Advances Deducted', 'advances-list': 'Advances List', 'advances-tab-sub': 'Manage Advances', 'advances-tab-title': 'Advances Management', 'amount-iqd': 'Amount (IQD)', 'attendance': 'Attendance', 'attendance-matrix': 'Attendance Matrix', 'attendance-sub': 'Manage Attendance', 'attendance-title': 'Attendance Management', 'auth-back-login': 'Back to Login', 'auth-create-account': 'Create Account', 'auth-email': 'Email', 'auth-login-btn': 'Log In', 'auth-no-account': 'No Account?', 'auth-password': 'Password', 'auth-reg-btn': 'Register', 'auth-reg-company': 'Company Name', 'auth-reg-name': 'Full Name', 'auth-reg-phone': 'Phone', 'auth-reg-pos': 'Position', 'auth-reg-title': 'Register Company', 'auth-slider-desc-1': 'Your integrated platform for registering worker data, tracking daily attendance, and organizing salaries and advances with ease and professionalism.', 'auth-slider-title-1': 'Welcome to the Comprehensive Worker Management System', 'auth-slider-title-2': 'Fast & Secure Attendance Tracking', 'auth-slider-desc-2': 'Use the barcode scanning system to log workers in seconds, with real-time, accurate, and highly secure overtime management.', 'auth-welcome': 'Welcome', 'card-font': 'Card Font', 'card-settings': 'Card Settings', 'check-in': 'Check In', 'check-out': 'Check Out', 'daily-cost': 'Daily Cost', 'daily-rate': 'Daily Rate', 'daily-salary': 'Daily Salary', 'dashboard': 'Dashboard', 'date': 'Date', 'days': 'Days', 'end-date': 'End Date', 'export-csv': 'Export CSV', 'export-pdf': 'Export PDF', 'full-name': 'Full Name', 'gross': 'Gross Pay', 'gross-minus-adv': 'Gross minus Advances', 'gross-pay': 'Gross Pay', 'idcard-sub': 'Generate ID Cards', 'idcard-title': 'ID Cards', 'idcards': 'ID Cards', 'import-csv': 'Import CSV', 'loading-db': 'Loading...', 'net-pay': 'Net Pay', 'net-pay-col': 'Net Pay', 'notes': 'Notes', 'ot-hrs': 'OT Hrs', 'ot-logged': 'OT Logged', 'ot-pay': 'OT Pay', 'overtime': 'Overtime', 'paid-standard': 'Standard Pay', 'photo-name': 'Photo & Name', 'position': 'Position', 'present': 'Present', 'present-today': 'Present Today', 'preview-mode': 'Preview Mode', 'print-report-title': 'Print Report', 'print-selected': 'Print Selected', 'quick-actions': 'Quick Actions', 'reason': 'Reason', 'record-advance': 'Record Advance', 'records': 'Records', 'recovered-payroll': 'Recovered Payroll', 'reg-pay': 'Regular Pay', 'reporting-period': 'Reporting Period', 'reports': 'Reports', 'reports-sub': 'View Reports', 'reports-title': 'System Reports', 'run-report': 'Run Report', 'salary-report': 'Salary Report', 'scan-placeholder': 'Scan Barcode', 'search-workers': 'Search Workers', 'select-all': 'Select All', 'select-worker': 'Select Worker', 'settings': 'Settings', 'start-date': 'Start Date', 'status': 'Status', 'submit': 'Submit', 'todays-log': "Today's Log", 'total-payroll': 'Total Payroll', 'total-workers': 'Total Workers', 'worker-id': 'Worker ID', 'worker-list': 'Worker List', 'worker-name': 'Worker Name', 'workers': 'Workers', 'workers-mgmt': 'Workers Management', 'secondary-logo': 'Secondary Logo', 'upload-image': 'Upload Image...'
      },
      ar: {
        'scanner-setup-title': 'إعداد ماسح الهاتف المحمول', 'scanner-setup-desc': 'استخدم رمز الشركة الآمن هذا لربط الهواتف الذكية الميدانية بماسح الحضور المباشر.', 'open-scanner': 'فتح تطبيق الماسح', 'company-code': 'رمز الشركة',
        'settings-desc': 'تخصيص المظهر ولغة نظام SYS WMS Pro.', 'language-section': 'اللغة', 'lang-en': 'الإنجليزية', 'lang-en-desc': 'تخطيط من اليسار إلى اليمين', 'lang-ar': 'العربية', 'lang-ar-desc': 'تخطيط من اليمين إلى اليسار', 'font-section': 'الخطوط', 'appearance-section': 'المظهر', 'mode-light': 'فاتح', 'mode-light-desc': 'نظيف ومشرق', 'mode-dark': 'داكن', 'mode-dark-desc': 'مريح للعين', 'mode-auto': 'تلقائي', 'mode-auto-desc': 'حسب نظام التشغيل', 'theme-section': 'لون النظام', 'footer-text': 'SYS WMS Pro © 2026 — يتم حفظ جميع الإعدادات تلقائياً.', 'latin': 'لاتيني', 'arabic-latin': 'عربي + لاتيني', 'settings-title': 'الإعدادات', 'language-label': 'لغة النظام', 'font-label': 'خط النظام', 'dark-label': 'مظهر النظام', 'open-settings': 'فتح لوحة الإعدادات', 'logout': 'تسجيل الخروج', 'absent': 'غائب', 'accent-color': 'لون التمييز', 'actions': 'إجراءات', 'active-roster': 'العمال النشطون', 'add-worker': 'إضافة عامل', 'advances': 'السُّلَف', 'advances-deducted': 'السلف المستقطعة', 'advances-list': 'قائمة السلف', 'advances-tab-sub': 'إدارة السلف', 'advances-tab-title': 'إدارة السُّلَف', 'amount-iqd': 'المبلغ (د.ع)', 'attendance': 'الحضور المستمر', 'attendance-matrix': 'سجل الحضور', 'attendance-sub': 'إدارة الحضور', 'attendance-title': 'إدارة الحضور', 'auth-back-login': 'العودة لتسجيل الدخول', 'auth-create-account': 'إنشاء حساب جديد', 'auth-email': 'البريد الإلكتروني', 'auth-login-btn': 'تسجيل الدخول', 'auth-no-account': 'ليس لديك حساب؟', 'auth-password': 'كلمة المرور', 'auth-reg-btn': 'إرسال طلب التسجيل', 'auth-reg-company': 'اسم الشركة', 'auth-reg-name': 'الاسم الكامل', 'auth-reg-phone': 'رقم الهاتف', 'auth-reg-pos': 'المسمى الوظيفي', 'auth-reg-title': 'تسجيل شركة جديدة', 'auth-slider-desc-1': 'منصتك المتكاملة لتسجيل بيانات العمال، تتبع الحضور اليومي، وتنظيم الرواتب والسلف بسهولة واحترافية.', 'auth-slider-title-1': 'مرحباً بك في نظام إدارة العمال الشامل', 'auth-slider-title-2': 'تتبع سريع وآمن للحضور', 'auth-slider-desc-2': 'استخدم نظام مسح الباركود لتسجيل العمال في ثوانٍ، مع إدارة دقيقة وآمنة للوقت الإضافي في الوقت الفعلي.', 'auth-welcome': 'مرحباً بعودتك', 'card-font': 'خط البطاقة', 'card-settings': 'إعدادات البطاقة', 'check-in': 'تسجيل الدخول', 'check-out': 'تسجيل الخروج', 'daily-cost': 'التكلفة اليومية', 'daily-rate': 'الأجر اليومي', 'daily-salary': 'الراتب اليومي (د.ع)', 'dashboard': 'لوحة التحكم', 'date': 'التاريخ', 'days': 'أيام', 'end-date': 'تاريخ الانتهاء', 'export-csv': 'تصدير CSV', 'export-pdf': 'تصدير PDF', 'full-name': 'الاسم الكامل', 'gross': 'الإجمالي', 'gross-minus-adv': 'الإجمالي بعد السلف', 'gross-pay': 'الأجر الإجمالي', 'idcard-sub': 'إصدار بطاقات الهوية', 'idcard-title': 'بطاقات الهوية', 'idcards': 'بطاقات الهوية', 'import-csv': 'استيراد CSV', 'loading-db': 'جاري التحميل...', 'net-pay': 'الصافي', 'net-pay-col': 'الصافي', 'notes': 'ملاحظات', 'ot-hrs': 'ساعات الإضافي', 'ot-logged': 'الإضافي المسجل', 'ot-pay': 'أجر الإضافي', 'overtime': 'العمل الإضافي', 'paid-standard': 'الأجر الأساسي', 'photo-name': 'الصورة والاسم', 'position': 'المنصب/المهنة', 'present': 'حاضر', 'present-today': 'الحاضرون اليوم', 'preview-mode': 'وضع المعاينة', 'print-report-title': 'طباعة التقرير', 'print-selected': 'طباعة المحدد', 'quick-actions': 'إجراءات سريعة', 'reason': 'السبب', 'record-advance': 'تسجيل سلفة', 'records': 'السجلات', 'recovered-payroll': 'الرواتب المستردة', 'reg-pay': 'الأجر العادي', 'reporting-period': 'فترة التقرير', 'reports': 'التقارير', 'reports-sub': 'عرض التقارير', 'reports-title': 'تقارير النظام', 'run-report': 'عرض التقرير', 'salary-report': 'تقرير الرواتب', 'scan-placeholder': 'مسح الباركود', 'search-workers': 'البحث عن العمال', 'select-all': 'تحديد الكل', 'select-worker': 'اختر العامل', 'settings': 'الإعدادات', 'start-date': 'تاريخ البدء', 'status': 'الحالة', 'submit': 'حفظ / إرسال', 'todays-log': "سجل اليوم", 'total-payroll': 'إجمالي الرواتب', 'total-workers': 'إجمالي العمال', 'worker-id': 'المعرف', 'worker-list': 'قائمة العمال', 'worker-name': 'اسم العامل', 'workers': 'العمال', 'workers-mgmt': 'إدارة العمال', 'secondary-logo': 'شعار الشركة', 'upload-image': 'رفع صورة...'
      }
    };

    const FONTS = [
      { name: 'Inter', ar: false }, { name: 'Roboto', ar: false }, { name: 'Poppins', ar: false },
      { name: 'Outfit', ar: false }, { name: 'DM Sans', ar: false }, { name: 'Cairo', ar: true },
      { name: 'Tajawal', ar: true }, { name: 'Noto Sans Arabic', ar: true },
      { name: 'Almarai', ar: true }, { name: 'IBM Plex Sans Arabic', ar: true },
    ];

    const FONT_URLS = {
      'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
      'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap',
      'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap',
      'Outfit': 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap',
      'DM Sans': 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap',
      'Cairo': 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap',
      'Tajawal': 'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap',
      'Noto Sans Arabic': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap',
      'Almarai': 'https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap',
      'IBM Plex Sans Arabic': 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap',
    };

    const THEMES = [
      { id: 'forge', color: '#f49000' }, { id: 'slate', color: '#3b82f6' },
      { id: 'emerald', color: '#10b981' }, { id: 'rose', color: '#e11d48' },
      { id: 'violet', color: '#7c3aed' },
    ];

    function get(k) { return localStorage.getItem('wms_' + k) || DEFAULTS[k]; }
    function set(k, v) {
      localStorage.setItem('wms_' + k, v); apply(k, v);
      if (window.WMSSettings && window.WMSSettings.rebuild) window.WMSSettings.rebuild();
      window.dispatchEvent(new CustomEvent('wms-settings-update', { detail: { k, v } }));
    }

    const _fonts = new Set();
    function loadF(n) { if (!_fonts.has(n) && FONT_URLS[n]) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = FONT_URLS[n]; document.head.appendChild(l); _fonts.add(n); } }

    function apply(k, v) {
      if (k === 'theme') ROOT.setAttribute('data-theme', v);
      if (k === 'dark') { ROOT.setAttribute('data-dark', v); ROOT.classList.toggle('dark', v === 'true'); }
      if (k === 'lang') { ROOT.setAttribute('lang', v); ROOT.setAttribute('dir', v === 'ar' ? 'rtl' : 'ltr'); if (document.body) applyT(v); }
      if (k === 'font') {
        loadF(v);
        ROOT.style.setProperty('--wms-font', `'${v}', sans-serif`);
        let s = document.getElementById('wms-font-override');
        if (!s) { s = document.createElement('style'); s.id = 'wms-font-override'; document.head.appendChild(s); }
        s.textContent = `*:not(.material-symbols-outlined):not(#id-card-element):not(#id-card-element *) { font-family: '${v}', sans-serif !important; }`;
      }
    }

    function applyT(l) {
      const t = window.WMS_I18N[l] || window.WMS_I18N['en'];
      document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.getAttribute('data-i18n'); if (t[k]) el.textContent = t[k]; });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { const k = el.getAttribute('data-i18n-placeholder'); if (t[k]) el.setAttribute('placeholder', t[k]); });
    }

    function build() {
      const l = get('lang'), t = window.WMS_I18N[l] || window.WMS_I18N['en'], curT = get('theme'), curF = get('font'), isD = get('dark');

      // Explicit Javascript color computation to bypass all CSS inheritance bugs
      const bg = isD === 'true' ? '#0f172a' : '#fff';
      const border = isD === 'true' ? '#1e293b' : '#e2e8f0';
      const textMain = isD === 'true' ? '#f1f5f9' : '#334155';
      const textMuted = isD === 'true' ? '#94a3b8' : '#64748b';
      const btnBg = isD === 'true' ? '#1e293b' : '#fff';
      const activeBg = isD === 'true' ? '#f4900020' : '#fff9f0';
      const activeBorder = '#f49000';

      const ths = THEMES.map(th => `<button onclick="WMSSettings.setT('${th.id}')" style="width:24px;height:24px;border-radius:50%;background:${th.color};border:2px solid ${th.id === curT ? '#fff' : 'transparent'};cursor:pointer;box-shadow:${th.id === curT ? '0 0 0 2px ' + th.color : 'none'};"></button>`).join('');
      const fts = FONTS.map(f => `<option value="${f.name}" ${f.name === curF ? 'selected' : ''} style="background:${bg}; color:${textMain};">${f.name}${f.ar ? ' ✦' : ''}</option>`).join('');

      return `
<div id="wms-dropdown" onclick="event.stopPropagation()" style="position:fixed; width:240px; background:${bg}; border:1px solid ${border}; border-radius:12px; padding:16px; box-shadow:0 10px 30px rgba(0,0,0,0.1); z-index:9999; font-family:var(--wms-font,'Inter',sans-serif); direction:${l === 'ar' ? 'rtl' : 'ltr'}; color:${textMain};">
  <p style="font-size:10px; font-weight:900; color:${textMuted}; margin:0 0 12px; text-transform:uppercase;">${t['settings-title']}</p>
  
  <div style="margin-bottom:12px;">
    <p style="font-size:10px; font-weight:800; color:${textMuted}; margin-bottom:6px;">${t['language-label']}</p>
    <div style="display:flex; gap:4px;">
      <button onclick="WMSSettings.setL('en')" style="flex:1; padding:6px; border-radius:6px; border:1.5px solid ${l === 'en' ? activeBorder : border}; background:${l === 'en' ? activeBg : btnBg}; font-size:11px; font-weight:800; cursor:pointer; color:${textMain}; transition:all 0.2s;">EN</button>
      <button onclick="WMSSettings.setL('ar')" style="flex:1; padding:6px; border-radius:6px; border:1.5px solid ${l === 'ar' ? activeBorder : border}; background:${l === 'ar' ? activeBg : btnBg}; font-size:11px; font-weight:800; cursor:pointer; color:${textMain}; transition:all 0.2s;">AR</button>
    </div>
  </div>
  
  <div style="margin-bottom:12px;">
    <p style="font-size:10px; font-weight:800; color:${textMuted}; margin-bottom:6px;">${t['font-label']}</p>
    <select onchange="WMSSettings.setF(this.value)" style="width:100%; padding:6px; border-radius:6px; border:1px solid ${border}; background:${btnBg}; color:${textMain}; font-size:11px; font-family:inherit; outline:none; cursor:pointer;">${fts}</select>
  </div>
  
  <div style="margin-bottom:12px;">
    <p style="font-size:10px; font-weight:800; color:${textMuted}; margin-bottom:6px;">${t['dark-label']}</p>
    <div style="display:flex; gap:4px;">
      <button onclick="WMSSettings.setD('false')" style="flex:1; padding:6px; border-radius:6px; border:1.5px solid ${isD === 'false' ? activeBorder : border}; background:${isD === 'false' ? activeBg : btnBg}; font-size:11px; font-weight:800; cursor:pointer; color:${textMain}; transition:all 0.2s;">${t['mode-light'] || 'Light'}</button>
      <button onclick="WMSSettings.setD('true')" style="flex:1; padding:6px; border-radius:6px; border:1.5px solid ${isD === 'true' ? activeBorder : border}; background:${isD === 'true' ? activeBg : btnBg}; font-size:11px; font-weight:800; cursor:pointer; color:${textMain}; transition:all 0.2s;">${t['mode-dark'] || 'Dark'}</button>
    </div>
  </div>
  
  <div style="margin-bottom:12px;"><div style="display:flex; gap:8px; justify-content:center;">${ths}</div></div>
  
  <div style="padding-top:12px; border-top:1px solid ${border}; text-align:center; display:flex; justify-content:space-between; align-items:center;">
    <a href="settings.html" style="font-size:11px; font-weight:800; color:#f49000; text-decoration:none;">${t['open-settings']}</a>
    <button onclick="window.WMSLogout()" style="font-size:11px; font-weight:800; color:#ef4444; background:transparent; border:1px solid #ef4444; cursor:pointer; padding:6px 12px; border-radius:6px;">${t['logout'] || 'Log Out'}</button>
  </div>
</div>`;
    }

    window.WMSLogout = async function () {
      if (window.sbClient && window.sbClient.auth) {
        await window.sbClient.auth.signOut();
      }
      window.location.href = 'auth.html';
    };

    window.WMSSettings = {
      get, set,
      setL(l) { set('lang', l); },
      setD(d) { set('dark', d); },
      setT(t) { set('theme', t); },
      setF(f) { set('font', f); },
      // ✅ FIX #1: Expose applyT function to global scope for settings.html
      applyT: applyT,
      // ✅ FIX #1: Add applyTranslations alias for compatibility with settings.html
      applyTranslations: applyT,
      // ✅ FIX #2: Expose FONT_URLS object to global scope for settings.html font preloading
      FONT_URLS: FONT_URLS,
      rebuild() {
        const dd = document.getElementById('wms-dropdown');
        if (dd) {
          const t = dd.style.top;
          const l = dd.style.left;
          dd.outerHTML = build();
          const newDd = document.getElementById('wms-dropdown');
          if (newDd && t && l) {
            newDd.style.top = t;
            newDd.style.left = l;
          }
        }
        const l = document.getElementById('hdr-lang-label');
        if (l) l.textContent = get('lang').toUpperCase();
        const d = document.getElementById('hdr-dark-icon');
        if (d) d.textContent = get('dark') === 'true' ? 'light_mode' : 'dark_mode';
      }
    };

    function init() {
      // Security: Disable Right-Click and DevTools
      document.addEventListener('contextmenu', e => e.preventDefault());
      document.addEventListener('keydown', e => {
          if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) || (e.ctrlKey && e.key.toUpperCase() === 'U')) {
              e.preventDefault();
          }
      });

      ['theme', 'dark', 'lang', 'font'].forEach(k => apply(k, get(k)));
      document.addEventListener('click', (e) => {
        const tr = e.target.closest('[data-wms-settings-trigger]');
        if (tr) {
          e.preventDefault(); e.stopPropagation();
          const ex = document.getElementById('wms-dropdown');
          if (ex) { ex.remove(); return; }

          document.querySelectorAll('#wms-dropdown').forEach(d => d.remove());

          // Calculate position based on trigger
          const rect = tr.getBoundingClientRect();
          const html = build();
          document.body.insertAdjacentHTML('beforeend', html);

          const dd = document.getElementById('wms-dropdown');
          if (dd) {
            // Position fixed to viewport, right-aligned to the trigger
            dd.style.position = 'fixed';
            dd.style.top = (rect.bottom + 8) + 'px';

            // Try to align the right edge of dropdown with right edge of trigger
            const rightEdge = rect.right;
            const leftPos = rightEdge - 240; // 240px is width

            // Keep on screen
            dd.style.left = Math.max(16, leftPos) + 'px';
          }
          return;
        }
        if (!e.target.closest('#wms-dropdown')) { document.querySelectorAll('#wms-dropdown').forEach(d => d.remove()); }
      });
      if (document.body) applyT(get('lang'));
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
    else { init(); }
  })();
}
