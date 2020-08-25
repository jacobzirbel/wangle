import { Component, OnInit, Inject } from '@angular/core';
import { Waypoint, CompareWaypoint } from '../../models/';
import { WaypointRepoService } from '../../services/WaypointRepoService';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { PreparedWaypointLists } from 'src/app/models/PreparedWaypointLists';
import { WaypointList } from 'src/app/models/WaypointList';
import { EditWaypointListComponent } from '../edit/edit-waypoint-list.component';
import { StateService } from 'src/app/state.service';
import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
import { ConvertDialogComponent } from 'src/app/components/convert-dialog/convert-dialog.component';
@Component({
    selector: 'app-compare',
    templateUrl: './compare.component.html',
    styleUrls: ['./compare.component.css'],
})
export class CompareComponent implements OnInit {
    waypointLists: WaypointList[];
    selectedWaypointList: WaypointList;
    importWaypoints: Waypoint[];
    preparedWaypointsLists: PreparedWaypointLists;
    doingImport: boolean;
    compareWaypoints: CompareWaypoint[];
    partials: CompareWaypoint[];
    exacts: CompareWaypoint[];
    news: CompareWaypoint[];
    invalids: CompareWaypoint[];
    okSymbols = true;
    constructor(
        private matDialog: MatDialog,
        private waypointService: WaypointRepoService,
        public dialogRef: MatDialogRef<CompareComponent>,
        private stateService: StateService,

        @Inject(MAT_DIALOG_DATA)
        public data: {
            waypointLists: WaypointList[];
            selectedWaypointList: WaypointList;
            importWaypoints: Waypoint[];
            isImport: boolean;
        }
    ) {}

    ngOnInit(): void {
        this.waypointLists = this.data.waypointLists;
        this.selectedWaypointList = this.data.selectedWaypointList;
        this.importWaypoints = this.data.importWaypoints;
        this.getCompareWaypoints();
    }

    convertSymbols() {
        this.waypointService.convertWaypoints(
            this.importWaypoints,
            this.selectedWaypointList.deviceId,
            this.showModal
        );
    }

    showModal = (changes: StringMap): void => {
        const dialogRef = this.matDialog.open(ConvertDialogComponent, {
            width: '300px',
            data: { changes },
        });
        dialogRef.afterClosed().subscribe((changes) => {
            if (changes) {
                this.importWaypoints.forEach((wp) => {
                    wp.symbol = changes[wp.symbol];
                });
                this.getCompareWaypoints();
            }
        });
    };

    getCompareWaypoints(): void {
        this.compareWaypoints = this.waypointService.computeDiff(
            [...this.importWaypoints],
            Object.assign({}, this.selectedWaypointList)
        );
        if (this.selectedWaypointList.deviceId != '0') {
            const result = this.waypointService.detectDeviceIdFromSymbols(this.importWaypoints);
            const { detectedId, score } = result;
            this.okSymbols = detectedId == this.selectedWaypointList.deviceId && score == 1;
        } else {
            this.okSymbols = true;
        }
        // this.sharedService.nextSelectedList(this.selectedWaypointList);
    }

    prepareWaypointsLists(): void {
        let included = [];
        if (this.compareWaypoints) {
            included = this.compareWaypoints.filter((e) => e.included);
            // included.forEach((e) => {
            //     e.wp2.waypointListId = this.selectedWaypointList.waypointListId;
            // });
        }
        this.preparedWaypointsLists = {
            onlyImport: included.filter((e) => e.matchType === 'OnlyInImport').map((e) => e.wp2),
            partialMatches: included
                .filter((e) => e.matchType === 'PartialMatch')
                .map((e) => {
                    return { current: e.wp1, updated: e.wp2 };
                }),
            toListId: this.selectedWaypointList.waypointListId,
        };
    }

    close(save: boolean): void {
        this.prepareWaypointsLists();
        this.dialogRef.close(save ? this.preparedWaypointsLists : false);
    }

    editList(list: WaypointList): void {
        const dialogRef = this.matDialog.open(EditWaypointListComponent, {
            data: { waypointList: Object.assign({}, list) },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (!result) return;
            this.stateService.editList(result);
            // TODO set selectedWaypointList to new list
        });
    }

    addWaypointList(): void {
        const a: WaypointList = {
            name: 'new list',
            deviceId: '0',
            waypoints: [],
            waypointListId: '0',
        };

        this.editList(a);
    }
}
