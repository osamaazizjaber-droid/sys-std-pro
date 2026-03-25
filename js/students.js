document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase from global reference found in config.js
    const supabase = window.sbClient;
    if (!supabase) {
        console.error("Supabase client not found!");
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error("User not authenticated.");
        return;
    }
    const userId = user.id;

    const tbody = document.getElementById('students-tbody');
    const kpiTotalStudents = document.getElementById('kpi-total-students');
    
    const photoInput = document.getElementById('student-photo-input');
    const photoPreview = document.getElementById('student-photo-preview');
    const photoIcon = document.getElementById('photo-placeholder-icon');
    
    const inputName = document.getElementById('student-name');
    const inputPos = document.getElementById('student-grade');
    const inputYear = document.getElementById('student-academic-year');
    const inputSal = document.getElementById('student-grade-hidden');
    const btnSubmit = document.getElementById('btn-submit-student');

    let currentPhotoBase64 = "";

    // Load initial data
    await loadStudents();
    populateAcademicYears();

    function populateAcademicYears() {
        const studentAY = document.getElementById('student-academic-year');
        const targetAY = document.getElementById('target-academic-year');
        const editAY = document.getElementById('edit-student-academic-year');
        if (!studentAY || !targetAY) return;

        const start = 2025;
        const end = 2040;
        let options = `<option value="" disabled selected data-i18n-placeholder="academic-year">Academic Year</option>`;
        let targetOptions = `<option value="" disabled selected data-i18n-placeholder="academic-year">Target Year</option>`;
        let editOptions = `<option value="" disabled selected>Academic Year</option>`;

        for (let y = start; y < end; y++) {
            const val = `${y}-${y+1}`;
            options += `<option value="${val}">${val}</option>`;
            targetOptions += `<option value="${val}">${val}</option>`;
            editOptions += `<option value="${val}">${val}</option>`;
        }

        studentAY.innerHTML = options;
        targetAY.innerHTML = targetOptions;
        if (editAY) editAY.innerHTML = editOptions;

        // Auto-select current global academic year if set
        if (window.WMSSettings) {
            const globalAY = window.WMSSettings.get('academic_year');
            if (globalAY) studentAY.value = globalAY;
        }
    }

    // 1. Photo selection & scaling logic
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                // Resize image dynamically (faster storage)
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const MAX_WIDTH = 256;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Convert to compressed jpeg base64
                currentPhotoBase64 = canvas.toDataURL('image/jpeg', 0.8);
                
                // Show in UI
                photoIcon.classList.add('hidden');
                photoPreview.src = currentPhotoBase64;
                photoPreview.classList.remove('hidden');
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(file);
    });

    // 2. Submit Student
    btnSubmit.addEventListener('click', async () => {
        const name = inputName.value.trim();
        const pos = inputPos.value;
        const year = inputYear ? inputYear.value : '';
        const sal = 0;

        if (!name) {
            alert("Please provide a valid Name!");
            return;
        }

        const btnText = btnSubmit.textContent;
        btnSubmit.textContent = "Saving...";
        btnSubmit.disabled = true;

        try {
            // Calculate Next Sequential ID
            const { data: lastStudent, error: lastErr } = await supabase
                .from('students')
                .select('student_id')
                .eq('college_id', userId)
                .like('student_id', 'std%')
                .order('student_id', { ascending: false })
                .limit(1);
            
            let nextIdNum = 1;
            if (lastStudent && lastStudent.length > 0) {
                const lastId = lastStudent[0].student_id;
                const match = lastId.match(/std(\d+)/);
                if (match) {
                    nextIdNum = parseInt(match[1]) + 1;
                }
            }
            const nextId = "std" + String(nextIdNum).padStart(3, '0');

            const payload = {
                student_id: nextId,
                college_id: userId,
                student_name: name,
                grade: pos,
                academic_year: year,
                photo_url: currentPhotoBase64
            };
            
            const { error } = await supabase.from('students').insert([payload]);
            if (error) throw error;

            alert("Student profile submitted successfully!");
            
            // clear form
            inputName.value = '';
            inputPos.value = '';
            if(inputYear) inputYear.value = '';
            
            currentPhotoBase64 = "";
            if(photoInput) photoInput.value = "";
            photoPreview.classList.add('hidden');
            photoIcon.classList.remove('hidden');

            await loadStudents(); // Reload
        } catch (err) {
            console.error(err);
            alert("Error adding student: " + err.message);
        } finally {
            btnSubmit.textContent = btnText;
            btnSubmit.disabled = false;
        }
    });

    // 3. Fetch and Render Table Data
    async function loadStudents() {
        try {
            const { data, error, count } = await supabase
                .from('students')
                .select('*', { count: 'exact' })
                .eq('college_id', userId)
                .neq('status', 'Graduated')
                .order('student_id', { ascending: false });

            if (error) throw error;

            // Updated Stats KPI
            if (kpiTotalStudents) kpiTotalStudents.textContent = count || 0;

            tbody.innerHTML = '';
            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-slate-500">No workforce data available. Register a student above.</td></tr>`;
                return;
            }

            data.forEach(w => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50/80 transition-all group border-b border-transparent hover:border-slate-100 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_-5px_rgba(0,0,0,0.06)] relative z-0 hover:z-10";

                const photoSrc = w.photo_url && w.photo_url.startsWith('data:image') 
                    ? w.photo_url 
                    : 'https://cdn-icons-png.flaticon.com/512/847/847969.png'; // default avatar placeholder

                tr.innerHTML = `
                    <td class="px-6 py-4 border-b border-slate-50 w-12">
                        <input type="checkbox" class="student-cb rounded border-slate-300 text-primary focus:ring-primary" value="${w.student_id}">
                    </td>
                    <td class="px-6 py-4 text-slate-500 font-mono text-sm">${w.student_id || '---'}</td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="size-10 rounded-lg bg-slate-200 bg-cover bg-center border border-slate-100 shadow-sm" style="background-image: url('${photoSrc}');"></div>
                            <span class="text-slate-900 font-bold group-hover:text-primary transition-colors">${w.student_name}</span>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-slate-600 text-sm">
                        <div class="font-bold text-slate-800">${w.grade || 'Unassigned'}</div>
                        <div class="text-[10px] text-slate-400 font-mono tracking-wider">${w.academic_year || '---'}</div>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex justify-end gap-2">
                            <button class="p-2 text-slate-400 hover:text-primary hover:bg-orange-50 rounded-lg transition-all edit-btn" data-id="${w.student_id}">
                                <span class="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            <button class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all delete-btn" data-id="${w.student_id}">
                                <span class="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Attach delete events
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    if (confirm("Remove this student profile?")) {
                        await deleteStudent(id);
                    }
                });
            });

            // Attach edit events
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    await window.openEditModal(id);
                });
            });

        } catch (error) {
            console.error(error);
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-red-500 py-4">Failed to load data</td></tr>`;
        }
    }

    async function deleteStudent(id) {
        try {
            const { error } = await supabase.from('students').delete().eq('college_id', userId).eq('student_id', id);
            if (error) throw error;
            await loadStudents();
        } catch(error) {
            console.error(error);
            alert("Error deleting student: " + error.message);
        }
    }

    // --- EDIT MODAL LOGIC ---
    const editModal = document.getElementById('edit-student-modal');
    const editPhotoInput = document.getElementById('edit-photo-input');
    const editPhotoPreview = document.getElementById('edit-photo-preview');
    const editInputId = document.getElementById('edit-student-id');
    const editInputName = document.getElementById('edit-student-name');
    const editInputPos = document.getElementById('edit-student-grade');
    const editInputYear = document.getElementById('edit-student-academic-year');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancelEdit = document.getElementById('btn-cancel-edit');
    const btnSaveEdit = document.getElementById('btn-save-edit');

    let editPhotoBase64 = "";

    function closeEditModal() {
        editModal.classList.add('hidden');
        editModal.classList.remove('flex');
    }

    if (btnCloseModal) btnCloseModal.addEventListener('click', closeEditModal);
    if (btnCancelEdit) btnCancelEdit.addEventListener('click', closeEditModal);

    window.openEditModal = async function(id) {
        try {
            const { data, error } = await supabase.from('students').select('*').eq('college_id', userId).eq('student_id', id).single();
            if (error) throw error;

            editInputId.value = data.student_id;
            editInputName.value = data.student_name || '';
            editInputPos.value = data.grade || '';
            if(editInputYear) editInputYear.value = data.academic_year || '';
            
            
            if (data.photo_url) {
                editPhotoPreview.src = data.photo_url;
                editPhotoBase64 = data.photo_url;
            } else {
                editPhotoPreview.src = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';
                editPhotoBase64 = "";
            }

            editModal.classList.remove('hidden');
            editModal.classList.add('flex');
        } catch (err) {
            console.error("Error opening edit modal:", err);
            alert("Failed to load student data!");
        }
    }

    if (editPhotoInput) {
        editPhotoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const MAX_WIDTH = 256;
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                    
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    editPhotoBase64 = canvas.toDataURL('image/jpeg', 0.8);
                    editPhotoPreview.src = editPhotoBase64;
                }
                img.src = event.target.result;
            }
            reader.readAsDataURL(file);
        });
    }

    if (btnSaveEdit) {
        btnSaveEdit.addEventListener('click', async () => {
            const id = editInputId.value;
            const name = editInputName.value.trim();
            const pos = editInputPos.value;

            if (!name) {
                alert("Please provide a valid Name!");
                return;
            }

            const btnText = btnSaveEdit.textContent;
            btnSaveEdit.textContent = "Saving...";
            btnSaveEdit.disabled = true;

            try {
                const payload = {
                    student_name: name,
                    grade: pos,
                    photo_url: editPhotoBase64
                };
                if (editInputYear) payload.academic_year = editInputYear.value;

                const { data, error } = await supabase.from('students').update(payload).eq('college_id', userId).eq('student_id', id);
                if (error) throw error;

                closeEditModal();
                await loadStudents(); // Refresh table
            } catch (err) {
                console.error("Error updating student:", err);
                alert("Error updating student: " + err.message);
            } finally {
                btnSaveEdit.textContent = btnText;
                btnSaveEdit.disabled = false;
            }
        });
    }

    const btnExportCsv = document.getElementById('btn-export-csv');
    if (btnExportCsv) {
        btnExportCsv.addEventListener('click', async () => {
            try {
                const { data, error } = await supabase.from('students').select('*').eq('college_id', userId).order('student_id', { ascending: true });
                if (error) throw error;
                if (!data || data.length === 0) return alert("No data to export.");

                const headers = ["student_id", "student_name", "grade", "reg_date", "status"];
                const csvRows = [headers.join(",")];
                
                data.forEach(row => {
                    const values = headers.map(header => {
                        let val = row[header] === null ? "" : String(row[header]);
                        // Escape quotes and wrap in quotes if contains comma
                        val = val.replace(/"/g, '""');
                        if (val.search(/("|,|\n)/g) >= 0) val = `"${val}"`;
                        return val;
                    });
                    csvRows.push(values.join(","));
                });

                const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.setAttribute('href', url);
                a.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } catch (err) {
                console.error("Export error:", err);
                alert("Export failed: " + err.message);
            }
        });
    }

    // --- CSV IMPORT LOGIC ---
    const importCsvFileInput = document.getElementById('import-csv-file');
    if (importCsvFileInput) {
        importCsvFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async function(event) {
                try {
                    const text = event.target.result;
                    const lines = text.split('\n').filter(line => line.trim() !== '');
                    if (lines.length < 2) return alert("CSV file seems empty or invalid.");

                    // Fetch latest ID for sequential generation in import
                    const { data: lastStudent } = await supabase
                        .from('students')
                        .select('student_id')
                        .eq('college_id', userId)
                        .like('student_id', 'std%')
                        .order('student_id', { ascending: false })
                        .limit(1);
                    
                    let nextIdNum = 1;
                    if (lastStudent && lastStudent.length > 0) {
                        const lastId = lastStudent[0].student_id;
                        const match = lastId.match(/std(\d+)/);
                        if (match) nextIdNum = parseInt(match[1]) + 1;
                    }

                    const headers = lines[0].toLowerCase().split(',');
                    const nameIdx = headers.findIndex(h => h.includes('name'));
                    const posIdx = headers.findIndex(h => h.includes('grade') || h.includes('stage'));
                    const yearIdx = headers.findIndex(h => h.includes('year') || h.includes('academic'));

                    if (nameIdx === -1) {
                        return alert("CSV must have a 'Name' column.");
                    }

                    const newStudents = [];
                    for (let i = 1; i < lines.length; i++) {
                        const cols = lines[i].split(',');
                        const student_name = cols[nameIdx]?.trim();
                        if (!student_name) continue;
                        
                        const pos = posIdx !== -1 ? cols[posIdx]?.trim() : '';
                        const year = yearIdx !== -1 ? cols[yearIdx]?.trim() : '';
                        const id = "std" + String(nextIdNum++).padStart(3, '0');

                        newStudents.push({ 
                            student_id: id, 
                            college_id: userId,
                            student_name: student_name, 
                            grade: pos,
                            academic_year: year || window.WMSSettings?.get('academic_year') || ''
                        });
                    }

                    if (newStudents.length === 0) return alert("No valid students found to import.");

                    if (confirm(`Found ${newStudents.length} students to import. Proceed?`)) {
                        const { error } = await supabase.from('students').insert(newStudents);
                        if (error) throw error;
                        alert("Successfully imported " + newStudents.length + " students!");
                        await loadStudents();
                    }
                } catch (err) {
                    console.error("Import error:", err);
                    alert("Import failed: " + err.message);
                } finally {
                    importCsvFileInput.value = ''; // Reset input so it can be re-fired
                }
            };
            reader.readAsText(file);
        });
    }

    // --- BULK ACTION LOGIC ---
    const selectAllCheckbox = document.getElementById('selectAllStudents');
    const bulkActionBar = document.getElementById('bulk-action-bar');
    const bulkSelectedCount = document.getElementById('bulk-selected-count');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            document.querySelectorAll('.student-cb').forEach(cb => cb.checked = isChecked);
            updateBulkActionBar();
        });
    }

    if (tbody) {
        tbody.addEventListener('change', (e) => {
            if (e.target.classList.contains('student-cb')) {
                updateBulkActionBar();
            }
        });
    }

    function updateBulkActionBar() {
        if (!bulkActionBar) return;
        const checked = document.querySelectorAll('.student-cb:checked').length;
        if (checked > 0) {
            bulkActionBar.classList.remove('hidden');
            bulkSelectedCount.textContent = `${checked} Selected`;
        } else {
            bulkActionBar.classList.add('hidden');
            if(selectAllCheckbox) selectAllCheckbox.checked = false;
        }
    }

    function getNextGrade(current) {
        const grades = ["First Year", "Second Year", "Third Year", "Fourth Year"];
        const idx = grades.indexOf(current);
        if (idx === -1) return current; // unknown or already graduated
        if (idx === grades.length - 1) return "Graduated";
        return grades[idx + 1];
    }

    async function applyBulkOperation(actionType) {
        const targetYear = document.getElementById('target-academic-year').value;
        if (!targetYear && actionType !== 'graduate') {
            return alert("Please specify the Target Academic Year to proceed with promotions or retentions.");
        }
        
        const selectedIds = Array.from(document.querySelectorAll('.student-cb:checked')).map(cb => cb.value);
        if (selectedIds.length === 0) return;

        if (!confirm(`Are you sure you want to ${actionType} ${selectedIds.length} students?`)) return;

        try {
            const { data: studentsData, error: fetchErr } = await supabase.from('students').select('*').eq('college_id', userId).in('student_id', selectedIds);
            if (fetchErr) throw fetchErr;

            const historyInserts = [];
            const studentUpdates = [];

            for (const student of studentsData) {
                let newGrade = student.grade;
                let newStatus = student.status || 'Active';
                
                // Record the outcome of the CURRENT year into history
                historyInserts.push({
                    student_id: student.student_id,
                    college_id: userId,
                    student_name: student.student_name,
                    academic_year: student.academic_year || 'Unknown',
                    grade: student.grade || 'Unknown',
                    status: actionType === 'promote' ? 'Passed' : (actionType === 'fail' ? 'Failed' : 'Graduated')
                });

                if (actionType === 'promote') {
                    newGrade = getNextGrade(student.grade);
                    if (newGrade === 'Graduated') newStatus = 'Graduated';
                } else if (actionType === 'graduate') {
                    newStatus = 'Graduated';
                }
                
                studentUpdates.push({
                    student_id: student.student_id,
                    academic_year: targetYear || student.academic_year,
                    grade: newGrade,
                    status: newStatus
                });
            }

            // Execute Updates one by one (or bulk if supported, but loop is safer for simple clients)
            for (const update of studentUpdates) {
                const { error: updErr } = await supabase.from('students').update({
                    academic_year: update.academic_year,
                    grade: update.grade,
                    status: update.status
                }).eq('college_id', userId).eq('student_id', update.student_id);
                if (updErr) throw updErr;
            }

            // Insert into history table
            const { error: histErr } = await supabase.from('student_history').insert(historyInserts);
            if (histErr) throw histErr;

            alert(`Successfully applied progression to ${selectedIds.length} students.`);
            if(selectAllCheckbox) selectAllCheckbox.checked = false;
            updateBulkActionBar();
            await loadStudents();

        } catch (err) {
            console.error("Bulk action failed:", err);
            alert("Bulk action failed: " + err.message);
        }
    }

    document.getElementById('btn-bulk-promote')?.addEventListener('click', () => applyBulkOperation('promote'));
    document.getElementById('btn-bulk-retain')?.addEventListener('click', () => applyBulkOperation('fail'));
    document.getElementById('btn-bulk-graduate')?.addEventListener('click', () => applyBulkOperation('graduate'));

});

