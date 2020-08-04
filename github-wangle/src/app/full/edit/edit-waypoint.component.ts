import { Component, OnInit, Input, Inject } from '@angular/core';
import { Waypoint, WaypointList } from 'src/app/models/';
import { ValidationObject, ValidationService } from 'src/app/services/ValidationService';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EditDialogData } from 'src/app/models/EditDialogData';
import { StringMap } from '@angular/compiler/src/compiler_facade_interface';

@Component({
    selector: 'app-edit-waypoint',
    templateUrl: './edit-waypoint.component.html',
    styleUrls: ['./edit-waypoint.component.css'],
})
export class EditWaypointComponent implements OnInit {
    @Input() mini: boolean;
    ready: boolean;
    newWp: boolean;
    waypointLists: WaypointList[];
    selectedWaypointList: WaypointList;
    symbols: string[];
    allSymbols: string[];
    title: string;
    waypointEditInfo: {
        original: Waypoint;
        beingEdited: Waypoint;
        validationMessage: ValidationObject;
        device: string;
    };
    constructor(
        private validationService: ValidationService,
        public dialogRef: MatDialogRef<EditWaypointComponent>,
        @Inject(MAT_DIALOG_DATA) public data: EditDialogData
    ) {}

    ngOnInit(): void {
        this.mini = this.data.mini;
        this.waypointLists = this.data.waypointLists;
        this.selectedWaypointList = this.data.selectedWaypointList;
        const device = this.selectedWaypointList.deviceId || '0';
        this.symbols = [...this.validationService.getAllowedSymbols(device)];
        this.allSymbols = [...this.symbols];
        this.waypointEditInfo = {
            original: this.data.waypoint,
            beingEdited: Object.assign({}, this.data.waypoint),
            validationMessage: new ValidationObject(true),
            device: device,
        };
        if (!this.waypointEditInfo.beingEdited.symbol)
            this.waypointEditInfo.beingEdited.symbol = this.symbols[0] || 'Waypoint';
        this.ready = true;
        this.newWp = !+this.waypointEditInfo.original.waypointId;
        this.title = this.newWp
            ? 'Add New Waypoint'
            : `Edit: ${this.waypointEditInfo.original.name}`;
        this.validateAgain();
    }

    onKey(value: string): void {
        this.symbols = this.search(value);
    }
    search(value: string): string[] {
        const filter = value.toLowerCase();
        return this.allSymbols.filter((option) => option.toLowerCase().startsWith(filter));
    }
    validateAgain(): void {
        const validationMessage = this.validationService.validate(
            this.waypointEditInfo.beingEdited,
            this.waypointEditInfo.device
        );
        this.waypointEditInfo.validationMessage = validationMessage;
    }
    close(save: boolean): void {
        this.dialogRef.close(
            save && {
                save: this.waypointEditInfo.beingEdited,
                listId: this.selectedWaypointList.waypointListId,
            }
        );
    }
    delete(): void {
        if (this.newWp) {
            alert('delete newWp error');
            return;
        }
        if (confirm('Delete Waypoint?'))
            this.dialogRef.close({
                delete: this.waypointEditInfo.beingEdited,
                listId: this.selectedWaypointList.waypointListId,
            });
    }
    public setStylesInvalid(): StringMap {
        const styles = {
            'background-color': 'red',
        };

        return styles;
    }
}
