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
    if (Platform.OS === 'web') return;

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
        console.log('Failed to get push token for push notification!');
        return;
    }
}

export async function scheduleNotification(title, body, date) {
    if (Platform.OS === 'web') return null;

    const triggerDate = new Date(date);
    if (triggerDate.getTime() < Date.now()) return null;

    return await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: body,
            sound: true,
        },
        trigger: triggerDate,
    });
}

export async function cancelNotification(id) {
    if (Platform.OS === 'web' || !id) return;
    await Notifications.cancelScheduledNotificationAsync(id);
}

export async function scheduleTaskReminder(task) {
    if (!task.dueDate || !task.reminder) return;
    const triggerDate = new Date(task.dueDate.seconds ? task.dueDate.seconds * 1000 : task.dueDate);
    return await scheduleNotification("Rappel de tâche", `C'est l'heure pour : ${task.title}`, triggerDate);
}
