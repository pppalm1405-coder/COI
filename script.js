// script.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm";

const supabaseUrl = 'https://qrkuiwnqwjzmpenmuchd.supabase.co';
const supabaseKey = 'sb_publishable_AIuzxSZo9WwRAw_XjuxF7w_Ym84pcp1';
const supabase = createClient(supabaseUrl, supabaseKey);

let currentUserData = null;
let currentUserId = null;
let modalCloseCallback = null;
let targetRejectId = null; // เก็บ ID ที่กำลังจะกดปฏิเสธ

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
    
    if(viewId === 'registerView') document.getElementById('registerForm').reset();
    if(viewId === 'loginView') {
        document.getElementById('loginForm').reset();
        currentUserData = null; currentUserId = null;
        supabase.auth.signOut();
    }
}

// ==========================================
// ระบบลงทะเบียน พร้อมเช็ครหัส (ตัวเลข/ตัวอักษร)
// ==========================================
async function handleRegister() {
    const role = document.querySelector('input[name="userRole"]:checked').value;
    const name = document.getElementById('regName').value.trim();
    const id = document.getElementById('regId').value.trim();
    const cardId = document.getElementById('regCardId').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    // ดึงค่าฟิลด์ใหม่ (อาจจะว่างได้ถ้าเป็นแอดมิน)
    const faculty = document.getElementById('regFaculty').value.trim();
    const major = document.getElementById('regMajor').value.trim();
    const year = document.getElementById('regYear').value;

    if (!name || !id || !cardId || !email || !password || !confirmPassword) {
        showModal('warning', 'ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลให้ครบทุกช่องที่มีเครื่องหมาย *'); return;
    }
    if (password !== confirmPassword) {
        showModal('warning', 'รหัสผ่านไม่ตรงกัน', 'กรุณาตรวจสอบรหัสผ่านอีกครั้ง'); return;
    }

    // 🔥 ระบบตรวจสอบรูปแบบรหัสประจำตัว (Validation)
    if (role === 'student' && !/^[0-9]+$/.test(id)) {
        showModal('warning', 'รูปแบบรหัสไม่ถูกต้อง', 'รหัสประจำตัวนักศึกษาต้องเป็น "ตัวเลข" เท่านั้นครับ'); return;
    }
    if (role === 'admin' && !/^[A-Za-zก-ฮะ-๙]+$/.test(id)) {
        showModal('warning', 'รูปแบบรหัสไม่ถูกต้อง', 'รหัสฝ่ายกิจการนักศึกษาต้องเป็น "ตัวอักษร" เท่านั้นครับ'); return;
    }

    const btnRegister = document.getElementById('btnRegister');
    const originalText = btnRegister.innerHTML;
    btnRegister.disabled = true; btnRegister.innerHTML = "⏳ กำลังประมวลผล...";

    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;

        const { error: dbError } = await supabase.from('users').insert([{ 
            id: authData.user.id, fullName: name, studentId: id, citizenId: cardId, email: email, role: role,
            faculty: faculty, major: major, year: year,
            avatar_url: `https://ui-avatars.com/api/?name=${name}&background=random` // รูปเริ่มต้น
        }]);
        if (dbError) throw dbError;

        showModal('success', 'ขึ้นทะเบียนสำเร็จ!', 'ระบบบันทึกข้อมูลเรียบร้อยแล้ว', () => switchView('loginView'));
    } catch (error) {
        showModal('error', 'ข้อผิดพลาดระบบ', error.message);
    } finally {
        btnRegister.disabled = false; btnRegister.innerHTML = originalText;
    }
}

async function handleLogin() {
    const emailInput = document.getElementById('emailInput').value.trim();
    const passwordInput = document.getElementById('passwordInput').value.trim();
    if (!emailInput || !passwordInput) return showModal('warning', 'ข้อมูลไม่ครบ', 'กรุณาระบุอีเมลและรหัสผ่าน');

    const btnLogin = document.getElementById('btnLogin');
    btnLogin.innerHTML = "⏳..."; btnLogin.disabled = true;

    try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email: emailInput, password: passwordInput });
        if (authError) throw authError;

        currentUserId = authData.user.id;
        const { data: userData, error: userError } = await supabase.from('users').select('*').eq('id', currentUserId).single();
        if (userError || !userData) throw new Error("ไม่พบข้อมูลสิทธิ์");

        currentUserData = userData;

        if (userData.role === 'admin') {
            switchView('adminView');
            loadAdminActivities();
        } else {
            // โหลดข้อมูลรูปโปรไฟล์ นศ.
            document.getElementById('profileImage').src = userData.avatar_url || `https://ui-avatars.com/api/?name=${userData.fullName}&background=random`;
            document.getElementById('studentWelcomeText').innerText = `นิสิต/นักศึกษา: ${userData.fullName} (${userData.studentId}) | คณะ${userData.faculty || '-'}`;
            switchView('studentView');
            loadStudentActivities();
        }
    } catch (error) {
        document.getElementById('loginError').classList.remove('hidden');
    } finally {
        btnLogin.innerHTML = "เข้าสู่ระบบ"; btnLogin.disabled = false;
    }
}

