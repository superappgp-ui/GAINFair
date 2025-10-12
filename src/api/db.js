// src/api/db.js
import { db, storage } from "@/firebase";
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, setDoc, query, where, orderBy, limit
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const colRef = (name) => collection(db, name);
export const docRef = (name, id) => doc(db, name, id);

// --- Registrations ---
export async function createRegistration(payload) {
  const ref = await addDoc(colRef("registrations"), {
    ...payload,
    created_at: Date.now(),
    payment_status: payload.amount > 0 ? "pending" : "free",
  });
  return { id: ref.id };
}

export async function getRegistrationById(id) {
  const snap = await getDoc(docRef("registrations", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function listRegistrations({ byEmail } = {}) {
  let q = colRef("registrations");
  if (byEmail) q = query(q, where("email", "==", byEmail), orderBy("created_at", "desc"), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// --- Page Content ---
export async function getPageContent(key) {
  const snap = await getDoc(docRef("page_content", key));
  return snap.exists() ? snap.data() : null;
}
export async function setPageContent(key, data) {
  await setDoc(docRef("page_content", key), { ...data, updated_at: Date.now() }, { merge: true });
}

// --- Storage (uploads) ---
export async function uploadPublicFile(file, path) {
  const r = ref(storage, path);
  await uploadBytes(r, file);
  return await getDownloadURL(r);
}
