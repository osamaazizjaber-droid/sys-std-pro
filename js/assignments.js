// sys-wms-web/js/assignments.js

document.addEventListener('DOMContentLoaded', async () => {
    const supabase = window.sbClient;
    if(!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const userId = user.id;

    const form = document.getElementById('assignment-form');
    const tbody = document.getElementById('assignments-tbody');
    const profSelect = document.getElementById('assign-prof');
    const subjectList = document.getElementById('subject-suggestions');

    let professors = [];
    let assignments = [];

    async function init() {
        await loadProfessors();
        await loadAssignments();
    }

    async function loadProfessors() {
        const { data } = await supabase.from('professors').select('prof_id, prof_name').eq('college_id', userId).order('prof_name');
        if (data) {
            professors = data;
            const lang = window.WMSSettings ? window.WMSSettings.get('lang') : 'en';
            const dict = window.WMS_I18N[lang] || window.WMS_I18N['en'];
            profSelect.innerHTML = `<option value="">${dict['select-prof'] || 'Select Professor...'}</option>`;
            data.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.prof_id;
                opt.textContent = p.prof_name;
                profSelect.appendChild(opt);
            });
        }
    }

    async function loadAssignments() {
        tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-slate-300 animate-pulse">Loading assignments...</td></tr>`;
        const { data, error } = await supabase.from('subject_assignments').select(`*, professors(prof_name)` ).eq('college_id', userId);
        if (error) console.error(error);
        if (data) {
            assignments = data;
            renderAssignments();
            updateSubjectSuggestions();
        }
    }

    function renderAssignments() {
        tbody.innerHTML = '';
        if (assignments.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-12 text-center text-slate-300 italic">No assignments created yet.</td></tr>`;
            return;
        }

        assignments.forEach(a => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0";
            
            // Build professor options for inline select
            let profOptions = `<option value="">Select Prof...</option>`;
            professors.forEach(p => {
                profOptions += `<option value="${p.prof_id}" ${p.prof_id === a.prof_id ? 'selected' : ''}>${p.prof_name}</option>`;
            });

            tr.innerHTML = `
                <td class="px-6 py-4 text-sm font-bold text-slate-700">${a.stage_name}</td>
                <td class="px-6 py-4 text-sm font-black text-primary">${a.subject_name}</td>
                <td class="px-6 py-4 text-sm font-medium">
                    <select onchange="window.updateAssignmentProf('${a.id}', this.value)" class="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold outline-none focus:ring-1 focus:ring-primary w-full max-w-[200px]">
                        ${profOptions}
                    </select>
                </td>
                <td class="px-6 py-4 text-right">
                    <button onclick="deleteAssignment('${a.id}')" class="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.updateAssignmentProf = async (id, newProfId) => {
        const { error } = await supabase.from('subject_assignments').update({ prof_id: newProfId }).eq('id', id).eq('college_id', userId);
        if (error) {
            alert("Update failed: " + error.message);
            loadAssignments(); // Rollback UI
        }
    };

    function updateSubjectSuggestions() {
        const uniqueSubjects = [...new Set(assignments.map(a => a.subject_name))];
        subjectList.innerHTML = '';
        uniqueSubjects.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            subjectList.appendChild(opt);
        });
    }

    window.deleteAssignment = async (id) => {
        if (!confirm("Remove this assignment?")) return;
        const { error } = await supabase.from('subject_assignments').delete().eq('id', id).eq('college_id', userId);
        if (error) alert(error.message);
        else loadAssignments();
    };

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const stage = document.getElementById('assign-stage').value;
        const subject = document.getElementById('assign-subject').value.trim();
        const profId = document.getElementById('assign-prof').value;

        const btn = document.getElementById('btn-save-assignment');
        btn.disabled = true;

        const { error } = await supabase.from('subject_assignments').upsert([{
            college_id: userId,
            stage_name: stage,
            subject_name: subject,
            prof_id: profId
        }], { onConflict: 'college_id, stage_name, subject_name' });

        btn.disabled = false;
        if (error) {
            alert("Error: " + error.message);
        } else {
            form.reset();
            loadAssignments();
        }
    });

    // --- CSV IMPORT LOGIC ---
    const importCsvInput = document.getElementById('import-csv-file');
    if (importCsvInput) {
        importCsvInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                const text = event.target.result;
                const lines = text.split('\n').filter(l => l.trim());
                if (lines.length < 2) return alert("CSV is empty.");

                const headers = lines[0].toLowerCase().split(',');
                const stageIdx = headers.findIndex(h => h.includes('stage') || h.includes('grade'));
                const subjectIdx = headers.findIndex(h => h.includes('subject'));
                const profIdx = headers.findIndex(h => h.includes('prof'));

                if (stageIdx === -1 || subjectIdx === -1) {
                    return alert("CSV must have 'Stage' and 'Subject' columns.");
                }

                const newAssignments = [];
                for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split(',');
                    const sName = cols[stageIdx]?.trim();
                    const subName = cols[subjectIdx]?.trim();
                    const pName = profIdx !== -1 ? cols[profIdx]?.trim() : '';

                    if (!sName || !subName) continue;

                    // Match professor
                    let profId = null;
                    if (pName) {
                        const found = professors.find(p => p.prof_name.toLowerCase() === pName.toLowerCase());
                        if (found) profId = found.prof_id;
                    }

                    newAssignments.push({
                        college_id: userId,
                        stage_name: sName,
                        subject_name: subName,
                        prof_id: profId
                    });
                }

                if (newAssignments.length === 0) return alert("No valid assignments found.");

                if (confirm(`Import ${newAssignments.length} assignments?`)) {
                    const { error } = await supabase.from('subject_assignments').upsert(newAssignments, { onConflict: 'college_id, stage_name, subject_name' });
                    if (error) alert(error.message);
                    else {
                        alert("Successfully imported.");
                        loadAssignments();
                    }
                }
                importCsvInput.value = '';
            };
            reader.readAsText(file);
        });
    }

    init();
});
