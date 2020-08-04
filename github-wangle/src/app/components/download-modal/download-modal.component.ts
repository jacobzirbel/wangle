import { Component, OnInit, Inject } from '@angular/core';
import { WaypointRepoService } from 'src/app/services/WaypointRepoService';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { WaypointList, Waypoint, Device } from 'src/app/models/';
import { take } from 'rxjs/operators';
import { DeviceService } from 'src/app/services/DeviceService';
import { ConvertDialogComponent } from '../convert-dialog/convert-dialog.component';
import { cloneDeep } from 'lodash';
import { StringMap } from '@angular/compiler/src/compiler_facade_interface';

@Component({
    selector: 'app-download-modal',
    templateUrl: './download-modal.component.html',
    styleUrls: ['./download-modal.component.css'],
})
export class DownloadModalComponent implements OnInit {
    deviceList: Device[];
    selectedDevice: Device;
    selectedWaypointList: WaypointList;
    fileName: string;
    devices: { value: Device; viewValue: string }[];
    changes: StringMap;
    message: string;
    easyDownload: boolean;
    constructor(
        private matDialog: MatDialog,
        private waypointService: WaypointRepoService,
        private deviceService: DeviceService,
        public dialogRef: MatDialogRef<DownloadModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: WaypointList
    ) {}
    // this page should not alter original list
    ngOnInit(): void {
        this.selectedWaypointList = cloneDeep(this.data.list);
        this.deviceList = this.deviceService.getDeviceList();
        this.selectedDevice = this.deviceService.getDevice('0');
        this.fileName = this.selectedWaypointList.name;
        this.selectionChange();
    }
    selectionChange(): void {
        if (this.selectedDevice.id === '0') {
            this.easyDownload = true;
            this.message = 'List can be downloaded without alteration';
            return;
        }
        this.waypointService.convertList(
            this.selectedWaypointList,
            this.selectedDevice.id,
            (list, waypointsCopy, changes) => {
                Object.keys(changes).forEach((k) => {
                    if (changes[k] === k) delete changes[k];
                });
                this.changes = { ...changes };
                if (Object.keys(changes).length) {
                    // Symbols will change
                    // this.showModal(list, waypointsCopy, changes);
                    this.easyDownload = false;
                    this.message = 'Some symbols will change. Click download to review';
                } else {
                    // this.download(this.selectedWaypointList);
                    // Symbols will not change
                    this.easyDownload = true;
                    this.message = 'List can be downloaded without alteration';
                }
            }
        );
    }
    downloadButton(): void {
        if (this.easyDownload) {
            this.download(this.selectedWaypointList);
        } else {
            // this will not change the original list, this has been cloned
            this.showModal(this.selectedWaypointList, null, this.changes);
        }
    }
    showModal(list: WaypointList, waypointsCopy: Waypoint[], changes: StringMap): void {
        const dialogRef = this.matDialog.open(ConvertDialogComponent, {
            width: '300px',
            data: { list, waypointsCopy, changes },
        });
        dialogRef.afterClosed().subscribe((list) => {
            if (list) {
                this.download(list);
            }
        });
    }
    download(list: WaypointList): void {
        this.waypointService
            .getGpxFileFromList(list)
            .pipe(take(1))
            .subscribe(
                (res: string) => {
                    this.downloadFile(this.fileName + '.gpx', res);
                },
                (err) => {
                    throw err;
                }
            );
    }
    downloadFile(filename: string, text: string): void {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        this.dialogRef.close();
    }

    cancel(): void {
        this.dialogRef.close();
    }
}