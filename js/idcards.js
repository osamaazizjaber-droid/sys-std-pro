document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase from global reference found in config.js
    const supabase = window.sbClient;
    if (!supabase) {
        console.error("Supabase client not found!");
        return;
    }

    const listContainer = document.getElementById('student-list-container');
    const totalCount = document.getElementById('total-student-count');
    const searchInput = document.getElementById('search-students');
    const filterStage = document.getElementById('filter-stage');
    const selectAllCheckbox = document.getElementById('select-all-students');
    const printCountBadge = document.getElementById('print-count-badge');
    
    // Card Elements
    const cardName = document.getElementById('card-name');
    const cardGrade = document.getElementById('card-grade');
    const cardYear = document.getElementById('card-year');
    const cardPhoto = document.getElementById('card-photo');
    const barcodeText = document.getElementById('barcode-text');
    const cardBarcode = document.getElementById('card-barcode');
    
    let studentsData = [];
    
    async function loadStudents() {
        try {
            const { data, error, count } = await supabase
                .from('students')
                .select('*', { count: 'exact' })
                .neq('status', 'Graduated')
                .order('student_name', { ascending: true });
                
            if (error) throw error;
            
            studentsData = data || [];
            const lang = (window.WMSSettings && window.WMSSettings.get('lang')) || 'en'; const totalText = lang === 'ar' ? 'الإجمالي' : 'Total'; totalCount.textContent = `${count || 0} ${totalText}`;
            
            renderList(studentsData);
            
            // Auto-preview first student if available
            if (studentsData.length > 0) {
                updatePreview(studentsData[0]);
            }
        } catch (err) {
            console.error("Error loading students:", err);
            if (listContainer) {
                listContainer.innerHTML = `<div class="p-4 text-error text-xs text-left font-bold" style="word-break: break-all;">DEBUG ERROR:<br/>${err.message || JSON.stringify(err)}<br/>${err.stack || ''}</div>`;
            }
        }
    }
    
    function renderList(list) {
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        if (list.length === 0) {
            const lang = (window.WMSSettings && typeof window.WMSSettings.get === 'function') ? window.WMSSettings.get('lang') : 'en';
            const i18n = window.WMS_I18N || { en: {}, ar: {} };
            const t = i18n[lang] || i18n['en'] || {};
            listContainer.innerHTML = `<div class="p-4 text-on-surface-variant text-sm text-center">${t['no-students-match'] || 'No students match criteria.'}</div>`;
            return;
        }
        
        list.forEach(w => {
            const label = document.createElement('label');
            label.className = "flex items-center gap-3 p-2 mb-1 rounded-lg hover:bg-surface-container-highest cursor-pointer group transition-colors";
            
            // Input checkbox
            const relativeDiv = document.createElement('div');
            relativeDiv.className = "relative flex items-center";
            const currentIdFormat = w.student_id;
            
            relativeDiv.innerHTML = `
                <input class="worker-checkbox peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-outline-variant checked:border-primary checked:bg-primary transition-all" type="checkbox" data-id="${w.student_id}">
                <span class="material-symbols-outlined absolute text-on-primary text-sm left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 pointer-events-none" style="font-variation-settings: 'wght' 600;">check</span>
            `;
            
            const infoDiv = document.createElement('div');
            infoDiv.className = "flex flex-col flex-1 truncate";
            infoDiv.innerHTML = `
                <span class="text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">${w.student_name || 'Unknown'}</span>
                <span class="text-xs text-on-surface-variant font-mono truncate">${currentIdFormat} - ${w.grade || 'Student'}</span>
            `;
            
            label.appendChild(relativeDiv);
            label.appendChild(infoDiv);
            
            // Click to preview (but don't interfere with checkbox ticking native behavior)
            label.addEventListener('click', (e) => {
                updatePreview(w);
                
                // Highlight selection UI softly
                document.querySelectorAll('#student-list-container label').forEach(l => l.classList.remove('bg-surface-container-low', 'border', 'border-surface-container-highest'));
                label.classList.add('bg-surface-container-low', 'border', 'border-surface-container-highest');
            });
            
            // Listen to checkbox changes to update print count badge
            const cb = relativeDiv.querySelector('input');
            if(cb) {
                cb.addEventListener('change', updatePrintCount);
            }
            
            listContainer.appendChild(label);
        });
    }
    
    function updatePreview(w) {
        if (!cardName) return;
        
        const lang = (window.WMSSettings && typeof window.WMSSettings.get === 'function') ? window.WMSSettings.get('lang') : 'en';
        const i18n = window.WMS_I18N || { en: {}, ar: {} };
        const t = i18n[lang] || i18n['en'] || {};
        
        cardName.textContent = w.student_name || t['unknown-user'] || 'Unknown User';
        if (cardGrade) cardGrade.textContent = w.grade || t['students'] || 'Student';
        if (cardYear) cardYear.textContent = w.academic_year || '';
        const formattedId = w.student_id;
        if (barcodeText) barcodeText.textContent = formattedId;
        
        if (w.photo_url) {
            if (cardPhoto) cardPhoto.src = w.photo_url;
        } else {
            if (cardPhoto) cardPhoto.src = 'https://cdn-icons-png.flaticon.com/512/847/847969.png'; // Fallback
        }

        if (cardBarcode && typeof window.JsBarcode !== 'undefined') {
            window.JsBarcode(cardBarcode, formattedId, {
                format: "CODE128", width: 2, height: 45, displayValue: true, fontSize: 13, fontOptions: "bold", font: "monospace", margin: 0, lineColor: "#0f172a"
            });
        }
    }
    
    function applyFilters() {
        const term = searchInput?.value.toLowerCase() || '';
        const stage = filterStage?.value || 'all';

        const filtered = studentsData.filter(w => {
            const matchesSearch = !term || 
                (w.student_name && w.student_name.toLowerCase().includes(term)) || 
                (w.student_id && w.student_id.toString().toLowerCase().includes(term));
            
            const matchesStage = stage === 'all' || w.grade === stage;

            return matchesSearch && matchesStage;
        });

        renderList(filtered);
        updatePrintCount();
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (filterStage) filterStage.addEventListener('change', applyFilters);
    
    // Select All Checkbox
    if(selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            document.querySelectorAll('.worker-checkbox').forEach(cb => {
                cb.checked = isChecked;
            });
            updatePrintCount();
        });
    }
    
    function updatePrintCount() {
        if(!printCountBadge) return;
        const checkedBoxes = document.querySelectorAll('.worker-checkbox:checked');
        printCountBadge.textContent = `(${checkedBoxes.length})`;
    }
    
    // --- PRINTING LOGIC ---
    const btnPrint = document.getElementById('btn-print-cards');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            const checkedBoxes = Array.from(document.querySelectorAll('.worker-checkbox:checked'));
            if (checkedBoxes.length === 0) {
                return alert("Please select at least one worker from the list to print.");
            }
            
            const selectedIds = checkedBoxes.map(cb => cb.getAttribute('data-id'));
            const selectedWorkers = studentsData.filter(w => selectedIds.includes(w.student_id));
            
            const cardHeader = document.getElementById('card-header');
            const accentColor = cardHeader ? cardHeader.style.backgroundColor || '#8b5000' : '#8b5000';
            const showBarcode = true;
            
            const fontSelector = document.getElementById('font-selector');
            const printFontFamily = fontSelector ? fontSelector.value : "'Inter', sans-serif";

            let cardsHtml = '';
            const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            
            selectedWorkers.forEach(w => {
                const formattedId = w.student_id;
                const photoSrc = w.photo_url || 'https://cdn-icons-png.flaticon.com/512/847/847969.png';
                
                let barcodeSvgString = '';
                if (showBarcode && typeof window.JsBarcode !== 'undefined') {
                    window.JsBarcode(tempSvg, formattedId, {
                        format: "CODE128", width: 2, height: 45, displayValue: true, fontSize: 13, fontOptions: "bold", font: "monospace", margin: 0, lineColor: "#0f172a"
                    });
                    barcodeSvgString = tempSvg.outerHTML;
                }
                
                cardsHtml += `
                <div class="print-card" style="page-break-inside: avoid;">
                    <div class="card-header" style="background-color: ${accentColor} !important; border-top-left-radius: 8px; border-top-right-radius: 8px; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                        <div class="logo-container">
                            <img class="logo" src="logo.png" alt="Logo">
                        </div>
                        <h2 class="app-title">SYS STD PRO</h2>
                        <div class="logo-container">
                            ${window.secondaryLogoDataURL ? `<img class="logo" style="width:100%; height:100%; object-fit:contain;" src="${window.secondaryLogoDataURL}" alt="Secondary Logo">` : `<span style="font-family: 'Material Symbols Outlined'; font-size: 24px; color: ${accentColor};">&#xe85e;</span>`}
                        </div>
                    </div>
                    
                    <div class="card-body">
                        <div class="photo-side">
                            <img class="photo" src="${photoSrc}"/>
                        </div>
                        
                        <div class="data-side">
                            <h4 class="worker-name">${w.student_name || 'Unknown'}</h4>
                            <p class="worker-grade">${w.grade || 'Student'}</p>
                            <p class="worker-grade" style="font-size:11px; color:#94a3b8; letter-spacing:0.1em; margin-top:2px;">${w.academic_year || ''}</p>
                            
                            ${showBarcode ? `
                            <div class="barcode-section">
                                ${barcodeSvgString}
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                `;
            });

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                <head>
                    <title>Print ID Cards - SYS STD Pro</title>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800;900&family=Cairo:wght@400;700;800&family=Tajawal:wght@400;700;800&family=Almarai:wght@400;700;800&family=Changa:wght@400;700;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet"/>
                    <style>
                        @page {
                            size: A4 portrait;
                            margin: 10mm 15mm;
                        }
                        body {
                            font-family: ${printFontFamily};
                            margin: 0;
                            padding: 0;
                            background: white;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .print-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            column-gap: 5mm;
                            row-gap: 10mm;
                            justify-items: center;
                            align-items: start;
                            width: 100%;
                            box-sizing: border-box;
                        }
                        .print-card {
                            width: 324px;
                            height: 204px;
                            border: 1px solid #e2e8f0;
                            border-radius: 8px;
                            background: white;
                            box-sizing: border-box;
                            display: flex;
                            flex-direction: column;
                            position: relative;
                            overflow: hidden;
                        }
                        .card-header {
                            height: 68px;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            padding: 0 12px;
                            box-sizing: border-box;
                            position: relative;
                            flex-shrink: 0;
                        }
                        .logo-container {
                            width: 44px;
                            height: 44px;
                            border-radius: 50%;
                            background: white;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border: 1.5px solid white;
                            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                            overflow: hidden;
                        }
                        .logo {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        }
                        .app-title {
                            color: white;
                            font-weight: 700;
                            font-size: 13px;
                            letter-spacing: 0.15em;
                            margin: 0;
                            text-align: center;
                            position: absolute;
                            left: 50%;
                            transform: translateX(-50%);
                        }
                        .card-body {
                            flex: 1;
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            padding: 12px;
                            position: relative;
                            box-sizing: border-box;
                            background: white;
                        }
                        .photo-side {
                            width: 72px;
                            height: 92px;
                            border-radius: 4px;
                            border: 1px solid #e2e8f0;
                            background: #f1f5f9;
                            overflow: hidden;
                            position: absolute;
                            left: 12px;
                            top: 12px;
                        }
                        .photo {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        }
                        .data-side {
                            flex: 1;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            overflow: hidden;
                            text-align: center;
                            padding-left: 84px;
                            box-sizing: border-box;
                        }
                        .worker-name {
                            font-size: 24px;
                            font-weight: 800;
                            color: #0f172a;
                            margin: 0 0 2px 0;
                            line-height: 1.1;
                            width: 100%;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            letter-spacing: -0.02em;
                        }
                        .worker-grade {
                            font-size: 15px;
                            font-weight: 800;
                            color: #64748b;
                            margin: 0;
                            width: 100%;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                        .barcode-section {
                            margin-top: 8px;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            width: 100%;
                        }
                        .barcode-section svg {
                            width: 100%;
                            max-width: 150px;
                            height: auto;
                            display: block;
                        }
                    </style>
                </head>
                <body>
                    <div class="print-grid">
                        ${cardsHtml}
                    </div>
                    <script>
                        setTimeout(() => {
                            window.print();
                        }, 500);
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        });
    }

    // Interactive Color Button Settings
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const color = e.currentTarget.getAttribute('data-color');
            const cardHeader = document.getElementById('card-header');
            if(cardHeader) {
                cardHeader.style.backgroundColor = color;
            }
            
            // update selection active state
            document.querySelectorAll('.color-btn').forEach(b => {
                b.classList.remove('ring-2', 'ring-offset-2');
                b.style.removeProperty('--tw-ring-color');
            });
            e.currentTarget.classList.add('ring-2', 'ring-offset-2');
            e.currentTarget.style.setProperty('--tw-ring-color', color);
        });
    });

    // Interactive Font family change
    const fontSelector = document.getElementById('font-selector');
    if (fontSelector) {
        fontSelector.addEventListener('change', (e) => {
            const cardEl = document.getElementById('id-card-element');
            if (cardEl) {
                cardEl.style.fontFamily = e.target.value;
                const nameEl = document.getElementById('card-name');
                const gradeEl = document.getElementById('card-grade');
                if (nameEl) nameEl.style.fontFamily = e.target.value;
                if (gradeEl) gradeEl.style.fontFamily = e.target.value;
            }
        });
        
        // ensure default is applied to card initially
        const cardEl = document.getElementById('id-card-element');
        if (cardEl && fontSelector.value) {
            cardEl.style.fontFamily = fontSelector.value;
            const nameEl = document.getElementById('card-name');
            const gradeEl = document.getElementById('card-grade');
            if (nameEl) nameEl.style.fontFamily = fontSelector.value;
            if (gradeEl) gradeEl.style.fontFamily = fontSelector.value;
        }
    }

    // Init Page
    loadStudents();
});


