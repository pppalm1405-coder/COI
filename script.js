// script.js

// ==========================================
// 1. นำเข้า Firebase SDK (ดึงผ่าน CDN สำหรับเว็บ)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

// นำเข้าโมดูลสำหรับ Authentication (เข้าสู่ระบบ/สมัครสมาชิก)
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// นำเข้าโมดูลสำหรับ Firestore (ฐานข้อมูลสำหรับเก็บประวัติและ Role)
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ==========================================
// 2. การตั้งค่า Firebase ของคุณ
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAzsDVuUVjDJbwN7NUgwrUyIHgk-9b82us",
  authDomain: "data-f0af4.firebaseapp.com",
  projectId: "data-f0af4",
  storageBucket: "data-f0af4.firebasestorage.app",
  messagingSenderId: "777288072214",
  appId: "1:777288072214:web:7b0018ba4d5025252f8937",
  measurementId: "G-WWCVXW155M"
};

// Initialize Firebase App และเครื่องมือต่างๆ
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // ตัวแปรจัดการระบบล็อกอิน
const db = getFirestore(app); // ตัวแปรจัดการฐานข้อมูล

console.log("🔥 Firebase Initialized Successfully!");

// ==========================================
// 3. ฟังก์ชันระบบ UI & Firebase Logic
// ==========================================

// --- ฟังก์ชันสลับหน้า ---
function switchView(viewId) {
    document.getElementById('loginView').classList.add('hidden-section');
    document.getElementById('registerView').classList.add('hidden-section');
    document.getElementById('studentView').classList.add('hidden-section');
    document.getElementById('adminView').classList.add('hidden-section');
    
    document.getElementById(viewId).classList.remove('hidden-section');
    
    if(viewId === 'registerView') document.getElementById('registerForm').reset();
    if(viewId === 'loginView') document.getElementById('loginForm').reset();
}

// --- ฟังก์ชันสมัครสมาชิก (บันทึกลง Firebase จริง) ---
async function handleRegister() {
    const name = document.getElementById('regName').value.trim();
    const id = document.getElementById('regId').value.trim();
    const cardId = document.getElementById('regCardId').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (!name || !id || !cardId || !email || !password || !confirmPassword) {
        alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
        return;
    }

    if (password !== confirmPassword) {
        alert("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน!");
        return;
    }

    const role = document.querySelector('input[name="userRole"]:checked').value;

    try {
        // 1. สร้างบัญชีผู้ใช้ใน Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. นำข้อมูลส่วนตัวและสถานะ (Role) ไปเก็บใน Firestore Collection "users"
        await setDoc(doc(db, "users", user.uid), {
            fullName: name,
            studentId: id,
            citizenId: cardId,
            email: email,
            role: role,
            createdAt: new Date()
        });

        // 3. แสดงป๊อปอัพยืนยันเมื่อสำเร็จ
        showSuccessModal();

    } catch (error) {
        const errorCode = error.code;
        if (errorCode === 'auth/email-already-in-use') {
            alert("อีเมลนี้ถูกใช้งานไปแล้ว กรุณาใช้อีเมลอื่น");
        } else if (errorCode === 'auth/weak-password') {
            alert("รหัสผ่านอ่อนเกินไป กรุณาตั้งรหัสผ่านอย่างน้อย 6 ตัวอักษร");
        } else {
            alert("เกิดข้อผิดพลาดในการลงทะเบียน: " + error.message);
        }
        console.error("Register Error:", error);
    }
}

// --- ฟังก์ชันเปิด/ปิด ป๊อปอัพ ---
function showSuccessModal() {
    document.getElementById('successModal').classList.remove('hidden-section');
}

function closeModalAndLogin() {
    document.getElementById('successModal').classList.add('hidden-section');
    switchView('loginView');
}

// --- ฟังก์ชันเข้าสู่ระบบ (เช็ค Firebase จริงและแยกสถานะ) ---
async function handleLogin() {
    const emailInput = document.getElementById('emailInput').value.trim();
    const passwordInput = document.getElementById('passwordInput').value.trim();

    if (!emailInput || !passwordInput) {
        alert("กรุณากรอกอีเมลและรหัสผ่าน");
        return;
    }

    try {
        // 1. ล็อกอินด้วย Email & Password
        const userCredential = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
        const user = userCredential.user;

        // 2. ดึงข้อมูลสถานะ (Role) จาก Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            
            // 3. แยกหน้าตาม Role ที่ตั้งไว้ตอนสมัคร
            if (userData.role === 'admin') {
                switchView('adminView');
            } else {
                document.getElementById('studentWelcomeText').innerText = `ยินดีต้อนรับ, ${userData.fullName} (${userData.studentId})`;
                switchView('studentView');
            }
        } else {
            alert("ไม่พบข้อมูลสถานะผู้ใช้งานในระบบ ติดต่อแอดมิน");
        }
        
        document.getElementById('loginForm').reset();

    } catch (error) {
        const errorCode = error.code;
        if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
            alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        } else {
            alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ: " + error.message);
        }
        console.error("Login Error:", error);
    }
}

// --- ฟังก์ชันตรวจสอบและบันทึกข้อมูลฟอร์มกิจกรรม ---
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
        alert('ข้อมูลถูกต้องครบถ้วน! (เดี๋ยวเราจะมาเขียนโค้ดอัปโหลดไฟล์ในขั้นตอนต่อไปครับ)');
        // document.getElementById('activityForm').reset();
    }
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
// 4. ผูกฟังก์ชันกับ Window เพื่อให้ HTML เรียกใช้ได้
// ==========================================
window.switchView = switchView;
window.handleRegister = handleRegister;
window.closeModalAndLogin = closeModalAndLogin;
window.handleLogin = handleLogin;
window.submitActivity = submitActivity;
