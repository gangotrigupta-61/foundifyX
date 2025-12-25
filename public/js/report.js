import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./firebase.js";

// normalize helper
const normalize = (v) => v?.trim().toLowerCase();

// 🔹 tokenize text into words
function tokenize(text = "") {
  return text.toLowerCase().split(/\s+/);
}

// 🔹 calculate similarity percentage
function similarityPercent(text1 = "", text2 = "") {
  const a = tokenize(text1);
  const b = tokenize(text2);

  if (!a.length || !b.length) return 0;

  const matches = a.filter(word => b.includes(word));
  return (matches.length / Math.max(a.length, b.length)) * 100;
}

export async function findMatchingItem(newItem) {
  const oppositeStatus = newItem.status === "lost" ? "found" : "lost";

  // 🔥 BROAD QUERY (no location filter)
  const q = query(
    collection(db, "items"),
    where("status", "==", oppositeStatus),
    where("itemType", "==", normalize(newItem.itemType))
  );

  const snapshot = await getDocs(q);
  const matches = [];

  const newItemDate = new Date(newItem.date);

  snapshot.forEach(doc => {
    const item = doc.data();
    const existingDate = new Date(item.date);

    // ✅ RULE 1: Lost date must be BEFORE Found date
    if (newItem.status === "found" && existingDate > newItemDate) return;
    if (newItem.status === "lost" && existingDate < newItemDate) return;

    // ✅ RULE 2: Location ≥ 20%
    const locationMatch = similarityPercent(
      newItem.location,
      item.location
    );
    if (locationMatch < 20) return;

    // ✅ RULE 3: Description ≥ 20%
    const descMatch = similarityPercent(
      newItem.description || "",
      item.description || ""
    );
    if (descMatch < 20) return;

    // ✅ RULE 4: Item Name ≥ 20%
    const nameMatch = similarityPercent(
      newItem.itemName || "",
      item.itemName || ""
    );
    if (nameMatch < 20) return;

    // ✅ FINAL MATCH
    matches.push({
      id: doc.id,
      ...item,
      locationMatch: Math.round(locationMatch),
      descriptionMatch: Math.round(descMatch),
      nameMatch: Math.round(nameMatch)
    });
  });

  return matches;
}
