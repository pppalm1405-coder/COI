// script.js

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm";

const supabaseUrl = 'https://qrkuiwnqwjzmpenmuchd.supabase.co';
const supabaseKey = 'sb_publishable_AIuzxSZo9WwRAw_XjuxF7w_Ym84pcp1';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🟢 Supabase Initialized Successfully!");

let currentUserData = null;
let currentUserId = null;

// ==========================================
// ระบบจัดการ Custom Modal
// ==========================================
let modalCloseCallback = null;

function showModal(type, title, message, callback = null) {
    const modal = document.getElementById('customModal');
    const iconContainer = document.getElementById('modalIconContainer');
    const icon = document.getElementById('modalIcon');
    const btn = document.getElementById('modalBtn');
    
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalMessage').innerText = message;
    modalCloseCallback = callback;

    iconContainer.className = "mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4";
    btn.className = "w-full text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow";

    if (type === 'success') {
        iconContainer.classList.add('bg-green-100', 'text-green-600');
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>';
        btn.classList.add('bg-green-500', 'hover:bg-green-600');
    } else if (type === 'error') {
        iconContainer.classList.add('bg-red-100', 'text-red-600');
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
        btn.classList.add('bg-red-500', 'hover:bg-red-600');
    } else if (type === 'warning') {
        iconContainer.classList.add('bg-yellow-100', 'text-yellow-600');
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>';
        btn.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
    }

    modal.classList.remove('hidden-section');
}

function closeModal() {
    document.getElementById('customModal').classList.add('hidden-section');
    if (modalCloseCallback) {
        modalCloseCallback();
        modalCloseCallback = null;
    }
}

// ==========================================
// ลอจิกการทำงานของหน้าเว็บ
// ==========================================
function switchView(viewId) {
    document.getElementById('loginView').classList.add('hidden-section');
    document.getElementById('registerView').classList.add('hidden-section');
    document.getElementById('studentView').classList.add('hidden-section');
    document.getElementById('adminView').classList.add('hidden-section');
    
    document.getElementById(viewId).classList.remove('hidden-section');
    
    if(viewId === 'registerView') document.getElementById('registerForm').reset();
    if(viewId === 'loginView') {
        document.getElementById('loginForm').reset();
        document.getElementById('loginError').classList.add('hidden');
        currentUserData = null;
        currentUserId = null;
        supabase.auth.signOut();
    }
}

async function handleRegister() {
    const name = document.getElementById('regName').value.trim();
    const id = document.getElementById('regId').value.trim();
    const cardId = document.getElementById('regCardId').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (!name || !id || !cardId || !email || !password || !confirmPassword) {
        showModal('warning', 'ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลให้ครบทุกช่องก่อนดำเนินการต่อ');
        return;
    }
    if (password !== confirmPassword) {
        showModal('warning', 'รหัสผ่านไม่ตรงกัน', 'กรุณาตรวจสอบรหัสผ่านและการยืนยันรหัสผ่านอีกครั้ง');
        return;
    }

    const role = document.querySelector('input[name="userRole"]:checked').value;
    const btnRegister = document.getElementById('btnRegister');
    const originalBtnText = btnRegister.innerHTML;
    btnRegister.disabled = true;
    btnRegister.innerHTML = "⏳ กำลังดำเนินการลงทะเบียน...";

    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (authError) throw authError;

        const { error: dbError } = await supabase.from('users').insert([
            { 
                id: authData.user.id, 
                fullName: name, 
                studentId: id, 
                citizenId: cardId, 
                email: email, 
                role: role 
            }
        ]);

        if (dbError) throw dbError;

        showModal('success', 'ลงทะเบียนสำเร็จ!', 'บัญชีของคุณถูกสร้างเรียบร้อยแล้ว กรุณาเข้าสู่ระบบเพื่อใช้งาน', () => {
            switchView('loginView');
        });

    } catch (error) {
        console.error("Register Error:", error);
        showModal('error', 'เกิดข้อผิดพลาด', 'ข้อผิดพลาด: ' + error.message);
    } finally {
        btnRegister.disabled = false;
        btnRegister.innerHTML = originalBtnText;
    }
}

