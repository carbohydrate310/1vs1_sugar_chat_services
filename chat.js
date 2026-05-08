import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    collection, query, where, onSnapshot, addDoc, serverTimestamp, 
    orderBy, doc, deleteDoc, getDocs 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUser = null;
let activeChatUserId = null;
let unsubscribeMessages = null; // リアルタイムリスナー解除用

// 1. ログイン状態のチェック
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('current-user-name').textContent = user.displayName || user.email;
        loadUserList();
    } else {
        window.location.href = 'index.html';
    }
});

// 2. ユーザー一覧の取得（自分以外）
async function loadUserList() {
    const q = query(collection(db, "users"), where("uid", "!=", currentUser.uid));
    const querySnapshot = await getDocs(q);
    const userListEl = document.getElementById('user-list');
    userListEl.innerHTML = '';

    querySnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        const li = document.createElement('li');
        li.className = 'user-item';
        li.textContent = userData.displayName || userData.username;
        li.onclick = () => startChat(userData.uid, userData.displayName);
        userListEl.appendChild(li);
    });
}

// 3. チャット開始（ルームの切り替え）
function startChat(targetUid, targetName) {
    activeChatUserId = targetUid;
    document.getElementById('target-user-name').textContent = targetName;
    document.getElementById('chat-form').classList.remove('hidden');
    
    // 既存のリスナーがあれば解除
    if (unsubscribeMessages) unsubscribeMessages();

    // members [uid1, uid2].sort() で一意のチャットルームを特定
    const roomIds = [currentUser.uid, targetUid].sort();
    const q = query(
        collection(db, "messages"),
        where("members", "==", roomIds),
        orderBy("createdAt", "asc")
    );

    // リアルタイム受信
    unsubscribeMessages = onSnapshot(q, (snapshot) => {
        const container = document.getElementById('message-container');
        container.innerHTML = '';
        snapshot.forEach((msgDoc) => {
            const data = msgDoc.data();
            renderMessage(msgDoc.id, data);
        });
        container.scrollTop = container.scrollHeight;
    });
}

// 4. メッセージの描画
function renderMessage(id, data) {
    const container = document.getElementById('message-container');
    const isMine = data.senderId === currentUser.uid;
    const time = data.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '...';

    const div = document.createElement('div');
    div.className = `msg ${isMine ? 'sent' : 'received'}`;
    div.innerHTML = `
        <div class="msg-text">${data.text}</div>
        <span class="msg-time">${time}</span>
        ${isMine ? `<button class="delete-btn" onclick="deleteMsg('${id}')">削除</button>` : ''}
    `;
    container.appendChild(div);
}

// 5. メッセージ送信
document.getElementById('chat-form').onsubmit = async (e) => {
    e.preventDefault();
    const input = document.getElementById('message-input');
    if (!input.value.trim() || !activeChatUserId) return;

    const roomIds = [currentUser.uid, activeChatUserId].sort();
    await addDoc(collection(db, "messages"), {
        text: input.value,
        senderId: currentUser.uid,
        members: roomIds,
        createdAt: serverTimestamp()
    });
    input.value = '';
};

// 6. メッセージ削除（グローバル関数として定義）
window.deleteMsg = async (id) => {
    if (confirm("このメッセージを削除しますか？")) {
        await deleteDoc(doc(db, "messages", id));
    }
};

// 7. ログアウト
document.getElementById('logout-btn').onclick = () => signOut(auth);