// ==========================================
// ระบบอัปโหลดรูปโปรไฟล์ (นศ.)
// ==========================================
window.handleAvatarUpload = async function(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const filePath = `${currentUserId}/avatar_${Date.now()}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        const newAvatarUrl = publicUrlData.publicUrl;

        await supabase.from('users').update({ avatar_url: newAvatarUrl }).eq('id', currentUserId);
        
        document.getElementById('profileImage').src = newAvatarUrl;
        showModal('success', 'เปลี่ยนรูปโปรไฟล์สำเร็จ', 'ระบบอัปเดตรูปภาพของคุณเรียบร้อยแล้ว');
    } catch (error) {
        showModal('error', 'อัปโหลดรูปไม่สำเร็จ', error.message);
    }
}

// ==========================================
// ส่งกิจกรรม (เพิ่มช่องชั่วโมง)
// ==========================================
async function submitActivity() {
    const name = document.getElementById('actName').value.trim();
    const date = document.getElementById('actDate').value;
    const hours = document.getElementById('actHours').value;
    const certifier = document.getElementById('actCertifier').value.trim();
    const fileInput = document.getElementById('actFile');

    if (!name || !date || !hours || !certifier || fileInput.files.length === 0) {
        return showModal('warning', 'ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลและแนบไฟล์ให้ครบถ้วน');
    }

    const btnSubmit = document.getElementById('btnSubmitActivity');
    btnSubmit.innerHTML = "⏳ กำลังบันทึก..."; btnSubmit.disabled = true;

    try {
        let uploadedFiles = [];
        for (let i = 0; i < fileInput.files.length; i++) {
            let file = fileInput.files[i];
            let filePath = `${currentUserId}/${Date.now()}_${file.name}`;
            await supabase.storage.from('activities').upload(filePath, file);
            const { data } = supabase.storage.from('activities').getPublicUrl(filePath);
            uploadedFiles.push({ name: file.name, url: data.publicUrl });
        }

        await supabase.from('activities').insert([{
            uid: currentUserId, studentId: currentUserData.studentId, studentName: currentUserData.fullName,
            actName: name, actDate: date, act_hours: parseFloat(hours), actCertifier: certifier, files: uploadedFiles, status: 'pending'
        }]);

        showModal('success', 'ส่งข้อมูลสำเร็จ', 'แฟ้มประวัติถูกส่งเข้าระบบเรียบร้อยแล้ว');
        document.getElementById('activityForm').reset();
        document.getElementById('filePreviewContainer').innerHTML = ''; 
        loadStudentActivities();
    } catch (error) {
        showModal('error', 'ข้อผิดพลาด', error.message);
    } finally {
        btnSubmit.innerHTML = "ส่งข้อมูลเข้าระบบ"; btnSubmit.disabled = false;
    }
}

// ==========================================
// โหลดข้อมูลนักศึกษา (แสดงชั่วโมงรวม + เหตุผลปฏิเสธ)
// ==========================================
async function loadStudentActivities() {
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = '<tr><td colspan="3" class="text-center p-8">⏳ กำลังดึงข้อมูล...</td></tr>';
    let totalApprovedHours = 0;

    try {
        const { data, error } = await supabase.from('activities').select('*').eq('uid', currentUserId).order('created_at', { ascending: false });
        if (error) throw error;

        tbody.innerHTML = ''; 
        if (data.length === 0) return tbody.innerHTML = '<tr><td colspan="3" class="text-center p-8">ยังไม่มีประวัติ</td></tr>';

        data.forEach((item) => {
            const dateStr = new Date(item.actDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
            if (item.status === 'approved') totalApprovedHours += Number(item.act_hours || 0);

            let statusHtml = `<span class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">รอประเมิน</span>`;
            if (item.status === 'approved') statusHtml = `<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">อนุมัติแล้ว</span>`;
            if (item.status === 'rejected') {
                statusHtml = `
                    <span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold block mb-2">ไม่ผ่านเกณฑ์</span>
                    <div class="text-xs text-left bg-red-50 text-red-600 p-2 rounded-lg border border-red-100 mt-2"><b>เหตุผล:</b> ${item.reject_reason || 'ไม่ระบุ'}</div>
                `;
            }

            tbody.innerHTML += `
                <tr class="hover:bg-blue-50 border-b">
                    <td class="p-4 text-sm">${dateStr}</td>
                    <td class="p-4 text-sm font-bold">${item.actName} <span class="text-accent ml-2">(${item.act_hours} ชม.)</span><br><span class="text-xs text-gray-500 font-normal">รับรองโดย: ${item.actCertifier}</span></td>
                    <td class="p-4 text-center align-top">${statusHtml}</td>
                </tr>
            `;
        });
        document.getElementById('totalHoursText').innerText = `รวมชั่วโมงที่ผ่าน: ${totalApprovedHours} ชม.`;
    } catch (error) {
        console.error(error);
    }
}

