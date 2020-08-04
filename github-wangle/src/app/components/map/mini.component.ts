import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Waypoint } from 'src/app/models/Waypoint';

@Component({
    selector: 'app-mini',
    template: ` <app-map [waypoints]="data.waypoints" [mini]="true"></app-map> `,
})
export class MiniComponent {
    constructor(
        public dialogRef: MatDialogRef<MiniComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { waypoints: Waypoint[] }
    ) {}
}
