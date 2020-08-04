import { Component } from '@angular/core';
import { WaypointList, Waypoint } from 'src/app/models/';
import { WaypointRepoService } from 'src/app/services/WaypointRepoService';
import { take } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ConvertDialogComponent } from 'src/app/components/convert-dialog/convert-dialog.component';
import { StringMap } from '@angular/compiler/src/compiler_facade_interface';

@Component({
    selector: 'app-convert',
    templateUrl: './convert.component.html',
    styleUrls: ['./convert.component.css'],
})
export class ConvertComponent {
    fileName: string;
    list: WaypointList = {
        deviceId: undefined,
        name: 'to-convert',
        waypoints: [],
        waypointListId: '0',
    };

    constructor(private waypointService: WaypointRepoService, private matDialog: MatDialog) {}

    handleFileInput(files: FileList): void {
        const handleReader = function (evt: ProgressEvent) {
            this.waypointService
                .postInputFile(files[0].name, (<FileReader>evt.target).result)
                .subscribe(
                    (res) => {
                        if (res) {
                            this.list.waypoints = res;
                            this.waypointService.convertList(
                                this.list,
                                '1',
                                this.showModal.bind(this)
                            );
                        } else {
                            alert('no waypoints in file');
                        }
                    },
                    (err) => alert('a -= ' + JSON.stringify(err))
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
        }
    }
    showModal(list: WaypointList, waypointsCopy: Waypoint[], changes: StringMap): void {
        const dialogRef = this.matDialog.open(ConvertDialogComponent, {
            width: '300px',
            data: { list, waypointsCopy, changes },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.downloadList(list);
            }
        });
    }
    downloadList(list: WaypointList): void {
        this.waypointService
            .getGpxFileFromList(list)
            .pipe(take(1))
            .subscribe(
                (res) => {
                    this.download('converted.gpx', res);
                },
                (err) => {
                    throw err;
                }
            );
    }
    download(filename: string, text: string): void {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
}
