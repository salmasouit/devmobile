import { View, Text, Button } from "react-native";
import { useDispatch } from "react-redux"; // conservé
import { removeTodo } from "../store/todosSlice"; // conservé (appel commenté ci-dessous)
import { useTodoStore } from "../store/useTodoStore"; // Zustand

export default function TodoDetailsScreen({ route, navigation }) {
  const { id, title } = route.params;
  const dispatch = useDispatch();
  const { removeTodo: zRemoveTodo } = useTodoStore();

  const handleDelete = () => {
    // Utilise Zustand comme source principale
    zRemoveTodo(id);

    // Appel Redux conservé pour référence; décommentez si vous souhaitez supprimer aussi côté Redux
    // dispatch(removeTodo(id));

    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 30, marginBottom: 8 }}>{title}</Text>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>ID : {id}</Text>
      <Button title="Supprimer cette tâche" color="red" onPress={handleDelete} />
    </View>
  );
}
