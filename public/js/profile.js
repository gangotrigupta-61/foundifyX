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

/* ===============================
   GLOBAL MODAL CLOSE (HTML onclick)
=============================== */
window.closeModal = function () {
  document.getElementById("itemModal").style.display = "none";
};

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

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  const displayName =
    userSnap.exists()
      ? userSnap.data().name || "User"
      : user.displayName || "User";

  nameEl.innerText = displayName;
  avatarEl.innerText = displayName.charAt(0).toUpperCase();

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

  itemsSnap.forEach((docSnap) => {
    const item = docSnap.data();

    container.innerHTML += `
      <div class="item-card"
        data-item-id="${docSnap.id}"
        data-title="${item.title}"
        data-status="${item.status}"
        data-location="${item.location}"
        data-description="${item.description || "No description"}"
        data-image="${item.image || "assets/no-image.png"}">

        <img src="${item.image || "assets/no-image.png"}" />
        <h4>${item.title}</h4>
        <span class="status ${item.status}">
          ${item.status.toUpperCase()}
        </span>
        <p>📍 ${item.location}</p>
      </div>
    `;
  });

  setTimeout(attachItemCardClick, 300);

  /* ===============================
     🔔 NOTIFICATIONS + BADGE
  =============================== */
  const notifBox = document.getElementById("notifications");
  const badge = document.getElementById("notifBadge");

  const notifQuery = query(
    collection(db, "notifications"),
    where("toUid", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  onSnapshot(notifQuery, (snapshot) => {
    notifBox.innerHTML = "";
    let unreadCount = 0;

    if (snapshot.empty) {
      notifBox.innerHTML = `<p>No notifications yet</p>`;
      badge.style.display = "none";
      return;
    }

    snapshot.forEach((docSnap) => {
      const notif = docSnap.data();
      if (!notif.read) unreadCount++;

      const div = document.createElement("div");
      div.className = `notif ${notif.read ? "" : "unread"}`;

      div.innerHTML = `
        <strong>${notif.message}</strong><br/>
        <small>
          ${notif.createdAt
            ? notif.createdAt.toDate().toLocaleString()
            : ""}
        </small>
      `;

      div.onclick = async () => {
        if (!notif.read) {
          await updateDoc(doc(db, "notifications", docSnap.id), {
            read: true
          });
        }

        if (notif.matchedItemId) {
          const waitForCard = setInterval(() => {
            const card = document.querySelector(
              `[data-item-id="${notif.matchedItemId}"]`
            );

            if (card) {
              clearInterval(waitForCard);

              card.scrollIntoView({
                behavior: "smooth",
                block: "center"
              });

              card.classList.add("highlight");
              setTimeout(() => card.classList.remove("highlight"), 3000);

              openItemModal(card);
            }
          }, 200);
        }
      };

      notifBox.appendChild(div);
    });

    if (unreadCount > 0) {
      badge.style.display = "inline-block";
      badge.innerText = unreadCount;
    } else {
      badge.style.display = "none";
    }
  });
});

/* ===============================
   ITEM CARD CLICK
=============================== */
function attachItemCardClick() {
  document.querySelectorAll(".item-card").forEach(card => {
    card.onclick = () => openItemModal(card);
  });
}

/* ===============================
   OPEN MODAL
=============================== */
function openItemModal(card) {
  document.getElementById("modalTitle").innerText = card.dataset.title;
  document.getElementById("modalStatus").innerText = card.dataset.status;
  document.getElementById("modalLocation").innerText = card.dataset.location;
  document.getElementById("modalDescription").innerText = card.dataset.description;
  document.getElementById("modalImage").src = card.dataset.image;

  document.getElementById("itemModal").style.display = "flex";
}

/* ===============================
   📱 SWIPE DOWN TO CLOSE (MOBILE)
=============================== */
let startY = 0;
let endY = 0;
const modal = document.getElementById("itemModal");

modal.addEventListener("touchstart", (e) => {
  startY = e.touches[0].clientY;
});

modal.addEventListener("touchmove", (e) => {
  endY = e.touches[0].clientY;
});

modal.addEventListener("touchend", () => {
  if (endY - startY > 120) {
    modal.style.display = "none";
  }
});

/* ===============================
   CLICK OUTSIDE MODAL CLOSE
=============================== */
document.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});