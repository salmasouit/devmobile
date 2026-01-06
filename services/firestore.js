import { db } from "./firebase"; 
import { 
 collection, 
 addDoc, 
 getDocs, 
 deleteDoc, 
 doc, 
} from "firebase/firestore"; 
 
export async function fetchTodosFromFirestore(uid) { 
 const snap = await getDocs(collection(db, "users", uid, "todos")); 
 return snap.docs.map(d => ({ id: d.id, ...d.data() })); 
} 
 
export async function addTodoToFirestore(uid, todo) { 
 await addDoc(collection(db, "users", uid, "todos"), { 
   title: todo.title, 
   completed: false, 
   createdAt: Date.now(), 
 }); 
} 
 
export async function deleteTodoFromFirestore(uid, id) { 
 await deleteDoc(doc(db, "users", uid, "todos", id)); 
}