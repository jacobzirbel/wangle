import { Injectable } from '@angular/core';
import { Task } from '../models/Task';
import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root',
})
export class WaitService {
    tasks: Task[] = [];
    showLoading = false;
    taskId = 1;
    constructor(private notificationService: NotificationService) {}
    startTask(important = false): number {
        this.tasks.push(new Task(this.taskId, important));
        this.taskId++;
        this.showLoading = this.someImportant();
        return this.taskId;
    }
    endTask(id: number): void {
        const index = this.tasks.map((e) => e.id).indexOf(id);
        this.tasks.splice(index, 1);
        this.showLoading = this.someImportant();
    }
    someImportant(): boolean {
        return (
            this.tasks.some((e) => e.important) ||
            this.tasks.some((e) => new Date().getTime() - e.start.getTime() > 1000)
        );
    }
}
