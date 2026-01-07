import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
    }
}

export async function scheduleTaskReminder(task) {
    if (!task.dueDate || !task.reminder) return;

    const triggerDate = new Date(task.dueDate.seconds ? task.dueDate.seconds * 1000 : task.dueDate);
    // If date is perfectly equal or in past, it might fire immediately or not at all.
    // We usually want it slightly before? Or at the exact time.
    // For now: exact time.

    if (triggerDate.getTime() < Date.now()) return; // Don't schedule for past

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Rappel de tâche",
            body: `C'est l'heure pour : ${task.title}`,
            data: { taskId: task.id },
            sound: true,
        },
        trigger: triggerDate,
    });
}

export async function cancelTaskReminder(taskId) {
    // To cancel specific ID, we'd need to store the notification ID.
    // For simplicity, we can modify this later. 
    // currently scheduleNotificationAsync returns an ID.
    // Ideally, we store this ID in Firestore task document.
}
