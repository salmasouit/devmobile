import { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux"; // conservé
import { addTodo } from "../store/todosSlice"; // conservé
import { useTodoStore } from "../store/useTodoStore"; // Zustand
import AppBar from "./components/AppBar";

export default function TodoListScreen({ navigation }) {
  const todos = useSelector((state) => state.todos);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [todosLocal, setTodosLocal] = useState([]);
  const { todos: zTodos, addTodo: zAddTodo } = useTodoStore();

  useEffect(() => {
    const seed = [
      { id: 1, title: "Faire les courses" },
      { id: 2, title: "Sortir le chien" },
      { id: 3, title: "Coder une app RN" },
    ];

    const timer = setTimeout(() => {
      // Keep original timeout/loading behavior
      setTodosLocal(seed);

      // Seed Zustand (preferred source)
      // NOTE: We use Zustand now as requested; Redux seeding kept for reference below.
      if (!zTodos || zTodos.length === 0) {
        seed.forEach((t) => zAddTodo(t));
      }

      // Also populate the Redux store (kept for compatibility)
      // If you want to disable Redux seeding, comment the block below.
      // if (!todos || todos.length === 0) {
      //   seed.forEach((t) => dispatch(addTodo(t)));
      // }

      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 20 }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AppBar title="Mes tâches" />

      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 24, marginBottom: 10 }}>Mes tâches</Text>

        <FlatList
          // Prefer Zustand todos; fallback to Redux, else local
          data={(zTodos && zTodos.length > 0) ? zTodos : (todos && todos.length > 0) ? todos : todosLocal}
          keyExtractor={(i) => i.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Détails", {
                  id: item.id,
                  title: item.title,
                })
              }
            >
              <Text style={{ padding: 10, fontSize: 18 }}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}
