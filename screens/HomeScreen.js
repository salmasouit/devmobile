import { 
 View, 
 Text, 
 FlatList, 
 TouchableOpacity, 
 Modal, 
 TextInput, 
} from "react-native"; 
import { useContext, useEffect, useState } from "react"; 
import { ThemeContext } from "../context/ThemeContext"; 
import { AuthContext } from "../context/AuthContext"; 
import { collection, addDoc, getDocs } from "firebase/firestore"; 
import { db } from "../services/firebase"; 
import { SafeAreaView } from "react-native-safe-area-context"; 
 
export default function HomeScreen() { 
 const { theme, toggleTheme } = useContext(ThemeContext); 
 const { user, logout } = useContext(AuthContext); 
 
 const [todos, setTodos] = useState([]); 
 const [modalVisible, setModalVisible] = useState(false); 
 const [newTodo, setNewTodo] = useState(""); 
 
 const loadTodos = async () => { 
   const snap = await getDocs(collection(db, "todos")); 
   setTodos(snap.docs.map(d => ({ id: d.id, ...d.data() }))); 
 }; 
 
 useEffect(() => { 
   loadTodos(); 
 }, []); 
 
 const addTodo = async () => { 
   if (!newTodo.trim()) return; 
 
   await addDoc(collection(db, "todos"), { 
     title: newTodo, 
     userId: user.uid, 
     createdAt: new Date(), 
   }); 
 
   setNewTodo(""); 
   setModalVisible(false); 
   loadTodos(); 
 }; 
 
 return ( 
   <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}> 
     <View style={{ padding: 16 }}> 
       <Text style={{ color: theme.text, fontSize: 26, fontWeight: "bold" }}> 
         Mes tâches 
       </Text> 
 
       <TouchableOpacity onPress={toggleTheme}> 
         <Text style={{ color: theme.primary }}>Changer thème</Text> 
       </TouchableOpacity> 
 
       <TouchableOpacity onPress={logout}> 
         <Text style={{ color: "red" }}>Déconnexion</Text> 
       </TouchableOpacity> 
 
       <TouchableOpacity 
         style={{ 
           marginVertical: 15, 
           backgroundColor: theme.primary, 
           padding: 12, 
           borderRadius: 8, 
         }} 
         onPress={() => setModalVisible(true)} 
       > 
         <Text style={{ color: "#fff", textAlign: "center" }}> 
           + Ajouter une tâche 
         </Text> 
       </TouchableOpacity> 
 
       <FlatList 
         data={todos} 
         keyExtractor={item => item.id} 
         renderItem={({ item }) => ( 
           <View 
             style={{ 
               backgroundColor: theme.card, 
               padding: 12, 
               borderRadius: 8, 
               marginBottom: 10, 
             }} 
           > 
             <Text style={{ color: theme.text }}>{item.title}</Text> 
           </View> 
         )} 
       /> 
     </View> 
 
     {/* MODAL FORM */} 
     <Modal visible={modalVisible} animationType="slide" transparent> 
       <View 
         style={{ 
           flex: 1, 
           backgroundColor: "rgba(0,0,0,0.5)", 
           justifyContent: "center", 
           padding: 20, 
         }} 
       > 
         <View 
           style={{ 
             backgroundColor: theme.background, 
             padding: 20, 
             borderRadius: 10, 
           }} 
         > 
           <Text style={{ color: theme.text, fontSize: 18 }}> 
             Nouvelle tâche 
           </Text> 
 
           <TextInput 
             placeholder="Titre de la tâche" 
             value={newTodo} 
             onChangeText={setNewTodo} 
             style={{ 
               borderWidth: 1, 
               borderColor: "#ccc", 
               marginVertical: 10, 
               padding: 10, 
               borderRadius: 6, 
               color: theme.text, 
             }} 
           /> 
 
           <TouchableOpacity 
             onPress={addTodo} 
             style={{ 
               backgroundColor: theme.primary, 
               padding: 10, 
               borderRadius: 6, 
             }} 
           > 
             <Text style={{ color: "#fff", textAlign: "center" }}> 
               Ajouter 
             </Text> 
           </TouchableOpacity> 
 
           <TouchableOpacity onPress={() => setModalVisible(false)}> 
             <Text style={{ textAlign: "center", marginTop: 10 }}> 
               Annuler 
             </Text> 
           </TouchableOpacity> 
         </View> 
       </View> 
     </Modal> 
   </SafeAreaView> 
 ); 
}