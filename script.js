// script.js

// -----------------------------------------
// ส่วนจัดการการสลับหน้า (UI Routing)
// -----------------------------------------
function switchView(viewId) {
    document.getElementById('loginView').classList.add('hidden-section');
    document.getElementById('registerView').classList.add('hidden-section');
    document.getElementById('studentView').classList.add('hidden-section');
    document.getElementById('adminView').classList.add('hidden-section');
    
    document.getElementById(viewId).classList.remove('hidden-section');
    
    // ล้างค่าฟอร์มเมื่อสลับหน้า
    if(viewId === 'registerView') document.getElementById('registerForm').reset();
    if(viewId === 'loginView') document.getElementById('loginForm').reset();
}

// -----------------------------------------
// ส่วนจัดการ การลงทะเบียน (Register)
// -----------------------------------------
function handleRegister() {
    const name = document.getElementById('regName').value.trim();
    const id = document.getElementById('regId').value.trim();
    const cardId = document.getElementById('regCardId').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    // ตรวจสอบว่ากรอกข้อมูลครบไหม
    if (!name || !id || !cardId || !email || !password || !confirmPassword) {
        alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
        return;
    }

    // ตรวจสอบรหัสผ่านว่าตรงกันไหม
    if (password !== confirmPassword) {
        alert("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน!");
        return;
    }

    // หาสถานะที่ถูกเลือก (student หรือ admin)
    const role = document.querySelector('input[name="userRole"]:checked').value;

    /* 
     * TO DO (Firebase Integration):
     * 1. ใช้ createUserWithEmailAndPassword() สมัครสมาชิก
     * 2. เอาข้อมูล name, id, cardId, role บันทึกลง Firestore Document ของ User นั้น
     */

    // เมื่อทุกอย่างเรียบร้อย เปิด Popup ยืนยัน
    showSuccessModal();
}

// เปิด Popup สำเร็จ
function showSuccessModal() {
    document.getElementById('successModal').classList.remove('hidden-section');
}

// ปิด Popup แล้วสลับกลับไปหน้า Login
function closeModalAndLogin() {
    document.getElementById('successModal').classList.add('hidden-section');
    switchView('loginView');
}

// -----------------------------------------
// ส่วนจัดการ การเข้าสู่ระบบ (Login)
// -----------------------------------------
function handleLogin() {
    const emailInput = document.getElementById('emailInput').value.trim();
    const passwordInput = document.getElementById('passwordInput').value.trim();

    if (!emailInput || !passwordInput) {
        alert("กรุณากรอกอีเมลและรหัสผ่าน");
        return;
    }

    /* TO DO: ใช้ Firebase signInWithEmailAndPassword แล้วดึง Role มาเช็ค */

    if (emailInput.toLowerCase().includes('admin')) {
        switchView('adminView');
    } else {
        document.getElementById('studentWelcomeText').innerText = `ยินดีต้อนรับ, ${emailInput}`;
        switchView('studentView');
    }
    document.getElementById('loginForm').reset();
}

// -----------------------------------------
// ส่วนจัดการ หน้าของนักศึกษา (Activity Form)
// -----------------------------------------
// (ส่วนนี้ใช้โค้ดชุดเดิมจากข้อความก่อนหน้าได้เลยครับ ผมใส่ละไว้เพื่อให้โค้ดไม่ยาวเกินไป)
function submitActivity() {
    // โค้ด submitActivity เดิม...
}
function showError(inputElement, errorId) {
    // โค้ด showError เดิม...
}
function clearError(inputElement, errorId) {
    // โค้ด clearError เดิม...
}
