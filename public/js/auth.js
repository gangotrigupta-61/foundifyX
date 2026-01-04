// auth.js
// =======================
// IMPORTS
// =======================

import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// =======================
// HELPERS
// =======================

function mapAuthError(code) {
  const map = {
    "auth/wrong-password": "Incorrect password.",
    "auth/user-not-found": "No account found with this email.",
    "auth/invalid-email": "Invalid email address.",
    "auth/email-already-in-use": "Email already registered.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "default": "Authentication failed."
  };
  return map[code] || map.default;
}

function showLoginError(msg) {
  const el = document.getElementById("loginError");
  if (el) {
    el.textContent = msg;
    el.style.display = "block";
  } else {
    alert(msg);
  }
}

// =======================
// SIGNUP
// =======================

const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { name, email, password } = signupForm;

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.value.trim(),
        password.value
      );

      await setDoc(doc(db, "users", cred.user.uid), {
        name: name.value.trim(),
        email: email.value.trim(),
        createdAt: serverTimestamp()
      });

      window.location.href = "login.html";
    } catch (err) {
      alert(mapAuthError(err.code));
    }
  });
}

// =======================
// LOGIN
// =======================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail")?.value;
    const password = document.getElementById("loginPassword")?.value;

    if (!email || !password) {
      showLoginError("Enter email & password");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "index.html";
    } catch (err) {
      showLoginError(mapAuthError(err.code));
    }
  });
}

// =======================
// 🔔 PROFILE NOTIFICATION BADGE LOGIC
// =======================

const profileLi   = document.getElementById("profileLi");
const profileLink = document.getElementById("profileLink");
const notifDot    = document.getElementById("notifDot");
const notifBadge  = document.getElementById("notifBadge");

let unsubscribeNotifications = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    if (profileLi) profileLi.style.display = "none";
    if (unsubscribeNotifications) unsubscribeNotifications();
    return;
  }

  // show profile
  if (profileLi) profileLi.style.display = "block";

  const q = query(
    collection(db, "notifications"),
    where("toUid", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  unsubscribeNotifications = onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    const unreadCount = notifications.filter(n => n.read === false).length;

    // 🔴 red dot
    if (notifDot) {
      notifDot.classList.toggle("hidden", unreadCount === 0);
    }

    // 🔢 badge
    if (notifBadge) {
      if (unreadCount > 0) {
        notifBadge.textContent = unreadCount > 9 ? "9+" : unreadCount;
        notifBadge.classList.remove("hidden");
      } else {
        notifBadge.classList.add("hidden");
      }
    }
  });
});

// =======================
// MARK NOTIFICATIONS READ ON PROFILE CLICK
// =======================

profileLink?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(
    collection(db, "notifications"),
    where("toUid", "==", user.uid),
    where("read", "==", false)
  );

  const snap = await getDocs(q);
  if (snap.empty) return;

  const batch = writeBatch(db);
  snap.forEach(d => {
    batch.update(doc(db, "notifications", d.id), { read: true });
  });

  await batch.commit();
});

// =======================
// LOGOUT
// =======================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}

// =======================
// PASSWORD RESET
// =======================

const resetForm = document.getElementById("resetForm");

if (resetForm) {
  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("resetEmail")?.value.trim();
    if (!email) return alert("Enter your email");

    try {
      await sendPasswordResetEmail(auth, email);
      alert("✅ Reset link sent to email");
    } catch (err) {
      alert(mapAuthError(err.code));
    }
  });
}

// =======================
// GOOGLE LOGIN
// =======================

const googleBtn = document.getElementById("googleLoginBtn");

if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    googleBtn.disabled = true;

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(
        doc(db, "users", user.uid),
        {
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
          provider: "google",
          createdAt: serverTimestamp()
        },
        { merge: true }
      );

      window.location.href = "index.html";
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        alert(err.message);
      }
    } finally {
      googleBtn.disabled = false;
    }
  });
}