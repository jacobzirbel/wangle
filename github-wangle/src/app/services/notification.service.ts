import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Notif, NotificationType } from '../models/Notif';

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    private subject = new Subject<Notif>();
    private dx = 0;

    getObservable(): Observable<Notif> {
        return this.subject.asObservable();
    }

    info(title: string, message: string, timeout = 3000): void {
        this.subject.next(new Notif(this.dx++, NotificationType.info, title, message, timeout));
    }

    success(title: string, message: string, timeout = 3000): void {
        this.subject.next(new Notif(this.dx++, NotificationType.success, title, message, timeout));
    }

    warning(title: string, message: string, timeout = 3000): void {
        this.subject.next(new Notif(this.dx++, NotificationType.warning, title, message, timeout));
    }

    error(title: string, message: string, timeout = 0): void {
        this.subject.next(new Notif(this.dx++, NotificationType.error, title, message, timeout));
    }
}
