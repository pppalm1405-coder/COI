// script.js

// ==========================================
// 1. นำเข้า Firebase SDK
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
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

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); 
const db = getFirestore(app); 

console.log("🔥 Firebase Initialized Successfully!");

// ==========================================
// 3. ฟังก์ชันระบบ UI & Firebase Logic
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
        document.getElementById('loginError').classList.add('hidden'); // ซ่อน error เสมอตอนกลับมาหน้า login
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
        alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
        return;
    }

    if (password !== confirmPassword) {
        alert("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน!");
        return;
    }

    const role = document.querySelector('input[name="userRole"]:checked').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            fullName: name,
            studentId: id,
            citizenId: cardId,
            email: email,
            role: role,
            createdAt: new Date()
        });

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

function showSuccessModal() {
    document.getElementById('successModal').classList.remove('hidden-section');
}

function closeModalAndLogin() {
    document.getElementById('successModal').classList.add('hidden-section');
    switchView('loginView');
}

// --- ฟังก์ชันเข้าสู่ระบบฉบับอัปเดต (มีแจ้งเตือนสีแดง) ---
async function handleLogin() {
    const emailInput = document.getElementById('emailInput').value.trim();
    const passwordInput = document.getElementById('passwordInput').value.trim();
    const loginError = document.getElementById('loginError');

    // ซ่อนข้อความแจ้งเตือนสีแดงก่อนทุกครั้งที่กดปุ่ม
    loginError.classList.add('hidden');

    if (!emailInput || !passwordInput) {
        loginError.innerText = "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน";
        loginError.classList.remove('hidden');
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
        const user = userCredential.user;

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            
            if (userData.role === 'admin') {
                switchView('adminView');
            } else {
                document.getElementById('studentWelcomeText').innerText = `ยินดีต้อนรับ, ${userData.fullName} (${userData.studentId})`;
                switchView('studentView');
            }
            document.getElementById('loginForm').reset();
        } else {
            loginError.innerText = "บัญชีนี้ไม่มีข้อมูลสถานะในระบบ ติดต่อแอดมิน";
            loginError.classList.remove('hidden');
        }

    } catch (error) {
        console.error("Login Error:", error);
        // แสดงข้อความสีแดงเมื่อรหัสผิด หรือไม่มีอีเมลในระบบ
        loginError.innerText = "ไม่มีข้อมูลบัญชีผู้ใช้งานนี้ หรือ รหัสผ่านไม่ถูกต้อง";
        loginError.classList.remove('hidden');
    }
}

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
        alert('ข้อมูลถูกต้องครบถ้วน! (รอการเชื่อมต่ออัปโหลดไฟล์)');
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
// 4. ผูกฟังก์ชันกับ Window
// ==========================================
window.switchView = switchView;
window.handleRegister = handleRegister;
window.closeModalAndLogin = closeModalAndLogin;
window.handleLogin = handleLogin;
window.submitActivity = submitActivity;
