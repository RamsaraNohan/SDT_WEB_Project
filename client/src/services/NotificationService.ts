import * as signalR from '@microsoft/signalr';
import { useToastStore } from '../store/useToastStore';

class NotificationService {
    private connection: signalR.HubConnection | null = null;

    public async start() {
        if (this.connection) return;

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('https://blindmatch-ekf5hng6echxdbar.southeastasia-01.azurewebsites.net/hubs/reveal', {
                accessTokenFactory: () => {
                    const authData = localStorage.getItem('blindmatch-auth');
                    if (authData) {
                        try {
                            const parsed = JSON.parse(authData);
                            return parsed.state?.token || "";
                        } catch (e) {
                            console.error("Error parsing auth token for SignalR:", e);
                        }
                    }
                    return "";
                }
            })
            .withAutomaticReconnect()
            .build();

        this.connection.on('ReceiveRevealNotification', (message: string) => {
            useToastStore.getState().showToast(message, 'success');
        });

        this.connection.on('ReceiveMatchNotification', (message: string) => {
            useToastStore.getState().showToast(message, 'info');
        });

        try {
            await this.connection.start();
            console.log("SignalR Connected.");
        } catch (err) {
            console.error("SignalR Connection Error: ", err);
        }
    }

    public stop() {
        this.connection?.stop();
        this.connection = null;
    }
}

export const notificationService = new NotificationService();
