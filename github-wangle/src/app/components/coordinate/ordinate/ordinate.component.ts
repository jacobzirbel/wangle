import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Waypoint } from 'src/app/models/';
import { ValidationService } from 'src/app/services/ValidationService';
@Component({
    selector: 'app-ordinate',
    templateUrl: './ordinate.component.html',
    styleUrls: ['./ordinate.component.css'],
})
export class OrdinateComponent implements OnInit {
    @Input() formatStyle: string;
    @Input() type: string;
    @Input() waypoint: Waypoint;
    @Output() Change = new EventEmitter<void>();
    degrees: number;
    v = true;
    D_d = 0;
    DD_d = 0;
    DD_m = 0;
    DMS_d = 0;
    DMS_m = 0;
    DMS_s = 0;

    cardinals: string[];
    direction: string;
    constructor(private validationService: ValidationService) {}

    ngOnInit(): void {
        this.degrees = this.waypoint[this.type];
        this.cardinals = this.type === 'latitude' ? ['N', 'S'] : ['E', 'W'];
        this.direction = this.degrees > 0 ? this.cardinals[0] : this.cardinals[1];
        this.updateIntermediates(this.degrees);
    }
    setInvalidStyle(): { [key: string]: string } {
        const styles = {
            'background-color': 'red',
        };

        return styles;
    }
    inputChange(): void {
        this.v = true;
        let degrees: number;
        if (this.type === 'latitude') {
            if (this.formatStyle === 'Decimal') {
                degrees = this.D_d;

                this.v =
                    // RegEx: -XXX.XXXX
                    /^[-]{0,1}\d{0,3}(\.\d*){0,1}$/.test(this.D_d?.toString()) &&
                    this.validationService.validateLatitude(this.D_d);
            }

            if (this.formatStyle === 'Degree Decimal Minute') {
                degrees = this.DD_d + (this.DD_m || 0) / 60;
                this.v =
                    this.DD_m < 60 &&
                    // Degrees: -XXX
                    /^[-]{0,1}\d{0,3}$/.test(this.DD_d?.toString()) &&
                    // Minutes: XXX.XXXX
                    /^\d{1,3}(\.\d*){0,1}$/.test(this.DD_m?.toString()) &&
                    this.validationService.validateLatitude(degrees);
            }
            if (this.formatStyle === 'Degree Minute Second') {
                degrees = this.DMS_d + this.DMS_m / 60 + this.DMS_s / 3600;
                this.v =
                    this.DMS_m < 60 &&
                    this.DMS_s < 60 &&
                    /^[-]{0,1}\d{1,3}$/.test(this.DMS_d?.toString()) &&
                    /^\d{1,2}$/.test(this.DMS_m?.toString()) &&
                    /^\d{1,2}$/.test(this.DMS_s?.toString()) &&
                    this.validationService.validateLatitude(degrees);
            }
        }

        if (this.type === 'longitude') {
            if (this.formatStyle === 'Decimal') {
                degrees = this.D_d;
                this.v =
                    this.DD_m < 60 &&
                    // RegEx: -XXX.XXXX
                    /^[-]{0,1}\d{0,3}(\.\d*){0,1}$/.test(this.D_d?.toString()) &&
                    this.validationService.validateLongitude(degrees);
            }

            if (this.formatStyle === 'Degree Decimal Minute') {
                degrees = this.DD_d + (this.DD_m || 0) / 60;
                this.v =
                    // Degrees: -XXX
                    /^[-]{0,1}\d{1,3}$/.test(this.DD_d?.toString()) &&
                    // Minutes: XXX.XXXX
                    /^\d{1,3}(\.\d*){0,1}$/.test(this.DD_m?.toString()) &&
                    this.validationService.validateLongitude(degrees);
            }
            if (this.formatStyle === 'Degree Minute Second') {
                degrees = this.DMS_d + this.DMS_m / 60 + this.DMS_s / 3600;
                this.v =
                    this.DMS_m < 60 &&
                    this.DMS_s < 60 &&
                    /^[-]{0,1}\d{1,3}$/.test(this.DMS_d?.toString()) &&
                    /^\d{1,2}$/.test(this.DMS_m?.toString()) &&
                    /^\d{1,2}$/.test(this.DMS_s?.toString()) &&
                    this.validationService.validateLongitude(degrees);
            }
        }
        if (this.formatStyle === 'Decimal') {
            this.direction = this.cardinals[Math.sign(degrees) === 1 ? 0 : 1];
        } else {
            degrees = Math.abs(degrees) * (this.cardinals.indexOf(this.direction) ? -1 : 1);
        }
        if (this.v) {
            this.updateIntermediates(degrees);
        }
        this.waypoint[this.type] = degrees;
        this.Change.emit();
    }

    updateIntermediates(degrees: number): void {
        this.degrees = degrees;
        this.D_d = degrees;

        degrees = Math.abs(degrees);
        this.DD_d = Math.floor(degrees);
        this.DD_m = (degrees - this.DD_d) * 60;

        this.DMS_d = Math.floor(degrees);
        this.DMS_m = Math.floor((degrees - this.DMS_d) * 60);
        this.DMS_s = Math.round(3600 * (degrees - this.DMS_d - this.DMS_m / 60));
    }
    directionButtonClick(): void {
        this.direction = this.cardinals[this.direction === this.cardinals[1] ? 0 : 1];
        this.inputChange();
    }
}
