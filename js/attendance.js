// sys-wms-web/js/attendance.js

document.addEventListener('DOMContentLoaded', async () => {
    const supabase = window.sbClient;
    if(!supabase) {
        console.error("Supabase not initialized.");
        return;
    }

    const attDateInput = document.getElementById('attendance-date');
    const attBarcodeInput = document.getElementById('attendance-barcode');
    const tbody = document.getElementById('attendance-tbody');
    const gradeSelect = document.getElementById('attendance-grade');
    const profSelect = document.getElementById('attendance-prof');
    const subjSelect = document.getElementById('attendance-subject');

    let attendanceList = [];
    let studentsList = [];
    let profsList = [];
    let allAssignments = []; 

    async function init() {
        await loadStudents();
        await loadProfessors();
        await loadAssignments();
        loadAttendanceData();
    }

    async function loadStudents() {
        const { data } = await supabase.from('students').select('student_id, student_name, grade');
        if (data) {
            studentsList = data;
            if (gradeSelect) {
                const uniqueGrades = [...new Set(studentsList.map(s => s.grade).filter(Boolean))];
                gradeSelect.innerHTML = '<option value="ALL">All Stages</option>';
                uniqueGrades.forEach(g => {
                    const opt = document.createElement('option');
                    opt.value = g; opt.textContent = g;
                    gradeSelect.appendChild(opt);
                });
                gradeSelect.addEventListener('change', () => {
                    renderAttendanceTable();
                    updateSubjectDropdown();
                });
            }
        }
    }

    async function loadProfessors() {
        const { data } = await supabase.from('professors').select('prof_id, prof_name');
        if (data && profSelect) {
            profsList = data;
            const lang = window.WMSSettings ? window.WMSSettings.get('lang') : 'en';
            const dict = window.WMS_I18N[lang] || window.WMS_I18N['en'];
            profSelect.innerHTML = `<option value="">${dict['select-prof'] || 'Select Professor...'}</option>`;
            data.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.prof_id;
                opt.textContent = p.prof_name;
                profSelect.appendChild(opt);
            });
            profSelect.addEventListener('change', () => {
                // If professor is selected, filter subjects. If cleared, show all for grade.
                updateSubjectDropdown(true); 
            });
        }
    }

    async function loadAssignments() {
        const { data } = await supabase.from('subject_assignments').select('*, professors(prof_name)');
        if (data) {
            allAssignments = data;
            updateSubjectDropdown();
        }
    }

    function updateSubjectDropdown(filteredByProf = false) {
        if (!subjSelect) return;
        const selectedGrade = gradeSelect?.value;
        const selectedProf = profSelect?.value;
        
        const prevValue = subjSelect.value;
        subjSelect.innerHTML = `<option value="">Select Subject...</option>`;
        
        let filtered = allAssignments;
        if (selectedGrade && selectedGrade !== 'ALL') {
            filtered = filtered.filter(a => a.stage_name === selectedGrade);
        }
        if (selectedProf) {
            filtered = filtered.filter(a => a.prof_id === selectedProf);
        }

        if (filtered.length > 0) {
            // Unique subjects in case one subject is assigned to multiple profs (though unlikely in current flow, we take uniquely for display)
            const uniqueSubjs = [...new Set(filtered.map(a => a.subject_name))];
            uniqueSubjs.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s;
                opt.textContent = s;
                subjSelect.appendChild(opt);
            });

            // Try to restore previous value if still valid
            if (prevValue && uniqueSubjs.includes(prevValue)) {
                subjSelect.value = prevValue;
            } else if (filtered.length === 1 && !filteredByProf) {
                // Auto-set if only one subject for this grade
                subjSelect.selectedIndex = 1;
                autoSelectProfessor(subjSelect.value);
            }
        }
    }

    subjSelect?.addEventListener('change', () => {
        autoSelectProfessor(subjSelect.value);
    });

    function autoSelectProfessor(subjectName) {
        if (!subjectName || !profSelect) return;
        const selectedGrade = gradeSelect?.value;
        
        let match = allAssignments.find(a => a.subject_name === subjectName && (selectedGrade === 'ALL' || a.stage_name === selectedGrade));
        if (match) {
            profSelect.value = match.prof_id;
        }
    }

    // Init Date
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    attDateInput.value = today;

    attDateInput.addEventListener('change', loadAttendanceData);

    attBarcodeInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const code = attBarcodeInput.value.trim();
            if(!code) return;
            await processAttendanceScan(code);
            attBarcodeInput.value = '';
            attBarcodeInput.focus();
        }
    });

    async function processAttendanceScan(code) {
        let student = studentsList.find(s => s.student_id === code || s.student_name.toLowerCase().includes(code.toLowerCase()));
        if (!student) {
            const { data } = await supabase.from('students').select('*').or(`student_id.eq.${code},student_name.ilike.%${code}%`).limit(1);
            if (data && data.length > 0) student = data[0];
        }

        if(!student) {
            alert(`Student not found: ${code}`);
            return;
        }

        const scanDate = attDateInput.value;
        const scanTime = new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: true});
        const profId = profSelect?.value || null;
        const subj = subjSelect?.value || 'General';
        const profName = profId ? profsList.find(p => p.prof_id === profId)?.prof_name : null;

        try {
            const { data: existing } = await supabase.from('attendance')
                .select('*')
                .eq('student_id', student.student_id)
                .eq('date', scanDate)
                .eq('subject', subj);
                
            if (existing && existing.length > 0) {
                alert(`${student.student_name} already logged for ${subj} today.`);
            } else {
                await supabase.from('attendance').insert([{
                    student_id: student.student_id,
                    student_name: student.student_name,
                    prof_id: profId,
                    prof_name: profName,
                    date: scanDate,
                    subject: subj,
                    grade: student.grade,
                    academic_year: window.WMSSettings?.get('academic_year') || '',
                    status: document.getElementById('attendance-status')?.value || 'Present',
                    check_in: scanTime,
                    notes: 'Auto-Log'
                }]);
            }
            loadAttendanceData();
        } catch(err) {
            alert("Error: " + err.message);
        }
    }

    async function loadAttendanceData() {
        const scanDate = attDateInput.value;
        tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-300">Loading...</td></tr>`;
        const { data } = await supabase.from('attendance').select('*').eq('date', scanDate).order('id', {ascending: false});
        attendanceList = data || [];
        renderAttendanceTable();
    }

    function renderAttendanceTable() {
        const selectedGrade = gradeSelect ? gradeSelect.value : 'ALL';
        let displayList = attendanceList;
        if (selectedGrade !== 'ALL') displayList = displayList.filter(a => a.grade === selectedGrade);

        tbody.innerHTML = '';
        if(displayList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="p-16 text-center text-slate-300">No records today.</td></tr>`;
            return;
        }

        displayList.forEach(att => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-slate-50 transition-colors border-b border-slate-100";
            tr.innerHTML = `
                <td class="px-6 py-4 text-xs font-mono text-slate-400">${att.student_id}</td>
                <td class="px-6 py-4 font-bold text-slate-900">${att.student_name}</td>
                <td class="px-6 py-4 text-sm font-medium">
                    <div class="flex flex-col">
                        <span class="text-primary font-black">${att.subject || '-'}</span>
                        <span class="text-[10px] text-slate-400 uppercase tracking-tighter">${att.prof_name || '-'}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-xs font-bold text-slate-500">${att.grade || '-'}</td>
                <td class="px-6 py-4 text-sm font-black text-emerald-600">${att.check_in || '--:--'}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase ${att.status === 'Absent' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}">${att.status}</span>
                </td>
                <td class="px-6 py-4 text-right">
                    <button onclick="deleteAttendance('${att.id}')" class="text-slate-300 hover:text-red-500"><span class="material-symbols-outlined text-sm">delete</span></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        const countBadge = document.getElementById('log-count');
        if (countBadge) countBadge.textContent = displayList.length;
    }

    window.deleteAttendance = async (id) => {
        if (!confirm("Delete record?")) return;
        await supabase.from('attendance').delete().eq('id', id);
        loadAttendanceData();
    };

    init();
});
