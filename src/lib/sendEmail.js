// src/lib/sendEmail.js
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

/**
 * Queue an email for the Firebase "Trigger Email from Firestore" extension.
 * Always rely on the extension's Default FROM to avoid spoofing issues.
 */
export async function sendEmail({ to, subject, text, html, replyTo }) {
  const payload = {
    to: Array.isArray(to) ? to : [to],
    message: {
      subject,
      ...(text ? { text } : {}),
      ...(html ? { html } : {}),
    },
    ...(replyTo ? { replyTo } : {}),
    createdAt: serverTimestamp(),
  };
  return addDoc(collection(db, "mail"), payload);
}