async function handleLogin() {
    const emailInput = document.getElementById('emailInput').value.trim();
    const passwordInput = document.getElementById('passwordInput').value.trim();
    const loginError = document.getElementById('loginError');

    loginError.classList.add('hidden');

    if (!emailInput || !passwordInput) {
        showModal('warning', 'ข้อมูลไม่ครบ', 'กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
        return;
    }

    const btnLogin = document.getElementById('btnLogin');
    const originalBtnText = btnLogin.innerHTML;
    btnLogin.disabled = true;
    btnLogin.innerHTML = "⏳ กำลังเข้าสู่ระบบ...";

    try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: emailInput,
            password: passwordInput,
        });

        if (authError) throw authError;

        currentUserId = authData.user.id;

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUserId)
            .single();

        if (userError || !userData) {
            loginError.innerText = "บัญชีนี้ไม่มีข้อมูลสถานะในระบบ ติดต่อแอดมิน";
            loginError.classList.remove('hidden');
            return;
        }

        currentUserData = userData;

        if (userData.role === 'admin') {
            switchView('adminView');
            loadAdminActivities();
        } else {
            document.getElementById('studentWelcomeText').innerText = `ยินดีต้อนรับ, ${userData.fullName} (${userData.studentId})`;
            switchView('studentView');
            document.getElementById('filePreviewContainer').innerHTML = '';
            loadStudentActivities();
        }
        document.getElementById('loginForm').reset();

    } catch (error) {
        console.error("Login Error:", error);
        loginError.innerText = "ไม่มีข้อมูลบัญชีผู้ใช้งานนี้ หรือ รหัสผ่านไม่ถูกต้อง";
        loginError.classList.remove('hidden');
    } finally {
        btnLogin.disabled = false;
        btnLogin.innerHTML = originalBtnText;
    }
}

