import { Component, OnInit, Input } from '@angular/core';
import { WaypointList } from 'src/app/models/WaypointList';
import { WaypointRepoService } from 'src/app/services/WaypointRepoService';
import { SharedService } from 'src/app/shared.service';
import { StateService } from 'src/app/state.service';
import { MatDialog } from '@angular/material/dialog';
import { PreparedWaypointLists } from 'src/app/models/PreparedWaypointLists';
import { Waypoint } from 'src/app/models/Waypoint';
import { CompareComponent } from 'src/app/full/compare/compare.component';

@Component({
    selector: 'upload-btn',
    templateUrl: './upload-btn.component.html',
    styleUrls: ['./upload-btn.component.css'],
})
export class UploadBtnComponent implements OnInit {
    @Input() selectedWaypointList: WaypointList;
    @Input() waypointLists: WaypointList[];
    @Input() isFull: boolean;
    @Input() route: string;
    fileName: string;
    constructor(
        private waypointService: WaypointRepoService,
        private sharedService: SharedService,
        private stateService: StateService,
        private matDialog: MatDialog
    ) {
        // this.isFull = this.route.includes('full');
    }

    ngOnInit(): void {
        return;
    }
    handleFileInput(files: FileList): void {
        const handleReader = function (evt: ProgressEvent) {
            this.waypointService
                // TODO check type of second arg
                .postInputFile(files[0].name, (<FileReader>evt.target).result)
                .subscribe(
                    (result) => {
                        if (!result) {
                            alert('No waypoints in file');
                            return;
                        } else {
                            if (this.isFull) {
                                this.displayCompareModal(result);
                            } else {
                                this.saveForBasic(result);
                            }
                        }
                    },
                    (err) => {
                        alert(err.error);
                        throw err;
                    }
                );
        };
        if (files.item(0)) {
            let reader = new FileReader();
            reader.readAsDataURL(files.item(0));
            reader.onload = handleReader.bind(this);
            reader.onerror = function () {
                alert('error reading file');
            };
            reader.onloadend = function () {
                reader.onload = null;
                reader.onerror = null;
                reader.onloadend = null;
                reader.abort();
                reader = null;
            };
        } else {
            alert('No file');
        }
    }

    displayCompareModal(importWaypoints: Waypoint[]): void {
        const dialogRef = this.matDialog.open(CompareComponent, {
            data: {
                waypointLists: this.waypointLists,
                selectedWaypointList: this.selectedWaypointList,
                importWaypoints: importWaypoints,
                isImport: true,
            },
        });
        dialogRef.afterClosed().subscribe((result) => {
            console.log(result);
            if (result) this.saveForFull(result);
        });
    }

    saveForFull(preparedWaypointsLists: PreparedWaypointLists): void {
        const wplId = preparedWaypointsLists.toListId;
        const newWaypoints = preparedWaypointsLists.onlyImport;

        const updatedWaypoints = preparedWaypointsLists.partialMatches.map((e) => {
            e.updated.waypointId = e.current.waypointId;
            e.updated.waypointListId = e.current.waypointListId;
            return e.updated;
        });

        if (newWaypoints.length) {
            this.stateService.addWaypointArray(newWaypoints, wplId);
        }
        if (updatedWaypoints.length) {
            this.stateService.updateWaypoints(updatedWaypoints);
        }
    }
    saveForBasic(result: Waypoint[]): void {
        this.selectedWaypointList.waypoints = result;
        this.sharedService.nextSelectedList(this.selectedWaypointList);
        localStorage.setItem(this.route + 'Waypoints', JSON.stringify(result));
    }
}
