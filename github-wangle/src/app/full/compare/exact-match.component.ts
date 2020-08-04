import { Component, Input } from '@angular/core';
import { CompareWaypoint } from 'src/app/models/';

@Component({
    selector: 'app-exact-match',
    template: `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Symbol</th>
                </tr>
            </thead>

            <tbody>
                <tr *ngFor="let cwp of waypoints">
                    <td>
                        <div *ngIf="cwp.wp1">{{ cwp.wp1.name }}</div>
                    </td>
                    <td>
                        <div *ngIf="cwp.wp1">{{ cwp.wp1.symbol }}</div>
                    </td>
                </tr>
            </tbody>
        </table>
    `,
})
export class ExactMatchComponent {
    @Input() waypoints: CompareWaypoint[];
}
