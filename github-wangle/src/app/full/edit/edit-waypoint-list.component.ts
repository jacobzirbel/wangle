import { Component, OnInit, Inject } from '@angular/core';
import { Device } from '../../models/';
import { DeviceService } from 'src/app/services/DeviceService';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WaypointList } from 'src/app/models/WaypointList';

@Component({
    selector: 'app-edit-waypoint-list',
    template: `
        <h1 mat-dialog-title>Edit/Add</h1>
        <div mat-dialog-content>
            <div class="container"></div>
            <div>
                <div>
                    <input
                        type="text"
                        class="form-control"
                        required
                        [(ngModel)]="waypointList.name"
                        id="name"
                    />
                    <div ng-app="myApp" ng-controller="myCtrl">
                        Choose Device:
                        <select [(ngModel)]="waypointList.deviceId">
                            <option *ngFor="let d of deviceList" [ngValue]="d.id">
                                {{ d.name }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
            <br />
        </div>

        <div mat-dialog-actions>
            <button mat-button (click)="close(false)">Cancel</button>
            <button *ngIf="true" mat-button (click)="close(true)" cdkFocusInitial>
                Save
            </button>
        </div>
    `,
})
export class EditWaypointListComponent implements OnInit {
    waypointList: WaypointList;
    deviceList: Device[];
    constructor(
        public dialogRef: MatDialogRef<EditWaypointListComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { waypointList: WaypointList },
        private deviceService: DeviceService
    ) {}

    // Shouldn't edit device of lists with waypoints
    ngOnInit(): void {
        this.waypointList = this.data.waypointList;
        this.deviceList = this.deviceService.getDeviceList();
    }
    close(save: boolean): void {
        this.dialogRef.close(save && this.waypointList);
    }
}
