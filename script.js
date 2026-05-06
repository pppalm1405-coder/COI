// script.js

// ฟังก์ชันสลับหน้า UI (จำลองการ Login/Logout)
function switchView(viewId) {
    // ซ่อนทุกหน้าก่อน
    document.getElementById('loginView').classList.add('hidden-section');
    document.getElementById('studentView').classList.add('hidden-section');
    document.getElementById('adminView').classList.add('hidden-section');
    
    // แสดงเฉพาะหน้าที่ต้องการ
    document.getElementById(viewId).classList.remove('hidden-section');
    
    // ล้างค่า Error ทุกครั้งที่เข้าหน้านักศึกษาใหม่
    if(viewId === 'studentView') {
        resetValidation();
    }
}

// ฟังก์ชันตรวจสอบและบันทึกข้อมูล (ฝั่งนักศึกษา)
function submitActivity() {
    let isValid = true;
    
    // ดึงค่า DOM Elements
    const name = document.getElementById('actName');
    const date = document.getElementById('actDate');
    const certifier = document.getElementById('actCertifier');
    const file = document.getElementById('actFile');

    // ตรวจสอบ ชื่อกิจกรรม
    if (!name.value.trim()) {
        showError(name, 'err-actName');
        isValid = false;
    } else {
        clearError(name, 'err-actName');
    }

    // ตรวจสอบ วันที่
    if (!date.value) {
        showError(date, 'err-actDate');
        isValid = false;
    } else {
        clearError(date, 'err-actDate');
    }

    // ตรวจสอบ ผู้รับรอง
    if (!certifier.value.trim()) {
        showError(certifier, 'err-actCertifier');
        isValid = false;
    } else {
        clearError(certifier, 'err-actCertifier');
    }

    // ตรวจสอบ ไฟล์แนบ
    if (file.files.length === 0) {
        showError(file, 'err-actFile');
        isValid = false;
    } else {
        clearError(file, 'err-actFile');
    }

    // ถ้ายืนยันข้อมูลครบถ้วนทั้งหมด
    if (isValid) {
        alert('ข้อมูลถูกต้องครบถ้วน! (เตรียมส่งข้อมูลและไฟล์ขึ้น Firebase)');
        
        /* 
         * TO DO (Firebase Integration):
         * 1. อัปโหลด file.files[0] ไปยัง Firebase Storage
         * 2. นำ URL ที่ได้จาก Storage พร้อมกับ name.value, date.value, certifier.value บันทึกลง Firestore
         */
        
        // ล้างฟอร์มหลังจากส่งข้อมูลสำเร็จ
        document.getElementById('activityForm').reset();
    }
}

// ฟังก์ชันช่วยเหลือ (Utility): แสดงขอบสีแดงและข้อความแจ้งเตือน
function showError(inputElement, errorId) {
    inputElement.classList.add('border-red-500', 'bg-red-50');
    inputElement.classList.remove('border-gray-300');
    document.getElementById(errorId).classList.remove('hidden');
}

// ฟังก์ชันช่วยเหลือ (Utility): ล้างขอบสีแดงและซ่อนข้อความแจ้งเตือน
function clearError(inputElement, errorId) {
    inputElement.classList.remove('border-red-500', 'bg-red-50');
    inputElement.classList.add('border-gray-300');
    document.getElementById(errorId).classList.add('hidden');
}

// ฟังก์ชันช่วยเหลือ (Utility): ล้าง Error และล้างฟอร์มทั้งหมด
function resetValidation() {
    const inputs = ['actName', 'actDate', 'actCertifier', 'actFile'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            clearError(el, 'err-' + id);
        }
    });
    const form = document.getElementById('activityForm');
    if(form) {
        form.reset();
    }
}
