import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import TasksTabs from "./TasksTabs";
import ProfileScreen from "../ProfileScreen";
import HomeScreen from "../HomeScreen";

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  // Wrappers to show bottom tabs and control which tab opens first
  const TabsAccueil = () => <TasksTabs initialRouteName="Accueil" />;
  const TabsListe = () => <TasksTabs initialRouteName="Liste" />;
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Accueil" component={TabsAccueil} />
      <Drawer.Screen name="Tâches" component={TabsListe} />
      <Drawer.Screen name="Profil" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}
