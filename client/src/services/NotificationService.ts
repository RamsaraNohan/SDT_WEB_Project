import * as signalR from '@microsoft/signalr';
import { useToastStore } from '../store/useToastStore';
import { useAuthStore } from '../store/useAuthStore';

class NotificationService {
    private connection: signalR.HubConnection | null = null;
    private isStarting = false;

    public async start() {
        // Guard: don't start if no token (user not logged in yet)
        const token = useAuthStore.getState().token;
        if (!token) {
            // Silently skip — will be called again after login from the dashboard
            return;
        }

        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            return; // Already connected
        }

        if (this.isStarting) return;
        this.isStarting = true;

        const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5259' : 'https://blindmatch-ekf5hng6echxdbar.southeastasia-01.azurewebsites.net';
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/hubs/reveal`, {

                accessTokenFactory: () => {
                    return useAuthStore.getState().token || '';
                }
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000]) // Progressive retry
            .configureLogging(signalR.LogLevel.Warning) // Reduce noise
            .build();

        this.connection.on('ReceiveRevealNotification', (message: string) => {
            useToastStore.getState().showToast(message, 'success');
        });

        this.connection.on('ReceiveMatchNotification', (message: string) => {
            useToastStore.getState().showToast(message, 'info');
        });

        try {
            await this.connection.start();
            console.log('✅ SignalR Connected — Real-time notifications active.');
        } catch (err) {
            if (err instanceof Error && (err.message.includes('401') || err.message.includes('Unauthorized'))) {
                console.info('SignalR: Token unavailable, skipping connection until login.');
            } else {
                console.error('SignalR Connection Error:', err);
            }
        } finally {
            this.isStarting = false;
        }
    }

    public stop() {
        if (this.connection) {
            this.connection.stop();
            this.connection = null;
        }
    }
}

export const notificationService = new NotificationService();
