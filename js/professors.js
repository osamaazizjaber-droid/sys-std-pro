// sys-wms-web/js/professors.js

document.addEventListener('DOMContentLoaded', async () => {
    const supabase = window.sbClient;
    if(!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const userId = user.id;

    const form = document.getElementById('professor-form');
    const tbody = document.getElementById('professors-tbody');

    async function loadProfessorsData() {
        try {
            tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-slate-400 font-bold tracking-widest uppercase"><span class="material-symbols-outlined animate-spin align-middle me-2">sync</span> <span data-i18n="loading-professors">Loading Professors...</span></td></tr>`;
            const { data, error } = await supabase.from('professors').select('*').eq('college_id', userId).order('prof_id', { ascending: false });
            
            if (error) throw error;
            renderProfessorsQueue(data);
        } catch (err) {
            console.error("Error loading Professors:", err);
            tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-red-500 font-bold">Failed to load payload</td></tr>`;
        }
    }

    function renderProfessorsQueue(data) {
        tbody.innerHTML = '';
        if (data && data.length > 0) {
            data.forEach(prof => {
                const tr = document.createElement('tr');
                tr.className = "group border-b border-slate-100 hover:bg-slate-50 transition-colors bg-white shadow-[0_2px_4px_rgba(0,0,0,0.01)]";

                tr.innerHTML = `
                    <td class="px-6 py-4 text-[10px] font-mono text-slate-400 text-start group-hover:text-primary transition-colors">${prof.prof_id || '---'}</td>
                    <td class="px-6 py-4 font-bold text-sm text-slate-900 text-start" colspan="2">${prof.prof_name}</td>
                    <td class="px-6 py-4 text-end">
                        <button onclick="deleteProfessor('${prof.prof_id}')" class="p-2 text-slate-300 hover:text-error hover:bg-error/10 rounded-lg transition-all" title="Delete">
                            <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="4" class="p-12 text-center text-slate-300 italic">No professors found.</td></tr>`;
        }
    }

    window.deleteProfessor = async function(id) {
        if (!confirm("Are you sure you want to remove this professor?")) return;
        try {
            const { error } = await supabase.from('professors').delete().eq('college_id', userId).eq('prof_id', id);
            if (error) throw error;
            loadProfessorsData();
        } catch (err) { alert(err.message); }
    };

    const photoInput = document.getElementById('prof-photo-input');
    const photoPreview = document.getElementById('photo-preview-img');
    const photoIcon = document.getElementById('photo-placeholder-icon');
    let currentPhotoBase64 = null;

    photoInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (re) => {
                currentPhotoBase64 = re.target.result;
                photoPreview.src = currentPhotoBase64;
                photoPreview.classList.remove('hidden');
                photoIcon.classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const pName = document.getElementById('prof-name-input').value.trim();
        if (!pName) { 
            alert("Professor Name is required.");
            return;
        }

        const btnSave = document.getElementById('btn-save-professor');
        const originalText = btnSave.innerHTML;
        btnSave.innerHTML = `<span class="material-symbols-outlined animate-spin text-base">sync</span> Adding...`;
        btnSave.disabled = true;

        try {
            const payload = {
                prof_id: "PRF-" + Math.floor(Math.random()*1000000),
                college_id: userId,
                prof_name: pName,
                status: 'Active',
                photo_url: currentPhotoBase64 // Changed 'photo' to 'photo_url' for consistency
            };
            
            const { error } = await supabase.from('professors').insert([payload]);
            if (error) throw error;

            form.reset();
            currentPhotoBase64 = null;
            photoPreview.classList.add('hidden');
            photoIcon.classList.remove('hidden');
            loadProfessorsData();
        } catch (err) {
            console.error("Error inserting Professor:", err);
            alert("Error: " + err.message);
        } finally {
            btnSave.innerHTML = originalText;
            btnSave.disabled = false;
        }
    });

    loadProfessorsData();
});
