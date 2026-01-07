import React, { useEffect, useState, useContext, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Platform, Alert } from "react-native";
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { listenToTodos, toggleTaskStatus, deleteTodoFromFirestore } from "../services/firestore";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";

export default function TodoListScreen() {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const route = useRoute();

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all', 'todo', 'done'

  // Reset filter if we coming back from saving a task
  useEffect(() => {
    if (route.params?.lastUpdate) {
      setFilter("all");
      // Clear params to avoid unwanted resets later
      navigation.setParams({ lastUpdate: null });
    }
  }, [route.params?.lastUpdate]);

  useEffect(() => {
    if (!user) return;

    // Safety timeout
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("Délai d'attente dépassé. Vérifiez votre connexion.");
      }
    }, 5000);

    const unsubscribe = listenToTodos(
      user.uid,
      (data) => {
        clearTimeout(timeout);
        setTodos(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        clearTimeout(timeout);
        console.error("List Error:", err);
        setLoading(false);
        setError("Impossible de charger les tâches. Mode hors-ligne ?");
      }
    );

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [user]);

  const handleToggleStatus = async (task) => {
    // Optimistic update
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    const updatedTodos = todos.map(t =>
      t.id === task.id ? { ...t, status: newStatus } : t
    );
    setTodos(updatedTodos);

    try {
      await toggleTaskStatus(user.uid, task.id, task.status);
    } catch (error) {
      console.error("Failed to toggle status", error);
    }
  };

  const confirmDelete = (task) => {
    if (Platform.OS === 'web') {
      // Window confirm for web
      if (confirm("Voulez-vous vraiment supprimer cette tâche ?")) {
        deleteTodoFromFirestore(user.uid, task.id);
      }
    } else {
      Alert.alert(
        "Supprimer",
        "Voulez-vous vraiment supprimer cette tâche ?",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteTodoFromFirestore(user.uid, task.id);
              } catch (e) {
                console.error(e);
              }
            }
          }
        ]
      );
    }
  };

  const filteredTodos = todos.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'done') return t.status === 'done';
    if (filter === 'todo') return t.status !== 'done';
    return true;
  });

  const getPriorityColor = (p) => {
    switch (p) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#9CA3AF';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("TodoDetails", { task: item })}
    >
      <TouchableOpacity
        style={styles.checkCircle}
        onPress={() => handleToggleStatus(item)}
      >
        {item.status === 'done' && <Ionicons name="checkmark" size={18} color="#fff" />}
        {item.status !== 'done' && <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />}
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, item.status === 'done' && styles.strikethrough]}>
          {item.title}
        </Text>
        <Text style={styles.date}>
          {item.dueDate ? new Date(item.dueDate.seconds * 1000).toLocaleDateString() : 'Pas de date'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.navigate("TaskForm", { task: item })} style={styles.actionBtn}>
          <Ionicons name="create-outline" size={20} color="#2563EB" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.actionBtn}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Tâches</Text>
        <TouchableOpacity onPress={() => navigation.navigate("TaskForm")}>
          <Ionicons name="add-circle" size={32} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        {['all', 'todo', 'done'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.activeChip]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>
              {f === 'all' ? 'Toutes' : f === 'todo' ? 'À faire' : 'Terminées'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : error ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Ionicons name="cloud-offline-outline" size={48} color="#EF4444" />
          <Text style={{ color: "#EF4444", textAlign: "center", marginTop: 10 }}>{error}</Text>
          <TouchableOpacity onPress={() => { setLoading(true); setError(null); }} style={{ marginTop: 10 }}>
            <Text style={{ color: "#2563EB" }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredTodos}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucune tâche trouvée</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
  },
  filters: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: "#2563EB",
  },
  filterText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "600",
  },
  activeFilterText: {
    color: "#fff",
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#F9FAFB",
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: "#9CA3AF",
  },
  date: {
    fontSize: 12,
    color: "#6B7280",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#6B7280",
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    padding: 8,
    marginLeft: 4
  }
});
