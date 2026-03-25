document.addEventListener('DOMContentLoaded', async () => {
    // ---- ADMIN SECURITY ENFORCEMENT ----
    // Replace this email with your actual administrator emailaddress
    const ADMIN_EMAILS = ['syscompany85@gmail.com', 'osama@syswms.com'];

    // The Web App URL you get from deploying your Google Apps Script (Code.gs)
    const GOOGLE_APPS_SCRIPT_WEBHOOK = "https://script.google.com/macros/s/AKfycbzptiX1BmeEvHNXalBHfOQ475539K8ZmgRxqqG7wWLLbgDlzN6ePomXXdzwGl8-dnAnVA/exec";

    const { data: { user } } = await sbClient.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        // Violently redirect intruders
        window.location.href = 'auth.html';
        return;
    }

    // Admin verified! Make page visible.
    document.getElementById('admin-body').classList.remove('hidden');

    function formatDate(isoStr) {
        const d = new Date(isoStr);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const badgeColor = {
        'pending': 'bg-amber-100 text-amber-800 border-amber-200',
        'approved': 'bg-green-100 text-green-800 border-green-200',
        'rejected': 'bg-red-100 text-red-800 border-red-200'
    };

    window.loadcolleges = async () => {
        const tbody = document.getElementById('colleges-list');
        tbody.innerHTML = `<tr><td colspan="5" class="p-12 text-center text-slate-400 font-bold"><span class="material-symbols-outlined animate-spin text-3xl mb-2">sync</span><br>Loading records...</td></tr>`;

        const { data: colleges, error } = await sbClient
            .from('colleges')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-red-500 font-bold">Failed to load colleges: ${error.message}</td></tr>`;
            return;
        }

        if (colleges.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-12 text-center text-slate-400 font-bold">No colleges registered yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        colleges.forEach(company => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-50 transition-colors';

            const badge = badgeColor[company.status] || 'bg-slate-100 text-slate-800 border-slate-200';

            tr.innerHTML = `
                <td class="p-4">
                    <div class="font-bold text-slate-900">${company.college_name}</div>
                    <div class="text-xs text-slate-500 font-mono mt-1 px-1.5 py-0.5 bg-slate-100 rounded inline-block border border-slate-200">${company.college_code}</div>
                </td>
                <td class="p-4">
                    <div class="font-bold text-slate-700 text-sm">${company.full_name} <span class="text-slate-400 font-normal">(${company.position})</span></div>
                    <div class="text-sm text-slate-500 flex items-center gap-2 mt-1"><span class="material-symbols-outlined text-[14px]">mail</span> ${company.email}</div>
                    <div class="text-sm text-slate-500 flex items-center gap-2 mt-0.5"><span class="material-symbols-outlined text-[14px]">call</span> ${company.phone}</div>
                </td>
                <td class="p-4 text-sm text-slate-600 font-medium">
                    ${formatDate(company.created_at)}
                </td>
                <td class="p-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold border ${badge} capitalize tracking-wide shadow-sm">
                        ${company.status}
                    </span>
                </td>
                <td class="p-4 text-right space-x-2 whitespace-nowrap">
                    ${company.status === 'pending' ? `
                        <button onclick="window.confirmAction('${company.id}', 'approve', '${company.college_name}', '${company.email}')" 
                                title="Approve"
                                class="inline-flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border border-green-200 hover:border-green-600 px-2.5 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-all">
                            <span class="material-symbols-outlined text-[18px]">check</span>
                        </button>
                        <button onclick="window.confirmAction('${company.id}', 'reject', '${company.college_name}', '${company.email}')" 
                                title="Reject"
                                class="inline-flex items-center gap-1 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white border border-amber-200 hover:border-amber-600 px-2.5 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-all">
                            <span class="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    ` : `
                       <span class="text-xs font-bold text-slate-400 mr-2 inline-block">Processed</span>
                    `}
                    <button onclick="window.confirmAction('${company.id}', 'delete', '${company.college_name}', '${company.email}')" 
                            title="Delete Permanently"
                            class="inline-flex items-center gap-1 bg-slate-50 text-slate-700 hover:bg-red-600 hover:text-white border border-slate-200 hover:border-red-600 px-2.5 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-all ml-1">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    // Logout
    document.getElementById('btn-logout').addEventListener('click', async () => {
        await sbClient.auth.signOut();
        window.location.href = 'auth.html';
    });

    // ---- MODAL & ACTION LOGIC ----
    const modal = document.getElementById('action-modal');
    const modalContent = document.getElementById('modal-content');
    const btnCancel = document.getElementById('modal-cancel');
    const btnConfirm = document.getElementById('modal-confirm');

    let currentAction = null; // { id, type, name, email }

    window.confirmAction = (id, type, name, email) => {
        currentAction = { id, type, name, email };

        const title = document.getElementById('modal-title');
        const desc = document.getElementById('modal-desc');
        const icon = document.getElementById('modal-icon');
        const iconBg = document.getElementById('modal-icon-bg');
        const btnText = document.getElementById('modal-btn-text');

        if (type === 'approve') {
            title.textContent = 'Approve Registration?';
            desc.textContent = `Are you sure you want to approve ${name}? An official welcome email will be sent automatically.`;
            icon.textContent = 'check_circle';
            iconBg.className = 'w-10 h-10 rounded-full flex items-center justify-center text-white bg-green-500';
            btnConfirm.className = 'px-4 py-2 rounded-lg font-bold text-white shadow-sm transition-colors flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700';
            btnText.textContent = 'Yes, Approve';
        } else if (type === 'reject') {
            title.textContent = 'Reject Registration?';
            desc.textContent = `Are you sure you want to reject ${name}? They will be denied access and notified via email.`;
            icon.textContent = 'cancel';
            iconBg.className = 'w-10 h-10 rounded-full flex items-center justify-center text-white bg-amber-500';
            btnConfirm.className = 'px-4 py-2 rounded-lg font-bold text-white shadow-sm transition-colors flex items-center gap-2 text-sm bg-amber-600 hover:bg-amber-700';
            btnText.textContent = 'Yes, Reject';
        } else if (type === 'delete') {
            title.textContent = 'Delete Permanently?';
            desc.textContent = `Are you sure you want to completely delete ${name}? This action cannot be undone.`;
            icon.textContent = 'delete_forever';
            iconBg.className = 'w-10 h-10 rounded-full flex items-center justify-center text-white bg-red-600';
            btnConfirm.className = 'px-4 py-2 rounded-lg font-bold text-white shadow-sm transition-colors flex items-center gap-2 text-sm bg-red-600 hover:bg-red-700';
            btnText.textContent = 'Yes, Delete';
        }

        modal.classList.remove('hidden');
        setTimeout(() => {
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
        }, 10);
    };

    const closeModal = () => {
        modalContent.classList.remove('scale-100', 'opacity-100');
        modalContent.classList.add('scale-95', 'opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 200);
        currentAction = null;
    };

    btnCancel.addEventListener('click', closeModal);

    btnConfirm.addEventListener('click', async () => {
        if (!currentAction) return;

        const spinner = document.getElementById('modal-spinner');
        const btnText = document.getElementById('modal-btn-text');

        btnConfirm.disabled = true;
        btnConfirm.classList.add('opacity-70', 'cursor-not-allowed');
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');

        try {
            if (currentAction.type === 'delete') {
                const { error: dbError } = await sbClient
                    .from('colleges')
                    .delete()
                    .eq('id', currentAction.id);

                if (dbError) throw new Error("Delete failed: " + dbError.message);
                // No email dispatch for permanent deletion
            } else {
                const newStatus = currentAction.type === 'approve' ? 'approved' : 'rejected';

                // 1. Update Database Status
                const { error: dbError } = await sbClient
                    .from('colleges')
                    .update({ status: newStatus })
                    .eq('id', currentAction.id);

                if (dbError) throw new Error("Database update failed: " + dbError.message);

                // 2. Trigger Google Apps Script Webhook for Email Dispatch
                if (GOOGLE_APPS_SCRIPT_WEBHOOK.includes("YOUR_SCRIPT_ID")) {
                    console.warn("Emails not sent: Google Apps Script Webhook URL is not configured yet.");
                } else {
                    fetch(GOOGLE_APPS_SCRIPT_WEBHOOK, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({
                            action: 'company_status_change',
                            email: currentAction.email,
                            status: newStatus,
                            college_name: currentAction.name
                        }).toString()
                    }).catch(err => console.error("Webhook trigger failed:", err));
                }
            }

            // Success! Reload the list!
            closeModal();
            loadcolleges();

        } catch (err) {
            alert(err.message);
        } finally {
            btnConfirm.disabled = false;
            btnConfirm.classList.remove('opacity-70', 'cursor-not-allowed');
            btnText.classList.remove('hidden');
            spinner.classList.add('hidden');
        }
    });

    // Initial Load
    loadcolleges();
});
