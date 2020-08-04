import { Component, OnInit, Inject } from '@angular/core';
import { Waypoint, CompareWaypoint } from '../../models/';
import { WaypointRepoService } from '../../services/WaypointRepoService';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedService } from 'src/app/shared.service';
import { PreparedWaypointLists } from 'src/app/models/PreparedWaypointLists';
import { WaypointList } from 'src/app/models/WaypointList';
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
    constructor(
        private sharedService: SharedService,
        private waypointService: WaypointRepoService,
        public dialogRef: MatDialogRef<CompareComponent>,

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
        console.log(this.importWaypoints);
        this.getCompareWaypoints();
        console.log(this.data);
    }

    getCompareWaypoints(): void {
        this.compareWaypoints = this.waypointService.computeDiff(
            [...this.importWaypoints],
            Object.assign({}, this.selectedWaypointList)
        );

        this.sharedService.nextSelectedList(this.selectedWaypointList);
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
}
