// script.js

// ฟังก์ชันจำลองการเข้าสู่ระบบและแยกสถานะอัตโนมัติ
function handleLogin() {
    const emailInput = document.getElementById('emailInput').value.trim();
    const passwordInput = document.getElementById('passwordInput').value.trim();

    // 1. ตรวจสอบว่ากรอกข้อมูลครบไหม
    if (!emailInput || !passwordInput) {
        alert("กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน");
        return;
    }

    /* 
     * TO DO (Firebase Integration):
     * ตรงนี้ในอนาคตจะใช้คำสั่ง signInWithEmailAndPassword ของ Firebase
     * แล้วไปดึงข้อมูล Role จาก Firestore เพื่อดูว่าเป็นใคร 
     */

    // 2. จำลองการแยกสถานะ (Mock Auto-Routing)
    // ถ้าระบุคำว่า "admin" ในอีเมล ให้มองว่าเป็นผู้ดูแลระบบ
    if (emailInput.toLowerCase().includes('admin')) {
        alert("เข้าสู่ระบบสำเร็จ! ในฐานะ: ผู้ดูแลระบบ (Admin)");
        switchView('adminView');
    } 
    // นอกนั้นให้มองว่าเป็นนักศึกษาทั้งหมด
    else {
        alert("เข้าสู่ระบบสำเร็จ! ในฐานะ: นักศึกษา (Student)");
        document.getElementById('studentWelcomeText').innerText = `ยินดีต้อนรับ, ${emailInput}`;
        switchView('studentView');
    }

    // ล้างค่าช่องรหัสผ่านเพื่อความปลอดภัย (จำลอง)
    document.getElementById('loginForm').reset();
}

// ฟังก์ชันสลับหน้า UI (ยังคงเดิม)
function switchView(viewId) {
    document.getElementById('loginView').classList.add('hidden-section');
    document.getElementById('studentView').classList.add('hidden-section');
    document.getElementById('adminView').classList.add('hidden-section');
    
    document.getElementById(viewId).classList.remove('hidden-section');
    
    // ล้างค่า Error ทุกครั้งที่เข้าหน้านักศึกษาใหม่
    if(viewId === 'studentView') {
        resetValidation();
    }
}

// ฟังก์ชันตรวจสอบและบันทึกข้อมูล (ฝั่งนักศึกษา)
function submitActivity() {
    let isValid = true;
    
    const name = document.getElementById('actName');
    const date = document.getElementById('actDate');
    const certifier = document.getElementById('actCertifier');
    const file = document.getElementById('actFile');

    if (!name.value.trim()) { showError(name, 'err-actName'); isValid = false; } else { clearError(name, 'err-actName'); }
    if (!date.value) { showError(date, 'err-actDate'); isValid = false; } else { clearError(date, 'err-actDate'); }
    if (!certifier.value.trim()) { showError(certifier, 'err-actCertifier'); isValid = false; } else { clearError(certifier, 'err-actCertifier'); }
    if (file.files.length === 0) { showError(file, 'err-actFile'); isValid = false; } else { clearError(file, 'err-actFile'); }

    if (isValid) {
        alert('ข้อมูลถูกต้องครบถ้วน! (เตรียมส่งข้อมูลและไฟล์ขึ้น Firebase)');
        document.getElementById('activityForm').reset();
    }
}

// Utility functions
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

function resetValidation() {
    const inputs = ['actName', 'actDate', 'actCertifier', 'actFile'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if(el) clearError(el, 'err-' + id);
    });
    const form = document.getElementById('activityForm');
    if(form) form.reset();
}
