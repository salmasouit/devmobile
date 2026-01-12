import React, { useEffect, useState, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { listenToTodos, listenToUserSettings } from "../services/firestore";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [stats, setStats] = useState({ total: 0, done: 0, todo: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ displayName: '' });

  useEffect(() => {
    if (!user) return;
    const unsubTasks = listenToTodos(user.uid, (tasks) => {
      const total = tasks.length;
      const done = tasks.filter(t => t.status === 'done').length;
      const todo = total - done;

      setStats({ total, done, todo });
      // Get 3 most recent tasks
      setRecentActivity(tasks.slice(0, 3));
      setLoading(false);
    });

    const unsubSettings = listenToUserSettings(user.uid, (data) => {
      setSettings(data);
    });

    return () => {
      unsubTasks();
      unsubSettings();
    };
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
    const userHobbies = settings.activities || [];
    const hobbyNames = userHobbies.map(h => h.name);

    if (currentHoliday) {
      return `C'est ${currentHoliday} ! Profitez de ce jour férié pour vous détendre ou faire une sortie en famille. 🎈`;
    }

    const day = new Date().getDay();
    const isWeekend = day === 0 || day === 6;

    if (todoCount > 5) return "Ouh là, beaucoup de tâches ! Priorisez les plus importantes et n'oubliez pas de faire des pauses. ☕";

    if (todoCount === 0) {
      if (isWeekend) {
        const extra = hobbyNames.length > 0 ? ` Pourquoi ne pas faire un peu de ${hobbyNames[Math.floor(Math.random() * hobbyNames.length)]} ? 🎾` : " Pourquoi ne pas aller marcher ou voir un film ? 🎬";
        return "C'est le week-end et tout est fait ! Temps libre total." + extra;
      } else {
        return "Pas de tâches ? Profitez-en pour lire 📚, méditer 🧘 ou avancer sur un projet perso ! ✨";
      }
    }

    if (isWeekend) {
      return "Encore quelques petites choses à faire, mais gardez du temps pour vous reposer ! ✨";
    } else {
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
            <Text style={[styles.userEmail, { color: theme.text }]}>
              {user.email?.split('@')[0]}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
            <Ionicons name={theme.name === 'dark' ? "moon" : "sunny"} size={22} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")} style={styles.iconBtn}>
            <Ionicons name="settings-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
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

          <TouchableOpacity
            onPress={() => navigation.navigate("Suggestions")}
            style={styles.consultBtn}
          >
            <Text style={styles.consultBtnText}>
              Découvrir plus d'idées d'activités
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#8B5CF6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Activities Table Section */}
      <Text style={styles.sectionTitle}>Mes Loisirs & Activités</Text>
      <View style={[styles.tableCard, { backgroundColor: theme.name === 'dark' ? '#1f1f1f' : '#fff' }]}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Activité</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Type</Text>
        </View>

        {/* Table Rows */}
        {settings?.activities?.length > 0 ? (
          settings.activities.map((act) => (
            <View key={act.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1, color: theme.text, fontWeight: 'bold' }]}>{act.name}</Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'right', color: theme.text }]}>{act.type}</Text>
            </View>
          ))
        ) : (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#999', fontSize: 13 }}>Aucune activité enregistrée</Text>
          </View>
        )}
      </View>

      {/* Settings / Actions */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Paramètres</Text>

      <TouchableOpacity
        onPress={toggleTheme}
        style={[styles.settingBtn, { backgroundColor: theme.name === 'dark' ? '#333' : '#F3F4F6' }]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons
            name={theme.name === 'dark' ? "moon" : "sunny"}
            size={20}
            color={theme.name === 'dark' ? "#FBBF24" : "#F59E0B"}
          />
          <Text style={[styles.settingText, { color: theme.text }]}>
            Mode {theme.name === 'dark' ? 'Sombre' : 'Clair'}
          </Text>
        </View>
        <Ionicons
          name={theme.name === 'dark' ? "toggle" : "toggle-outline"}
          size={32}
          color={theme.name === 'dark' ? "#10B981" : "#D1D5DB"}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

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
  },
  settingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  settingText: {
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  tableCard: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 5,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  tableCell: {
    fontSize: 14,
  },
  consultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 5,
  },
  consultBtnText: {
    color: '#8B5CF6',
    fontWeight: 'bold',
    fontSize: 13,
    marginRight: 5,
  },
  ideasBox: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    marginTop: -10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  ideasTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 10,
  },
  ideasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ideaChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ideaChipText: {
    fontSize: 12,
    color: '#4B5563',
  },
});
