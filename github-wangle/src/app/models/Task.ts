export class Task {
    constructor(id: number, important: boolean) {
        this.start = new Date();
        this.id = id;
        this.important = important;
    }
    name: string;
    id: number;
    start: Date;
    important: boolean;
}
