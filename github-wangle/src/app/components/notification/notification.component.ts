import { Component, OnInit } from '@angular/core';
import { Notif } from 'src/app/models/Notif';
import { NotificationService } from 'src/app/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements OnInit {
    notifications: Notif[] = [];
    private subscription: Subscription;

    constructor(private notificationService: NotificationService) {}
    private addNotification(notification: Notif) {
        this.notifications.push(notification);

        if (notification.timeout !== 0) {
            setTimeout(() => this.close(notification), notification.timeout);
        }
    }
    ngOnInit(): void {
        this.subscription = this.notificationService
            .getObservable()
            .subscribe((notification) => this.addNotification(notification));
    }
    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
    close(notification: Notif): void {
        this.notifications = this.notifications.filter((notif) => notif.id !== notification.id);
    }
    className(notification: Notif): string {
        return ['success', 'warning', 'error', 'info'][notification.type];
    }
}
