import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const authForm = document.getElementById('auth-form');
const switchModeBtn = document.getElementById('switch-mode');
const displayNameGroup = document.getElementById('display-name-group');
const submitBtn = document.getElementById('submit-btn');

let isLoginMode = true;

// ログイン/新規登録の切り替えUI
switchModeBtn.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    submitBtn.textContent = isLoginMode ? 'ログイン' : '新規登録';
    displayNameGroup.classList.toggle('hidden', isLoginMode);
    document.getElementById('toggle-text').firstChild.textContent = 
        isLoginMode ? 'アカウントをお持ちでないですか？ ' : '既にアカウントをお持ちですか？ ';
    switchModeBtn.textContent = isLoginMode ? '新規登録' : 'ログイン';
});

// 認証メインロジック
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const email = `${username}@app.com`; // 仮想メールアドレス

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, pass);
        } else {
            const displayName = document.getElementById('display-name').value;
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            
            // Authプロフィール更新
            await updateProfile(userCredential.user, { displayName });

            // Firestoreにユーザー情報を保存
            await setDoc(doc(db, "users", userCredential.user.uid), {
                uid: userCredential.user.uid,
                displayName: displayName,
                username: username,
                updatedAt: new Date()
            });
        }
        window.location.href = 'chat.html'; // 成功時にチャット画面へ
    } catch (error) {
        alert("エラー: " + error.message);
    }
});

// Googleログイン
document.getElementById('google-login-btn').addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        // 初回ログイン時はFirestoreにユーザー情報を保存（必要に応じて）
        await setDoc(doc(db, "users", result.user.uid), {
            uid: result.user.uid,
            displayName: result.user.displayName,
            updatedAt: new Date()
        }, { merge: true });
        window.location.href = 'chat.html';
    } catch (error) {
        alert("Googleログインに失敗しました");
    }
});