// ==========================================
// 🔴 ระบบอัปโหลดและดึงข้อมูล Supabase
// ==========================================
async function submitActivity() {
    let isValid = true;
    const name = document.getElementById('actName');
    const date = document.getElementById('actDate');
    const certifier = document.getElementById('actCertifier');
    const fileInput = document.getElementById('actFile');

    if (!name.value.trim()) { showError(name, 'err-actName'); isValid = false; } else { clearError(name, 'err-actName'); }
    if (!date.value) { showError(date, 'err-actDate'); isValid = false; } else { clearError(date, 'err-actDate'); }
    if (!certifier.value.trim()) { showError(certifier, 'err-actCertifier'); isValid = false; } else { clearError(certifier, 'err-actCertifier'); }
    if (fileInput.files.length === 0) { showError(fileInput, 'err-actFile'); isValid = false; } else { clearError(fileInput, 'err-actFile'); }

    if (!isValid) {
        showModal('warning', 'ข้อมูลไม่ครบถ้วน', 'กรุณาตรวจสอบและกรอกข้อมูลในช่องสีแดงให้ครบถ้วน');
        return;
    }

    const btnSubmit = document.getElementById('btnSubmitActivity');
    const originalText = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = "⏳ กำลังอัปโหลดและบันทึกข้อมูล...";

    try {
        let uploadedFiles = [];
        
        for (let i = 0; i < fileInput.files.length; i++) {
            let file = fileInput.files[i];
            let filePath = `${currentUserId}/${Date.now()}_${file.name}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('activities')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from('activities')
                .getPublicUrl(filePath);

            uploadedFiles.push({ name: file.name, url: publicUrlData.publicUrl });
        }

        const { error: dbError } = await supabase.from('activities').insert([
            {
                uid: currentUserId,
                studentId: currentUserData.studentId,
                studentName: currentUserData.fullName,
                actName: name.value.trim(),
                actDate: date.value,
                actCertifier: certifier.value.trim(),
                files: uploadedFiles,
                status: 'pending'
            }
        ]);

        if (dbError) throw dbError;

        showModal('success', 'บันทึกข้อมูลสำเร็จ', 'ข้อมูลถูกส่งเข้าระบบเรียบร้อยแล้ว รอการตรวจสอบจากแอดมิน');
        
        document.getElementById('activityForm').reset();
        document.getElementById('filePreviewContainer').innerHTML = ''; 
        loadStudentActivities();

    } catch (error) {
        console.error("Submit Error:", error);
        showModal('error', 'เกิดข้อผิดพลาดในการบันทึก', error.message);
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalText;
    }
}

async function loadStudentActivities() {
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = '<tr><td colspan="3" class="text-center p-6 text-gray-500">⏳ กำลังโหลดข้อมูล...</td></tr>';

    try {
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('uid', currentUserId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        tbody.innerHTML = ''; 
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center p-6 text-gray-500">ยังไม่มีประวัติการส่งกิจกรรม</td></tr>';
            return;
        }

        data.forEach((item) => {
            const dateObj = new Date(item.actDate);
            const formattedDate = dateObj.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });

            let statusBadge = `<span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold">รอตรวจสอบ</span>`;
            if (item.status === 'approved') statusBadge = `<span class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">อนุมัติแล้ว</span>`;
            if (item.status === 'rejected') statusBadge = `<span class="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">ปฏิเสธ</span>`;

            tbody.innerHTML += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="p-3 text-sm text-gray-600">${formattedDate}</td>
                    <td class="p-3 text-sm font-medium text-gray-800">${item.actName}</td>
                    <td class="p-3 text-center">${statusBadge}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Load Student Data Error:", error);
        tbody.innerHTML = '<tr><td colspan="3" class="text-center p-6 text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>';
    }
}

async function loadAdminActivities() {
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center p-6 text-gray-500">⏳ กำลังโหลดข้อมูล...</td></tr>';

    try {
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center p-6 text-gray-500">ยังไม่มีนักศึกษาส่งกิจกรรมเข้ามา</td></tr>';
            return;
        }

        data.forEach((item) => {
            const dateObj = new Date(item.actDate);
            const formattedDate = dateObj.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });

            let filesHtml = '<div class="flex flex-col gap-1">';
            item.files.forEach((file, index) => {
                filesHtml += `<a href="${file.url}" target="_blank" class="text-blue-500 hover:text-blue-700 hover:underline text-xs flex items-center gap-1">📄 ไฟล์ ${index + 1}</a>`;
            });
            filesHtml += '</div>';

            let actionHtml = '';
            if (item.status === 'pending') {
                actionHtml = `
                    <button onclick="updateActivityStatus('${item.id}', 'approved')" class="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded shadow transition w-full mb-1">อนุมัติ</button>
                    <button onclick="updateActivityStatus('${item.id}', 'rejected')" class="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded shadow transition w-full">ปฏิเสธ</button>
                `;
            } else if (item.status === 'approved') {
                actionHtml = `<span class="text-green-600 font-bold text-sm">✔ อนุมัติแล้ว</span>`;
            } else {
                actionHtml = `<span class="text-red-600 font-bold text-sm">✖ ปฏิเสธ</span>`;
            }

            tbody.innerHTML += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="p-4 text-sm font-bold text-gray-700">${item.studentId}</td>
                    <td class="p-4 text-sm text-gray-600">${item.studentName}</td>
                    <td class="p-4 text-sm text-gray-800">${item.actName}<br><span class="text-xs text-gray-400">วันที่ทำ: ${formattedDate}</span></td>
                    <td class="p-4">${filesHtml}</td>
                    <td class="p-4 text-center align-middle w-24">${actionHtml}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Load Admin Data Error:", error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center p-6 text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>';
    }
}

