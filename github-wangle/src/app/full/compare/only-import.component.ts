import { Component, Input } from '@angular/core';
import { CompareWaypoint } from 'src/app/models/';

@Component({
    selector: 'app-only-import',
    template: `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>symbol</th>
                    <th>Lat</th>
                    <th>Lon</th>
                    <th>include?</th>
                </tr>
            </thead>

            <tbody>
                <tr *ngFor="let cwp of waypoints">
                    <td>
                        <div *ngIf="cwp.wp2">{{ cwp.wp2.name }}</div>
                    </td>
                    <td>
                        <div *ngIf="cwp.wp2">{{ cwp.wp2.symbol }}</div>
                    </td>
                    <td>
                        <div *ngIf="cwp.wp2">{{ cwp.wp2.latitude }}</div>
                    </td>
                    <td>
                        <div *ngIf="cwp.wp2">{{ cwp.wp2.longitude }}</div>
                    </td>
                    <input type="checkbox" [(ngModel)]="cwp.included" />
                </tr>
            </tbody>
        </table>
    `,
})
export class OnlyImportComponent {
    @Input() waypoints: CompareWaypoint[];
}
