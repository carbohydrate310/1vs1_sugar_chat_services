import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// デバッグ用：dbが正しくインポートされているか確認
console.log("Firebase Auth:", auth);
console.log("Firebase Firestore:", db);

const authForm = document.getElementById('auth-form');
const switchModeBtn = document.getElementById('switch-mode');
const displayNameGroup = document.getElementById('display-name-group');
const submitBtn = document.getElementById('submit-btn');

let isLoginMode = true;

if (switchModeBtn) {
    switchModeBtn.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        submitBtn.textContent = isLoginMode ? 'ログイン' : '新規登録';
        displayNameGroup.classList.toggle('hidden', isLoginMode);
        document.getElementById('toggle-text').firstChild.textContent = 
            isLoginMode ? 'アカウントをお持ちでないですか？ ' : '既にアカウントをお持ちですか？ ';
        switchModeBtn.textContent = isLoginMode ? '新規登録' : 'ログイン';
    });
}

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 実行直前にdbの存在チェック
    if (!db) {
        console.error("Firestore (db) が初期化されていません。firebase-config.jsを確認してください。");
        alert("システムエラー: データベースに接続できません。");
        return;
    }

    const username = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const email = `${username}@app.com`;

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, pass);
        } else {
            const displayName = document.getElementById('display-name').value;
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            await updateProfile(userCredential.user, { displayName });

            await setDoc(doc(db, "users", userCredential.user.uid), {
                uid: userCredential.user.uid,
                displayName: displayName,
                username: username,
                updatedAt: new Date()
            });
        }
        window.location.href = 'chat.html';
    } catch (error) {
        console.error("Auth Error:", error);
        alert("エラー: " + error.message);
    }
});

// Googleログイン（ボタンがある場合のみ）
const googleBtn = document.getElementById('google-login-btn');
if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await setDoc(doc(db, "users", result.user.uid), {
                uid: result.user.uid,
                displayName: result.user.displayName,
                updatedAt: new Date()
            }, { merge: true });
            window.location.href = 'chat.html';
        } catch (error) {
            console.error("Google Auth Error:", error);
            alert("Googleログインに失敗しました");
        }
    });
}
