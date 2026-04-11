import * as signalR from '@microsoft/signalr';
import { useToastStore } from '../store/useToastStore';

class NotificationService {
    private connection: signalR.HubConnection | null = null;

    public async start() {
        if (this.connection) return;

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('/hubs/reveal')
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
