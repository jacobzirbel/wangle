import { Component, Input } from '@angular/core';
import { ValidationService, ValidationObject } from 'src/app/services/ValidationService';
import { WaypointRepoService } from 'src/app/services/WaypointRepoService';
import { MatDialog } from '@angular/material/dialog';
import { EditWaypointComponent } from '../../edit/edit-waypoint.component';
import { CompareWaypoint } from 'src/app/models/CompareWaypoint';
import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
import { WaypointList } from 'src/app/models/WaypointList';
import { Waypoint } from 'src/app/models/Waypoint';

@Component({
    selector: 'app-invalid-imports',
    templateUrl: './invalid-imports.component.html',
    styleUrls: ['./invalid-imports.component.css'],
})
export class InvalidImportsComponent {
    @Input() waypoints: CompareWaypoint[];
    @Input() selectedWaypointList: WaypointList;

    editedIsValid = false;

    waypointEditInfo: {
        original?: Waypoint;
        beingEdited?: Waypoint;
        validationMessage?: ValidationObject;
        device?: string;
    };

    constructor(
        private matDialog: MatDialog,
        private validate: ValidationService,
        private waypointService: WaypointRepoService
    ) {}

    validateAgain(cwp: CompareWaypoint): void {
        cwp.valid = this.validate.validate(cwp.wp2, this.selectedWaypointList.deviceId);
        if (cwp.valid.valid) {
            this.setMatchType(cwp);
            cwp.included = true;
        } else {
            cwp.included = false;
        }
    }

    setMatchType(cwp: CompareWaypoint): void {
        cwp.matchType = this.waypointService.setSingleMatchType(cwp);
    }

    public setStylesInvalid(): StringMap {
        const styles = {
            'background-color': 'red',
        };

        return styles;
    }

    checkBoxStyle(): { [key: string]: string } {
        const styles = {
            height: '200px',
        };
        return styles;
    }

    editWaypointFromDialog(cwp: CompareWaypoint): void {
        const dialogRef = this.matDialog.open(EditWaypointComponent, {
            data: {
                waypoint: cwp.wp2,
                selectedWaypointList: this.selectedWaypointList,
            },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result.delete) console.warn("this shouldn't happen");
            if (result.save) {
                Object.assign(cwp.wp2, result.save);
                this.validateAgain(cwp);
            }
        });
    }
}
