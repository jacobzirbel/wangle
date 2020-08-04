import { Component, Inject } from '@angular/core';
import { PointsComponent } from './points.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WaypointList } from 'src/app/models/WaypointList';
import { Permits } from 'src/app/models/Permits';
import { Waypoint } from 'src/app/models/Waypoint';
import { PointsDismissAction } from 'PointsDismissAction';

@Component({
    selector: 'app-points-drag',
    template: `
        <h1 mat-dialog-title cdkDrag cdkDragRootElement=".cdk-overlay-pane" cdkDragHandle></h1>
        <app-points
            (Dismiss)="dismiss($event)"
            [selectedWaypointList]="data.list"
            [permits]="data.permits"
            [cols]="1"
        ></app-points>
    `,
    styleUrls: ['./dialogs.css'],
})
export class PointsDragComponent {
    constructor(
        private dialogRef: MatDialogRef<PointsComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            list: WaypointList;
            permits: Permits;
            center: (wp: Waypoint) => void;
        }
    ) {}

    dismiss(e: [PointsDismissAction, Waypoint]): void {
        if (e[0] === 'center') {
            this.data.center(e[1]);
            return;
        }
        this.dialogRef.close(e);
    }
}
