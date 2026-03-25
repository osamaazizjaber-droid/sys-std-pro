document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Status Elements
    const loginStatus = document.getElementById('login-status');
    const regStatus = document.getElementById('reg-status');

    // Button States
    const setBtnState = (btnId, isLoading) => {
        const btn = document.getElementById(btnId);
        const txt = btn.querySelector('.btn-text');
        const spinner = btn.querySelector('.material-symbols-outlined');
        if (isLoading) {
            btn.disabled = true;
            btn.classList.add('opacity-70', 'cursor-not-allowed');
            txt.classList.add('hidden');
            spinner.classList.remove('hidden');
        } else {
            btn.disabled = false;
            btn.classList.remove('opacity-70', 'cursor-not-allowed');
            txt.classList.remove('hidden');
            spinner.classList.add('hidden');
        }
    };

    const showMessage = (el, msg, isError = true) => {
        el.textContent = msg;
        el.className = `text-sm font-bold text-center pt-2 ${isError ? 'text-red-500' : 'text-green-600'}`;
        el.classList.remove('hidden');
    };

    // ---- LOGIN LOGIC ----
    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            setBtnState('btn-login', true);
            loginStatus.classList.add('hidden');

            try {
                // 1. Authenticate with Supabase
                const { data: authData, error: authError } = await sbClient.auth.signInWithPassword({ email, password });
                
                if (authError) throw new Error("Invalid credentials or user not found.");

                // 2. Check Company Status
                const userId = authData.user.id;
                const { data: company, error: companyError } = await sbClient
                    .from('colleges')
                    .select('status')
                    .eq('id', userId)
                    .single();

                if (companyError && companyError.code !== 'PGRST116') {
                    throw new Error("Could not verify company status.");
                }

                const ADMIN_EMAILS = ['syscompany85@gmail.com', 'osama@syswms.com'];
                const userEmail = authData.user.email.toLowerCase();

                if (ADMIN_EMAILS.includes(userEmail)) {
                    // Instantly drop Super Admins into their private control panel!
                    window.location.href = 'admin.html';
                    return;
                }

                if (!company) {
                    // Normal users who somehow slipped past registration
                    window.location.href = 'dashboard.html';
                    return;
                }

                if (company.status === 'pending') {
                    await sbClient.auth.signOut();
                    throw new Error("Your account is pending administrator approval.");
                } else if (company.status === 'rejected') {
                    await sbClient.auth.signOut();
                    throw new Error("Your registration was declined. Please contact support.");
                } else if (company.status === 'approved') {
                    // Success!
                    window.location.href = 'dashboard.html';
                }

            } catch (err) {
                showMessage(loginStatus, err.message, true);
            } finally {
                setBtnState('btn-login', false);
            }
        });
    }

    // ---- REGISTRATION LOGIC ----
    if(registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const universityName = document.getElementById('reg-university').value;
            const companyName = document.getElementById('reg-company').value;
            const departmentName = document.getElementById('reg-department').value;
            const fullName = document.getElementById('reg-name').value;
            const position = document.getElementById('reg-position').value;
            const phone = document.getElementById('reg-phone').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;

            setBtnState('btn-register', true);
            regStatus.classList.add('hidden');

            try {
                // 1. Create Supabase Auth User
                const { data: authData, error: authError } = await sbClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName, college_name: companyName, university_name: universityName, department_name: departmentName } // Store metadata
                    }
                });

                if (authError) throw new Error(authError.message);
                if (!authData.user) throw new Error("Failed to create user account.");

                const userId = authData.user.id;

                // Generate a unique short college code (Stored in colleges table for legacy compat)
                const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
                const collegeCode = `COL-${randomString}`;

                // 2. Insert into colleges Table
                const { error: insertError } = await sbClient.from('colleges').insert({
                    id: userId,
                    college_code: collegeCode,
                    college_name: companyName,
                    university_name: universityName,
                    department_name: departmentName,
                    full_name: fullName,
                    position: position,
                    phone: phone,
                    email: email,
                    status: 'pending' // Default status
                });

                if (insertError) {
                    console.error("Full Insert Error:", insertError);
                    throw new Error("Failed to link college data. DB ERROR: " + insertError.message + " (Code: " + insertError.code + ")");
                }

                // 3. Force sign out (because signUp usually signs them in automatically if email conf is off)
                await sbClient.auth.signOut();

                // 4. Show Success and Switch back to login
                showMessage(loginStatus, "Registration successful! Your account is pending review.", false);
                
                // Clear form
                registerForm.reset();
                switchPanel('login');

            } catch (err) {
                showMessage(regStatus, err.message, true);
            } finally {
                setBtnState('btn-register', false);
            }
        });
    }
});
