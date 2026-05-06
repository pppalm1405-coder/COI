// script.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
// 🔴 ระบบจัดการ Custom Modal อัจฉริยะ
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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // ถ้าโค้ดค้าง มักจะค้างที่บรรทัดด้านล่างนี้ หากยังไม่ได้กดสร้างฐานข้อมูลในเว็บ Firebase
        await setDoc(doc(db, "users", user.uid), {
            fullName: name,
            studentId: id,
            citizenId: cardId,
            email: email,
            role: role,
            createdAt: new Date()
        });

        showModal('success', 'ลงทะเบียนสำเร็จ!', 'บัญชีของคุณถูกสร้างเรียบร้อยแล้ว กรุณาเข้าสู่ระบบเพื่อใช้งาน', () => {
            switchView('loginView');
        });

    } catch (error) {
        const errorCode = error.code;
        if (errorCode === 'auth/configuration-not-found') {
            showModal('error', 'ระบบขัดข้อง', 'คุณยังไม่ได้เปิดใช้งาน Sign-in provider ใน Firebase');
        } else if (errorCode === 'auth/unauthorized-domain') {
            showModal('error', 'ระบบขัดข้อง', 'โดเมนนี้ยังไม่ได้รับอนุญาตให้ใช้งานในระบบ');
        } else if (errorCode === 'auth/email-already-in-use') {
            showModal('error', 'อีเมลซ้ำ', 'อีเมลนี้ถูกใช้งานไปแล้ว กรุณาใช้อีเมลอื่นในการลงทะเบียน');
        } else if (errorCode === 'auth/weak-password') {
            showModal('warning', 'รหัสผ่านอ่อนเกินไป', 'กรุณาตั้งรหัสผ่านอย่างน้อย 6 ตัวอักษร');
        } else if (errorCode === 'permission-denied') {
            // เพิ่มการดักจับหากสร้างฐานข้อมูลแล้ว แต่ลืมแก้ Rules
            showModal('error', 'ข้อผิดพลาดฐานข้อมูล', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาเปิด Test Mode ในแท็บ Rules ของ Firestore Database');
        } else {
            showModal('error', 'เกิดข้อผิดพลาด', 'ข้อผิดพลาด: ' + error.message);
        }
        console.error("Register Error:", error);
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
        if (error.code === 'auth/configuration-not-found') {
            loginError.innerText = "ระบบล็อกอินปิดอยู่ (ติดต่อผู้ดูแล Firebase)";
        } else {
            loginError.innerText = "ไม่มีข้อมูลบัญชีผู้ใช้งานนี้ หรือ รหัสผ่านไม่ถูกต้อง";
        }
        loginError.classList.remove('hidden');
    } finally {
        btnLogin.disabled = false;
        btnLogin.innerHTML = originalBtnText;
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
        showModal('success', 'บันทึกข้อมูลสำเร็จ', 'ข้อมูลถูกตรวจสอบและเตรียมส่งเข้าสู่ระบบแล้ว (รออัปโหลดไฟล์ในขั้นตอนถัดไป)', () => {
            document.getElementById('activityForm').reset();
        });
    } else {
        showModal('warning', 'ข้อมูลไม่ครบถ้วน', 'กรุณาตรวจสอบและกรอกข้อมูลในช่องสีแดงให้ครบถ้วน');
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
window.closeModal = closeModal;
window.handleLogin = handleLogin;
window.submitActivity = submitActivity;