// Secondary Logo Upload Logic
window.secondaryLogoDataURL = localStorage.getItem('wms_secondary_logo') || null;
document.addEventListener('DOMContentLoaded', () => {
    const secondaryUpload = document.getElementById('secondary-logo-upload');
    const secondaryFilename = document.getElementById('secondary-logo-filename');
    
    if (secondaryUpload && secondaryFilename) {
        if (window.secondaryLogoDataURL) {
            secondaryFilename.textContent = "Saved Logo";
            secondaryFilename.removeAttribute('data-i18n'); // prevent translator from hiding filename
        }
        
        secondaryUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                secondaryFilename.textContent = file.name;
                secondaryFilename.removeAttribute('data-i18n');
                const reader = new FileReader();
                reader.onload = (re) => {
                    window.secondaryLogoDataURL = re.target.result;
                    try {
                        localStorage.setItem('wms_secondary_logo', window.secondaryLogoDataURL);
                    } catch (err) {
                        console.warn('Logo too large for localStorage', err);
                    }
                };
                reader.readAsDataURL(file);
            } else {
                secondaryFilename.textContent = "Upload Image...";
                secondaryFilename.setAttribute('data-i18n', 'upload-image');
                if (window.WMSSettings && window.WMSSettings.applyTranslations) {
                    window.WMSSettings.applyTranslations(localStorage.getItem('wms_lang') || 'en');
                }
                window.secondaryLogoDataURL = null;
                localStorage.removeItem('wms_secondary_logo');
            }
        });
    }
});
