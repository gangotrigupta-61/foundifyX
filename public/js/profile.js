import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  /* ===============================
     USER INFO
  =============================== */
  const nameEl = document.getElementById("userName");
  const emailEl = document.getElementById("userEmail");
  const avatarEl = document.getElementById("avatar");

  emailEl.innerText = user.email;

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    let displayName = "User";

    if (userSnap.exists()) {
      displayName = userSnap.data().name || user.displayName || "User";
    } else if (user.displayName) {
      displayName = user.displayName;
    }

    nameEl.innerText = displayName;
    avatarEl.innerText = displayName.charAt(0).toUpperCase();
  } catch (e) {
    console.error(e);
  }

  /* ===============================
     USER ITEMS
  =============================== */
  const container = document.getElementById("myItems");

  const itemQuery = query(
    collection(db, "items"),
    where("uid", "==", user.uid)
  );

  const itemsSnap = await getDocs(itemQuery);

  container.innerHTML = "";

  itemsSnap.forEach(docSnap => {
    const item = docSnap.data();
    container.innerHTML += `
      <div class="item-card">
        <img src="${item.image || 'assets/no-image.png'}" />
        <h4>${item.title}</h4>
        <span class="status ${item.status}">${item.status.toUpperCase()}</span>
        <p>📍 ${item.location}</p>
      </div>
    `;
  });

  /* ===============================
     🔔 NOTIFICATIONS (FIXED)
  =============================== */

  const notifBox = document.getElementById("notifications");

  const notifQuery = query(
    collection(db, "notifications"),
    where("toUid", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  onSnapshot(notifQuery, (snapshot) => {
    notifBox.innerHTML = "";

    if (snapshot.empty) {
      notifBox.innerHTML = `<p>No notifications yet</p>`;
      return;
    }

    snapshot.forEach((docSnap) => {
      const notif = docSnap.data();

      const div = document.createElement("div");
      div.className = `notif ${notif.read ? "" : "unread"}`;
      div.innerHTML = `
        <strong>${notif.message}</strong>
        <br/>
        <small>${notif.createdAt?.toDate().toLocaleString()}</small>
      `;

      div.onclick = async () => {
        if (!notif.read) {
          await updateDoc(doc(db, "notifications", docSnap.id), {
            read: true
          });
        }
      };

      notifBox.appendChild(div);
    });
  });
});
