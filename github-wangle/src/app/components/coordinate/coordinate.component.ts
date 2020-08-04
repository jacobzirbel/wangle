import { Component, Output, EventEmitter, Input } from '@angular/core';
import { Waypoint, Device } from '../../models/';
import { ValidationObject } from '../../services/ValidationService';

@Component({
    selector: 'app-coordinate',
    templateUrl: './coordinate.component.html',
    styleUrls: ['./coordinate.component.css'],
})
export class CoordinateComponent {
    @Input() waypointEditInfo: {
        original: Waypoint;
        beingEdited: Waypoint;
        validationMessage: ValidationObject;
        device: Device;
    };
    examples = [`DDD.DDDDD°`, `DDD° MM.MMM'`, `DDD° MM' SS"`];
    formatStyles: string[] = ['Decimal', 'Degree Decimal Minute', 'Degree Minute Second'];
    formatSelected = 'Decimal';
    @Output() Change = new EventEmitter<void>();

    public setStylesInvalid(): { [key: string]: string } {
        const styles = {
            'background-color': 'red',
        };
        return styles;
    }
    change(): void {
        this.Change.emit();
    }
}
