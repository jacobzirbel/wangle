import { Component, Input, Output, EventEmitter } from '@angular/core';
import { WaypointList } from 'src/app/models/';

@Component({
    selector: 'app-lists-table',
    template: `
        <mat-selection-list #lists [multiple]="false">
            <mat-list-option
                *ngFor="let list of waypointLists"
                (click)="listClicked(list)"
                [ngClass]="{
                    selected: list.waypointListId === highlightId
                }"
                fxLayout="row"
            >
                <p>
                    {{ list.name }} <sup>{{ list.waypoints?.length }}</sup
                    ><sub *ngIf="list.deviceId != '0'">{{ list.deviceId | returnDeviceName }}</sub>
                </p>
            </mat-list-option>
        </mat-selection-list>
    `,
    styles: ['.selected { background-color: lightgrey; }'],
})
export class ListsTableComponent {
    @Input() waypointLists: WaypointList[];
    @Input() highlightId: string;
    @Output() ListClicked = new EventEmitter<WaypointList>();

    listClicked(list: WaypointList): void {
        this.ListClicked.emit(list);
    }
}
