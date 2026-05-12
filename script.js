import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm";

const supabaseUrl = 'https://qrkuiwnqwjzmpenmuchd.supabase.co';
const supabaseKey = 'sb_publishable_AIuzxSZo9WwRAw_XjuxF7w_Ym84pcp1';
const supabase = createClient(supabaseUrl, supabaseKey);

let currentUserData = null;
let currentUserId = null;
let modalCloseCallback = null;
let targetRejectId = null;

function showModal(type, title, message, callback = null) {
    const modal = document.getElementById('customModal');
    const iconContainer = document.getElementById('modalIconContainer');
    const icon = document.getElementById('modalIcon');
    const btn = document.getElementById('modalBtn');
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalMessage').innerText = message;
    modalCloseCallback = callback;
    iconContainer.className = "mx-auto flex items-center justify-center h-20 w-20 rounded-full mb-5";
    btn.className = "w-full text-white font-bold py-3 px-4 rounded-xl transition duration-300 shadow-lg";
    if (type === 'success') {
        iconContainer.classList.add('bg-green-100', 'text-green-600');
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>';
        btn.classList.add('bg-green-500', 'hover:bg-green-600');
    } else if (type === 'error') {
        iconContainer.classList.add('bg-red-100', 'text-red-600');
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>';
        btn.classList.add('bg-red-500', 'hover:bg-red-600');
    } else if (type === 'warning') {
        iconContainer.classList.add('bg-yellow-100', 'text-yellow-600');
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>';
        btn.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
    }
    modal.classList.remove('hidden-section');
}

function closeModal() {
    document.getElementById('customModal').classList.add('hidden-section');
    if (modalCloseCallback) { modalCloseCallback(); modalCloseCallback = null; }
}

function switchView(viewId) {
    document.getElementById('loginView').classList.add('hidden-section');
    document.getElementById('registerView').classList.add('hidden-section');
    document.getElementById('studentView').classList.add('hidden-section');
    document.getElementById('adminView').classList.add('hidden-section');
    document.getElementById(viewId).classList.remove('hidden-section');
}

async function handleRegister() {
    const name = document.getElementById('regName').value.trim();
    const id = document.getElementById('regId').value.trim();
    const cardId = document.getElementById('regCardId').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const faculty = document.getElementById('regFaculty').value.trim();
    const major = document.getElementById('regMajor').value.trim();
    const year = document.getElementById('regYear').value;

    if (!name || !id || !cardId || !email || !password || !confirmPassword) {
        showModal('warning', 'ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลที่มีเครื่องหมาย *'); return;
    }
    
    let role = /^[0-9]+$/.test(id) ? 'student' : 'admin';

    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;

        await supabase.from('users').insert([{ 
            id: authData.user.id, fullName: name, studentId: id, citizenId: cardId, email: email, role: role,
            faculty: faculty, major: major, year: year,
            avatar_url: `https://ui-avatars.com/api/?name=${name}&background=random`
        }]);
        showModal('success', 'สำเร็จ', 'ลงทะเบียนเรียบร้อย', () => switchView('loginView'));
    } catch (error) { showModal('error', 'ผิดพลาด', error.message); }
}

async function handleLogin() {
    const emailInput = document.getElementById('emailInput').value.trim();
    const passwordInput = document.getElementById('passwordInput').value.trim();
    const btnLogin = document.getElementById('btnLogin');

    try {
        btnLogin.innerHTML = "⏳..."; btnLogin.disabled = true;
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email: emailInput, password: passwordInput });
        if (authError) throw authError;

        currentUserId = authData.user.id;
        const { data: userData, error: userError } = await supabase.from('users').select('*').eq('id', currentUserId).single();
        if (userError) throw userError;

        currentUserData = userData;
        if (userData.role === 'admin') {
            switchView('adminView');
            loadAdminActivities();
        } else {
            document.getElementById('profileImage').src = userData.avatar_url;
            document.getElementById('studentWelcomeText').innerText = `นิสิต/นักศึกษา: ${userData.fullName} (${userData.studentId})`;
            switchView('studentView');
            loadStudentActivities();
        }
    } catch (error) { document.getElementById('loginError').classList.remove('hidden'); }
    finally { btnLogin.innerHTML = "เข้าสู่ระบบ"; btnLogin.disabled = false; }
}

async function loadStudentActivities() {
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = '<tr><td colspan="3" class="text-center p-4">⏳ โหลด...</td></tr>';
    let total = 0;
    try {
        const { data } = await supabase.from('activities').select('*').eq('uid', currentUserId).order('created_at', { ascending: false });
        tbody.innerHTML = '';
        data.forEach(item => {
            if (item.status === 'approved') total += Number(item.act_hours || 0);
            let s = item.status === 'approved' ? 'อนุมัติ' : (item.status === 'rejected' ? 'ปฏิเสธ' : 'รอ');
            tbody.innerHTML += `<tr class="border-b"><td class="p-4">${item.actDate}</td><td class="p-4">${item.actName} (${item.act_hours} ชม.)</td><td class="p-4 text-center">${s}</td></tr>`;
        });
        document.getElementById('totalHoursText').innerText = `รวม: ${total} ชม.`;
    } catch (e) { console.error(e); }
}

async function loadAdminActivities() {
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = '<tr><td colspan="3" class="text-center p-8">⏳ ประมวลผล...</td></tr>';
    try {
        const searchVal = document.getElementById('searchInput').value.trim();
        let query = supabase.from('activities').select('*').order('created_at', { ascending: false });
        if (searchVal) query = query.ilike('studentId', `%${searchVal}%`);
        const { data } = await query;
        tbody.innerHTML = '';
        if (data.length === 0) tbody.innerHTML = '<tr><td colspan="3" class="p-8 text-center">ไม่มีข้อมูล</td></tr>';
        data.forEach(item => {
            let action = item.status === 'pending' ? 
                `<button onclick="approveActivity('${item.id}')" class="bg-green-500 text-white p-1 rounded w-full mb-1">อนุมัติ</button>
                 <button onclick="openRejectModal('${item.id}')" class="bg-red-500 text-white p-1 rounded w-full">ปฏิเสธ</button>` : item.status;
            tbody.innerHTML += `<tr class="border-b"><td class="p-4"><b>${item.studentId}</b><br>${item.studentName}</td><td class="p-4">${item.actName} (${item.act_hours} ชม.)</td><td class="p-4 text-center">${action}</td></tr>`;
        });
    } catch (e) { console.error(e); }
}

window.approveActivity = async function(id) {
    await supabase.from('activities').update({ status: 'approved' }).eq('id', id);
    loadAdminActivities();
}
window.openRejectModal = function(id) {
    targetRejectId = id;
    document.getElementById('rejectModal').classList.remove('hidden-section');
}
window.closeRejectModal = () => document.getElementById('rejectModal').classList.add('hidden-section');
window.confirmReject = async function() {
    const reason = document.getElementById('rejectReasonInput').value;
    await supabase.from('activities').update({ status: 'rejected', reject_reason: reason }).eq('id', targetRejectId);
    window.closeRejectModal();
    loadAdminActivities();
}

// ผูกฟังก์ชัน Global
window.switchView = switchView;
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.loadStudentActivities = loadStudentActivities;
window.loadAdminActivities = loadAdminActivities;
window.closeModal = closeModal;
