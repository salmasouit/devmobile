import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit,
  setDoc
} from "firebase/firestore";

// --- TASKS ---

export function listenToTodos(uid, successCallback, errorCallback) {
  const q = query(
    collection(db, "users", uid, "todos"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q,
    (snapshot) => {
      const tasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      successCallback(tasks);
    },
    (error) => {
      console.error("Firestore Listen Error:", error);
      if (errorCallback) errorCallback(error);
    }
  );
}

export async function fetchTodosFromFirestore(uid) {
  // Keeping this for reference or fallback
  const snap = await getDocs(collection(db, "users", uid, "todos"));
  const tasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return tasks.sort((a, b) => b.createdAt - a.createdAt);
}

export async function addTodoToFirestore(uid, todo) {
  // todo object: { title, description, dueDate, priority, status, reminder, category }
  return await addDoc(collection(db, "users", uid, "todos"), {
    title: todo.title || "Nouvelle tâche",
    description: todo.description || "",
    dueDate: todo.dueDate || null,
    priority: todo.priority || "medium",
    status: todo.status || "todo",
    reminder: todo.reminder || false,
    category: todo.category || "General", // New field
    createdAt: Date.now(),
  });
}

export async function updateTodoInFirestore(uid, taskId, data) {
  const ref = doc(db, "users", uid, "todos", taskId);
  await updateDoc(ref, data);
}

// --- USER SETTINGS ---

export function listenToUserSettings(uid, callback) {
  const ref = doc(db, "users", uid, "settings", "preferences");
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    } else {
      callback({
        defaultPriority: 'medium',
        notificationsEnabled: true,
        displayName: '',
      });
    }
  });
}

export async function updateUserSettings(uid, data) {
  const ref = doc(db, "users", uid, "settings", "preferences");
  await setDoc(ref, data, { merge: true });
}

export async function toggleTaskStatus(uid, taskId, currentStatus) {
  const newStatus = currentStatus === "done" ? "todo" : "done";
  await updateTodoInFirestore(uid, taskId, { status: newStatus });
}

export async function deleteTodoFromFirestore(uid, id) {
  await deleteDoc(doc(db, "users", uid, "todos", id));
}

// --- CATEGORIES ---

export const defaultCategories = [
  { id: 'work', name: 'Travail', color: '#3B82F6' }, // Blue
  { id: 'personal', name: 'Personnel', color: '#10B981' }, // Green
  { id: 'study', name: 'Études', color: '#8B5CF6' }, // Purple
  { id: 'health', name: 'Santé', color: '#EF4444' }, // Red
];

export async function initializeCategories(uid) {
  const catRef = collection(db, "users", uid, "categories");
  const snap = await getDocs(catRef);

  if (snap.empty) {
    // Add default categories if none exist
    const promises = defaultCategories.map(cat =>
      setDoc(doc(db, "users", uid, "categories", cat.id), cat)
    );
    await Promise.all(promises);
  }
}

export function listenToCategories(uid, callback) {
  const q = query(collection(db, "users", uid, "categories"));
  return onSnapshot(q, (snapshot) => {
    const cats = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    // We no longer initialize defaults automatically
    // if (cats.length === 0) { initializeCategories(uid); }
    callback(cats);
  });
}

// export const defaultCategories = [...]; // Removed
// export async function initializeCategories(uid) { ... } // Removed

export async function addCategoryToFirestore(uid, name, color) {
  return await addDoc(collection(db, "users", uid, "categories"), {
    name,
    color,
    createdAt: Date.now()
  });
}

export async function deleteCategoryFromFirestore(uid, id) {
  await deleteDoc(doc(db, "users", uid, "categories", id));
}

export async function updateCategoryInFirestore(uid, id, data) {
  const ref = doc(db, "users", uid, "categories", id);
  await updateDoc(ref, data);
}

// --- REMINDERS (Rappels) ---

export function listenToReminders(uid, callback) {
  const q = query(
    collection(db, "users", uid, "reminders"),
    orderBy("time", "asc")
  );
  return onSnapshot(q, (snapshot) => {
    const reminders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(reminders);
  });
}

export async function addReminderToFirestore(uid, reminder) {
  // reminder: { title, time (timestamp), notificationId }
  return await addDoc(collection(db, "users", uid, "reminders"), {
    ...reminder,
    createdAt: Date.now()
  });
}

export async function updateReminderInFirestore(uid, id, data) {
  const ref = doc(db, "users", uid, "reminders", id);
  await updateDoc(ref, data);
}

export async function deleteReminderFromFirestore(uid, id) {
  await deleteDoc(doc(db, "users", uid, "reminders", id));
}