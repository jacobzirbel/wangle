import { Component, OnInit, Inject } from '@angular/core';
import { PointsComponent } from './points.component';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MiniComponent } from '../map/mini.component';
import { PointsDismissAction } from 'PointsDismissAction';
import { Waypoint } from 'src/app/models/Waypoint';
import { WaypointList } from 'src/app/models/WaypointList';
import { Permits } from 'src/app/models/Permits';

@Component({
    selector: 'app-points-sheet',
    template: ` <app-points
        (Dismiss)="dismiss($event)"
        (Hover)="hover($event)"
        [selectedWaypointList]="data.list"
        [permits]="data.permits"
        [cols]="4"
    ></app-points>`,
    styleUrls: ['./dialogs.css'],
})
export class PointsSheetComponent implements OnInit {
    constructor(
        private matDialog: MatDialog,
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: { list: WaypointList; permits: Permits },
        private _bottomSheetRef: MatBottomSheetRef<PointsComponent>
    ) {}

    ngOnInit(): void {
        this._bottomSheetRef.afterDismissed().subscribe(() => {
            this.closeMiniMapDialog();
        });
    }

    dismiss(e: [PointsDismissAction, Waypoint]): void {
        this._bottomSheetRef.dismiss(e);
    }
    miniMapDialogRef;
    hover(e: [number, number, Waypoint]): void {
        this.closeMiniMapDialog();
        this.miniMapDialogRef = this.matDialog.open(MiniComponent, {
            height: '300px',
            width: '300px',
            hasBackdrop: false,
            position: { top: e[0] + 10 + 'px', left: e[1] + 10 + 'px' },
            panelClass: 'dialog-no-margin',
            data: {
                waypoints: [{ ...e[2] }],
            },
        });
    }
    closeMiniMapDialog(): void {
        if (this.miniMapDialogRef) this.miniMapDialogRef.close();
    }
}