window.updateActivityStatus = async function(docId, newStatus) {
    let actionText = newStatus === 'approved' ? 'อนุมัติกิจกรรม' : 'ปฏิเสธกิจกรรม';
    let btnColor = newStatus === 'approved' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600';

    showConfirmModal('ยืนยันการตรวจสอบ', `คุณต้องการ "${actionText}" ของนักศึกษาคนนี้ใช่หรือไม่?`, actionText, btnColor, async () => {
        try {
            const { error } = await supabase
                .from('activities')
                .update({ status: newStatus })
                .eq('id', docId);

            if (error) throw error;
            
            showModal('success', 'ทำรายการสำเร็จ', `ระบบได้บันทึกการ${actionText}เรียบร้อยแล้ว`);
            loadAdminActivities();
        } catch (error) {
            showModal('error', 'ข้อผิดพลาด', 'ไม่สามารถอัปเดตสถานะได้: ' + error.message);
        }
    });
}

// ==========================================
// ระบบจัดการ UI ไฟล์แนบ
// ==========================================
function handleFileSelect() {
    const input = document.getElementById('actFile');
    updateFilePreview(input);
}
function removeFile(indexToRemove) {
    const input = document.getElementById('actFile');
    const dt = new DataTransfer(); 
    for (let i = 0; i < input.files.length; i++) {
        if (i !== indexToRemove) dt.items.add(input.files[i]);
    }
    input.files = dt.files;
    updateFilePreview(input); 
}
function updateFilePreview(input) {
    const previewContainer = document.getElementById('filePreviewContainer');
    previewContainer.innerHTML = ''; 
    Array.from(input.files).forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = "flex items-center justify-between bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm transition-all hover:bg-gray-100";
        let fileName = file.name;
        if(fileName.length > 30) fileName = fileName.substring(0, 20) + "..." + fileName.substring(fileName.lastIndexOf('.'));
        let fileSize = (file.size / 1024).toFixed(1) + " KB";
        if(file.size > 1024 * 1024) fileSize = (file.size / (1024 * 1024)).toFixed(1) + " MB";
        const fileUrl = URL.createObjectURL(file);
        fileItem.innerHTML = `
            <div class="flex items-center gap-2 overflow-hidden">
                <span class="text-xl">📄</span>
                <a href="${fileUrl}" target="_blank" class="truncate text-blue-600 font-medium hover:underline hover:text-blue-800 cursor-pointer" title="คลิกเพื่อเปิดดูไฟล์นี้">${fileName}</a>
                <span class="text-xs text-gray-400 font-normal ml-1 whitespace-nowrap">(${fileSize})</span>
            </div>
            <button type="button" onclick="removeFile(${index})" class="text-red-400 hover:text-white hover:bg-red-500 font-bold w-6 h-6 rounded flex items-center justify-center transition-colors" title="ลบไฟล์นี้">&times;</button>
        `;
        previewContainer.appendChild(fileItem);
    });
}

function showError(inputElement, errorId) {
    inputElement.classList.add('border-red-500', 'bg-red-50');
    inputElement.classList.remove('border-gray-300');
    document.getElementById(errorId).classList.remove('hidden');
}
function clearError(inputElement, errorId) {
    inputElement.classList.remove('border-red-500', 'bg-red-50');
    inputElement.classList.add('border-gray-300');
    document.getElementById(errorId).classList.add('hidden');
}

// ==========================================
// ระบบจัดการ Confirm Modal อัจฉริยะ
// ==========================================
let confirmCallback = null;

window.showConfirmModal = function(title, message, confirmText, btnColorClass, onConfirm) {
    document.getElementById('confirmModalTitle').innerText = title;
    document.getElementById('confirmModalMessage').innerText = message;
    
    const btn = document.getElementById('confirmModalBtn');
    btn.innerText = confirmText;
    btn.className = `w-1/2 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow ${btnColorClass}`;
    
    confirmCallback = onConfirm;
    document.getElementById('confirmModal').classList.remove('hidden-section');
};

window.closeConfirmModal = function() {
    document.getElementById('confirmModal').classList.add('hidden-section');
    confirmCallback = null;
};

document.getElementById('confirmModalBtn').addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    closeConfirmModal();
});

// ผูกฟังก์ชันกับ Window
window.switchView = switchView;
window.handleRegister = handleRegister;
window.closeModal = closeModal;
window.handleLogin = handleLogin;
window.submitActivity = submitActivity;
window.handleFileSelect = handleFileSelect; 
window.removeFile = removeFile;
