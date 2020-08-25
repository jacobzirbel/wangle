import { Component, Input } from '@angular/core';
import { CompareWaypoint } from 'src/app/models/';

@Component({
    selector: 'app-partial-match',
    template: `
        <div *ngIf="ignore">
            <strong>These are ignored when copying or moving from a list</strong><br />
            <strong>They will remain in the original list</strong>
        </div>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Original Name/Symbol</th>
                    <th>New Name/Symbol</th>
                    <th *ngIf="!ignore">Update Name/Symbol?</th>
                </tr>
            </thead>

            <tbody>
                <tr *ngFor="let cwp of waypoints">
                    <td>
                        <div *ngIf="cwp.wp1">{{ cwp.wp1.name }} / {{ cwp.wp1.symbol }}</div>
                    </td>
                    <td>
                        <div *ngIf="cwp.wp2">{{ cwp.wp2.name }} / {{ cwp.wp2.symbol }}</div>
                    </td>
                    <td *ngIf="!ignore">
                        <input type="checkbox" [(ngModel)]="cwp.included" />
                    </td>
                </tr>
            </tbody>
        </table>
    `,
})
export class PartialMatchComponent {
    @Input() waypoints: CompareWaypoint[];
    @Input() ignore: boolean;
}
