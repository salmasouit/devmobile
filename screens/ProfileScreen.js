import React, { useEffect, useState, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { listenToTodos } from "../services/firestore";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [stats, setStats] = useState({ total: 0, done: 0, todo: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = listenToTodos(user.uid, (tasks) => {
      const total = tasks.length;
      const done = tasks.filter(t => t.status === 'done').length;
      const todo = total - done;

      setStats({ total, done, todo });
      // Get 3 most recent tasks
      setRecentActivity(tasks.slice(0, 3));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const holidays = {
    '01-01': 'le Jour de l\'An',
    '05-01': 'la Fête du Travail',
    '05-08': 'la Victoire 1945',
    '07-14': 'la Fête Nationale',
    '08-15': 'l\'Assomption',
    '11-01': 'la Toussaint',
    '11-11': 'l\'Armistice 1918',
    '12-25': 'Noël',
  };

  const currentHoliday = (() => {
    const today = new Date();
    const key = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return holidays[key];
  })();

  const getSuggestionText = (todoCount) => {
    if (currentHoliday) {
      return `C'est ${currentHoliday} ! Profitez de ce jour férié pour vous détendre ou faire une sortie en famille. 🎈`;
    }

    const day = new Date().getDay();
    const isWeekend = day === 0 || day === 6;

    if (todoCount > 5) return "Ouh là, beaucoup de tâches ! Priorisez les plus importantes et n'oubliez pas de faire des pauses. ☕";

    if (isWeekend) {
      if (todoCount === 0) return "C'est le week-end et tout est fait ! Pourquoi ne pas aller marcher, cuisiner un bon plat 🥘 ou aller au cinéma ? 🎬";
      return "Encore quelques petites choses à faire, mais gardez du temps pour vous reposer ! ✨";
    } else {
      if (todoCount === 0) return "Journée calme ? C'est le moment idéal pour trier vos mails, lire cet article mis de côté ou apprendre un nouveau mot ! 📚";
      return "Une journée de travail classique. Restez concentré et vous aurez fini plus tôt ! 💪";
    }
  };

  const StatCard = ({ label, value, color, icon }) => (
    <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color: color }]}>{value}</Text>
      </View>
      <Ionicons name={icon} size={32} color={color} style={{ opacity: 0.8 }} />
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Profile Section */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Ionicons name="person-circle" size={50} color={theme.primary} />
          <View style={{ marginLeft: 10 }}>
            <Text style={[styles.greeting, { color: theme.text }]}>Bonjour,</Text>
            <Text style={[styles.userEmail, { color: theme.text }]}>{user.email?.split('@')[0]}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
          <Ionicons name={theme.name === 'dark' ? "moon" : "sunny"} size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      <Text style={styles.sectionTitle}>Ma Progression</Text>
      <View style={styles.statsContainer}>
        <StatCard label="Tâches" value={stats.total} color="#3B82F6" icon="list" />
        <StatCard label="Terminées" value={stats.done} color="#10B981" icon="checkmark-circle" />
        <StatCard label="En cours" value={stats.todo} color="#F59E0B" icon="time" />
      </View>

      {/* Smart Suggestions Section */}
      <Text style={styles.sectionTitle}>Suggestions du jour</Text>
      <View style={styles.suggestionCard}>
        <Ionicons name="bulb-outline" size={24} color="#8B5CF6" />
        <View style={{ marginLeft: 15, flex: 1 }}>
          <Text style={styles.suggTitle}>
            {currentHoliday ? "Jour férié ! 🎉" : (new Date().getDay() === 0 || new Date().getDay() === 6 ? "C'est le week-end ! 🌴" : "Mode semaine 🚀")}
          </Text>
          <Text style={styles.suggText}>
            {getSuggestionText(stats.todo)}
          </Text>
        </View>
      </View>

      {/* Settings / Actions */}
      <Text style={styles.sectionTitle}>Paramètres</Text>
      <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>

      {/* Debug Info */}
      <View style={{ marginTop: 30, padding: 10, backgroundColor: '#eee', borderRadius: 8 }}>
        <Text style={{ fontSize: 10, color: '#666' }}>DEBUG INFO</Text>
        <Text style={{ fontSize: 10, color: '#666' }}>UID: {user.uid}</Text>
        <TouchableOpacity
          onPress={async () => {
            try {
              alert("Test de connexion...");
              // Try to fetch users collection just to check connectivity
              // We can't fetch 'users' root usually, but we can fetch our own todo list
              const { getDocs, collection } = require("firebase/firestore");
              const { db } = require("../services/firebase");
              await getDocs(collection(db, "users", user.uid, "todos"));
              alert("Connexion OK ! La base de données est accessible.");
            } catch (e) {
              alert("Erreur Connexion: " + e.message);
            }
          }}
          style={{ marginTop: 5, padding: 5, backgroundColor: '#ddd', alignSelf: 'flex-start', borderRadius: 4 }}
        >
          <Text style={{ fontSize: 10 }}>Tester la connexion BDD</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    opacity: 0.7,
  },
  userEmail: {
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 100,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  suggestionCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  suggTitle: {
    color: '#6D28D9',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  suggText: {
    color: '#5B21B6',
    fontSize: 14,
    lineHeight: 20,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  }
});
