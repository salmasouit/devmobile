import * as ExpoNotifications from 'expo-notifications';
import { Platform } from 'react-native';

ExpoNotifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function getNotificationPermissionStatus() {
    if (Platform.OS === 'web') return 'granted';
    const { status } = await ExpoNotifications.getPermissionsAsync();
    return status;
}

export async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'web') {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            console.log('Web Notification permission:', permission);
        }
        return;
    }

    if (Platform.OS === 'android') {
        await ExpoNotifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: ExpoNotifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    const { status: existingStatus } = await ExpoNotifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await ExpoNotifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
    }
}

export async function scheduleNotification(title, body, date) {
    const triggerDate = new Date(date);
    const delay = triggerDate.getTime() - Date.now();

    if (delay < 0) return null;

    if (Platform.OS === 'web') {
        // Web Fallback: Using setTimeout for the current session
        if ('Notification' in window && Notification.permission === 'granted') {
            const timeoutId = setTimeout(() => {
                new Notification(title, { body });
            }, delay);
            return timeoutId.toString();
        }
        return null;
    }

    const seconds = Math.floor(delay / 1000);
    if (seconds <= 0) return null;

    // SDK 52 trigger can be an object with seconds and repeats
    const trigger = {
        seconds: seconds,
        repeats: false,
    };

    try {
        return await ExpoNotifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: body,
                sound: true,
                android: {
                    channelId: 'default',
                },
            },
            trigger: trigger,
        });
    } catch (error) {
        console.error("Last resort notification failure:", error);
        throw error; // Rethrow to let the UI catch it
    }
}

export async function cancelNotification(id) {
    if (!id) return;

    if (Platform.OS === 'web') {
        clearTimeout(parseInt(id));
        return;
    }

    await ExpoNotifications.cancelScheduledNotificationAsync(id);
}

export async function scheduleTaskReminder(task) {
    if (!task.dueDate || !task.reminder) return;
    const triggerDate = new Date(task.dueDate.seconds ? task.dueDate.seconds * 1000 : task.dueDate);
    return await scheduleNotification("Rappel de tâche", `C'est l'heure pour : ${task.title}`, triggerDate);
}
