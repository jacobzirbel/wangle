import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Waypoint } from 'src/app/models/Waypoint';
import { CompareComponent } from '../compare/compare.component';
import { WaypointList } from 'src/app/models/WaypointList';
import { PreparedWaypointLists } from 'src/app/models/PreparedWaypointLists';
import { StateService } from 'src/app/state.service';

@Component({
    selector: 'app-manage-mode',
    templateUrl: './manage-mode.component.html',
    styleUrls: ['./manage-mode.component.css'],
})
export class ManageModeComponent implements OnInit {
    constructor(
        private dialogRef: MatDialogRef<ManageModeComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            waypointsOnMap: Waypoint[];
            waypointLists: WaypointList[];
            currentList: WaypointList;
        },
        private matDialog: MatDialog,
        private stateService: StateService
    ) {}
    waypointsOnMap: Waypoint[];
    waypointLists: WaypointList[];
    currentList: WaypointList;
    ngOnInit(): void {
        this.waypointsOnMap = this.data.waypointsOnMap;
        this.waypointLists = this.data.waypointLists;
        this.currentList = this.data.currentList;
        return;
    }

    moveWaypoints(): void {
        const dialogRef = this.matDialog.open(CompareComponent, {
            data: {
                waypointLists: this.waypointLists,
                // selectedWaypointList is the list points are moved to
                selectedWaypointList: this.waypointLists[0],
                importWaypoints: this.waypointsOnMap,
                isImport: false,
            },
        });
        dialogRef.afterClosed().subscribe((result: PreparedWaypointLists) => {
            if (!result) {
                return;
            }
            const { onlyImport, toListId } = result;
            if (onlyImport?.length) {
                this.stateService.moveWaypoints(onlyImport, toListId).then(() => {
                    this.close();
                    return;
                });
            }
        });
    }
    copyWaypoints(): void {
        const dialogRef = this.matDialog.open(CompareComponent, {
            data: {
                waypointLists: this.waypointLists,
                // selectedWaypointList = list points are moved to
                selectedWaypointList: this.waypointLists[0],
                importWaypoints: this.waypointsOnMap,
                isImport: false,
            },
        });

        dialogRef.afterClosed().subscribe((result: PreparedWaypointLists) => {
            const { onlyImport, toListId } = result;
            if (onlyImport?.length) {
                this.stateService.copyWaypoints(onlyImport, toListId).then(() => {
                    this.close();
                    return;
                });
            }
        });
    }
    deleteWaypoints(): void {
        this.stateService
            .deleteArrayOfWaypoints(this.waypointsOnMap, this.currentList.waypointListId)
            .then(() => {
                this.close();
                return;
            });
    }

    close(): void {
        this.dialogRef.close();
    }
}