// ==========================================
// ระบบแอดมินและการปฏิเสธพร้อมระบุเหตุผล
// ==========================================
async function loadAdminActivities() {
    const searchVal = document.getElementById('searchInput') ? document.getElementById('searchInput').value.trim() : '';
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = '<tr><td colspan="4" class="text-center p-8">⏳ ประมวลผล...</td></tr>';

    try {
        let query = supabase.from('activities').select('*, users(faculty, major)').order('created_at', { ascending: false });
        if (searchVal) query = query.ilike('studentId', `%${searchVal}%`);
        
        const { data, error } = await query;
        if (error) throw error;

        tbody.innerHTML = '';
        if (data.length === 0) return tbody.innerHTML = '<tr><td colspan="4" class="text-center p-8">ไม่พบรายการ</td></tr>';

        data.forEach((item) => {
            let filesHtml = item.files.map((f, i) => `<a href="${f.url}" target="_blank" class="text-primary text-xs hover:underline block mb-1">📄 เอกสาร ${i+1}</a>`).join('');
            
            let actionHtml = '';
            if (item.status === 'pending') {
                actionHtml = `
                    <button onclick="approveActivity('${item.id}')" class="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg w-full mb-1">✅ อนุมัติ</button>
                    <button onclick="openRejectModal('${item.id}')" class="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg w-full">❌ ปฏิเสธ</button>
                `;
            } else if (item.status === 'approved') {
                actionHtml = `<span class="text-green-600 font-bold text-sm">✔ อนุมัติแล้ว</span>`;
            } else {
                actionHtml = `<span class="text-red-600 font-bold text-sm">✖ ปฏิเสธแล้ว</span>`;
            }

            // ข้อมูลเสริมจาก users table (ถ้ามี)
            let userMeta = item.users ? `คณะ: ${item.users.faculty || '-'} <br> สาขา: ${item.users.major || '-'}` : '';

            tbody.innerHTML += `
                <tr class="hover:bg-blue-50 border-b">
                    <td class="p-4 text-sm text-gray-800"><b>${item.studentId}</b><br>${item.studentName}<br><span class="text-xs text-gray-500">${userMeta}</span></td>
                    <td class="p-4 text-sm font-bold">${item.actName} <span class="text-accent">(${item.act_hours} ชม.)</span><br><span class="text-xs text-gray-500 font-normal">วันที่ทำ: ${item.actDate}</span></td>
                    <td class="p-4">${filesHtml}</td>
                    <td class="p-4 text-center align-middle">${actionHtml}</td>
                </tr>
            `;
        });
    } catch (error) { console.error(error); }
}

// กดปุ่มอนุมัติ
window.approveActivity = async function(docId) {
    try {
        await supabase.from('activities').update({ status: 'approved' }).eq('id', docId);
        showModal('success', 'อนุมัติสำเร็จ', 'บันทึกชั่วโมงกิจกรรมเข้าระบบเรียบร้อย');
        loadAdminActivities();
    } catch (error) { showModal('error', 'Error', error.message); }
}

// เปิดหน้าต่างกรอกเหตุผลปฏิเสธ
window.openRejectModal = function(docId) {
    targetRejectId = docId;
    document.getElementById('rejectReasonInput').value = '';
    document.getElementById('rejectModal').classList.remove('hidden-section');
}

window.closeRejectModal = function() {
    targetRejectId = null;
    document.getElementById('rejectModal').classList.add('hidden-section');
}

// กดยืนยันการปฏิเสธ
window.confirmReject = async function() {
    const reason = document.getElementById('rejectReasonInput').value.trim();
    if (!reason) { alert("กรุณาระบุเหตุผลเพื่อให้นักศึกษาแก้ไข"); return; }
    
    try {
        await supabase.from('activities').update({ status: 'rejected', reject_reason: reason }).eq('id', targetRejectId);
        closeRejectModal();
        showModal('success', 'บันทึกการปฏิเสธ', 'แจ้งเหตุผลไปยังนักศึกษาเรียบร้อยแล้ว');
        loadAdminActivities();
    } catch (error) { showModal('error', 'Error', error.message); }
}

// ==========================================
// พรีวิว UI ไฟล์อัปโหลด
// ==========================================
window.handleFileSelect = function() {
    const input = document.getElementById('actFile');
    const preview = document.getElementById('filePreviewContainer');
    preview.innerHTML = ''; 
    Array.from(input.files).forEach((file) => {
        preview.innerHTML += `<div class="text-xs bg-white p-2 rounded border truncate">📄 ${file.name}</div>`;
    });
}

// ผูกฟังก์ชันเรียกใช้
window.switchView = switchView; window.handleRegister = handleRegister; window.handleLogin = handleLogin;
window.submitActivity = submitActivity; window.closeModal = closeModal; window.loadStudentActivities = loadStudentActivities; window.loadAdminActivities = loadAdminActivities;
