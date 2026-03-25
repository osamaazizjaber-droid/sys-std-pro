// sys-wms-web/js/dashboard.js

document.addEventListener('DOMContentLoaded', async () => {
    const supabase = window.sbClient;
    if (!supabase) {
        console.error("Supabase client not initialized.");
        return;
    }

    const kpiTotalStudents = document.getElementById('kpi-total-students');
    const kpiPresentToday = document.getElementById('kpi-present-today');
    const kpiTotalProfessors = document.getElementById('kpi-total-professors');

    async function loadMetrics() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const userId = user.id;
        const currentYear = window.WMSSettings ? window.WMSSettings.get('academic_year') : '';

        // 1. Total Students
        try {
            let studentQuery = supabase.from('students').select('*', { count: 'exact', head: true }).eq('college_id', userId);
            if (currentYear) studentQuery = studentQuery.eq('academic_year', currentYear);
            const { count: studentsCount, error: sErr } = await studentQuery;
            if (sErr) throw sErr;
            if (kpiTotalStudents) kpiTotalStudents.textContent = studentsCount || 0;
        } catch (err) {
            console.error("Total Students Load Error:", err);
            if (kpiTotalStudents) kpiTotalStudents.textContent = "Err";
        }

        // 2. Present Today
        try {
            const d = new Date();
            const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            let attendanceQuery = supabase.from('attendance')
                .select('*', { count: 'exact', head: true })
                .eq('college_id', userId)
                .eq('date', today)
                .eq('status', 'Present');
            
            // This might fail if the column 'academic_year' is missing in DB
            if (currentYear) {
                attendanceQuery = attendanceQuery.eq('academic_year', currentYear);
            }
                
            const { count: presentCount, error: pErr } = await attendanceQuery;
            if (pErr) throw pErr;
            if (kpiPresentToday) kpiPresentToday.textContent = presentCount || 0;
        } catch (err) {
            console.error("Present Today Load Error:", err);
            if (kpiPresentToday) kpiPresentToday.textContent = "Err";
        }

        // 3. Total Professors
        try {
            const { count: profsCount, error: profErr } = await supabase
                .from('professors')
                .select('*', { count: 'exact', head: true })
                .eq('college_id', userId);
            if (profErr) throw profErr;
            if (kpiTotalProfessors) kpiTotalProfessors.textContent = profsCount || 0;
        } catch (err) {
            console.error("Total Professors Load Error:", err);
            if (kpiTotalProfessors) kpiTotalProfessors.textContent = "Err";
        }
    }

    loadMetrics();

    // Re-load metrics if academic year changes
    window.addEventListener('wms-settings-update', (e) => {
        if (e.detail.k === 'academic_year') {
            loadMetrics();
        }
    });

    window.addEventListener('storage', (e) => {
        if (e.key === 'wms-pro-settings') {
            loadMetrics();
        }
    });
});
