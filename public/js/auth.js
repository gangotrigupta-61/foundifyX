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
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// =======================
// Helpers
// =======================

/**
 * Map common Firebase auth error codes to friendly messages.
 * Add more mappings if you see other codes in console.
 */
function mapAuthError(code) {
  const map = {
    // sign-in
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/user-not-found": "No account found with this email.",
    "auth/invalid-email": "Email address is invalid. Check spelling.",
    "auth/too-many-requests": "Too many failed attempts. Try again later.",

    // sign-up
    "auth/email-already-in-use": "This email is already in use. Try logging in.",
    "auth/weak-password": "Password is too weak. Use at least 6 characters.",

    // reset
    "auth/invalid-recipient-email": "The email address for password reset is invalid.",
    "auth/invalid-action-code": "Invalid action code.",
    "auth/expired-action-code": "Reset link expired. Request a new one.",

    // fallback
    "default": "Authentication failed. Please try again."
  };

  return map[code] || map["default"];
}

function showLoginError(msg) {
  const loginError = document.getElementById("loginError");
  if (loginError) {
    loginError.textContent = msg;
    loginError.style.display = "block";
  } else {
    // fallback to alert if the element doesn't exist
    alert(msg);
  }
}

// =======================
// SIGN UP
// =======================

const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = signupForm.name.value.trim();
    const email = signupForm.email.value.trim();
    const password = signupForm.password.value;

    if (!name || !email || !password) {
      alert("Please complete all required fields.");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", userCred.user.uid), {
        name,
        email,
        createdAt: new Date().toISOString()
      });

      alert("Signup Successful");
      window.location.href = "login.html";

    } catch (error) {
      console.error("SIGNUP ERROR:", error);
      const friendly = mapAuthError(error.code);
      alert(friendly);
    }
  });
}

// =======================
// LOGIN
// =======================

const loginForm = document.getElementById("loginForm");

// Optional inline error container: add this to login.html near the form:
// <div id="loginError" style="color:#f44336; margin:8px 0; display:none"></div>

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // hide previous inline error if present
    const loginErrorElem = document.getElementById("loginError");
    if (loginErrorElem) loginErrorElem.style.display = "none";

    const email = (document.getElementById("loginEmail") || {}).value || "";
    const password = (document.getElementById("loginPassword") || {}).value || "";

    if (!email || !password) {
      showLoginError("Please enter both email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // safe Firestore write to indicate login (you already had this)
      await setDoc(doc(db, "test_login", user.uid), {
        email: user.email,
        uid: user.uid,
        loginAt: new Date().toISOString()
      });

      window.location.href = "index.html";

    } catch (error) {
      console.error("LOGIN ERROR:", error);
      const friendly = mapAuthError(error.code);
      showLoginError(friendly);
    }
  });
}

// =======================
// LOGOUT
// =======================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "index.html"; // or "login.html"
    } catch (err) {
      console.error("Sign out error:", err);
      alert("Could not log out: " + (err.message || err));
    }
  });
}


