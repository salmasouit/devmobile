import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { deleteTodoFromFirestore, toggleTaskStatus } from "../services/firestore";

export default function TodoDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useContext(AuthContext);
  const { task } = route.params;

  const handleDelete = async () => {
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
              navigation.goBack();
            } catch (e) {
              Alert.alert("Erreur", "Impossible de supprimer la tâche");
            }
          }
        }
      ]
    );
  };

  const priorityColors = { low: "#10B981", medium: "#F59E0B", high: "#EF4444" };
  const getPriorityColor = (p) => priorityColors[p] || "#9CA3AF";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => navigation.navigate("TaskForm", { task })} style={styles.actionButton}>
            <Ionicons name="create-outline" size={24} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{task.title}</Text>
          <View style={[styles.badge, { backgroundColor: getPriorityColor(task.priority) }]}>
            <Text style={styles.badgeText}>{task.priority?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.statusText}>
            Statut: <Text style={{ fontWeight: 'bold' }}>{task.status === 'done' ? 'Terminée' : 'À faire'}</Text>
          </Text>
        </View>

        {task.dueDate && (
          <View style={styles.dateSection}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.dateText}>
              Échéance: {new Date(task.dueDate.seconds * 1000).toLocaleString()}
            </Text>
          </View>
        )}

        {task.description ? (
          <View style={styles.descSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descText}>{task.description}</Text>
          </View>
        ) : null}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    marginLeft: 20,
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  statusSection: {
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    color: "#555",
  },
  dateSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
  },
  dateText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#444",
  },
  descSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  descText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
  },
});
