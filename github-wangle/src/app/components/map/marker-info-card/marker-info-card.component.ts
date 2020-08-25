import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    ViewChildren,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    OnDestroy,
} from '@angular/core';
import { Waypoint } from 'src/app/models/Waypoint';
import { ValidationService } from 'src/app/services/ValidationService';
import { take } from 'rxjs/operators';

@Component({
    selector: 'marker-info-card',
    templateUrl: './marker-info-card.component.html',
    styleUrls: ['./marker-info-card.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkerInfoCardComponent implements OnInit {
    // Save an edit waypoint
    @Output() SaveWaypoint = new EventEmitter<Waypoint>();
    // Open edit dialog
    @Output() StartEdit = new EventEmitter<Waypoint>();

    @Input() allowEdit: boolean;
    @Input() waypoint: Waypoint;
    @Input() deviceId: string;
    nameBeingEdited: boolean;
    symbolBeingEdited: boolean;
    waypointNameValid = true;
    waypointNameEdited: string;
    waypointSymbolEdited: string;
    allSymbols: string[];
    symbols: string[];
    constructor(private validationService: ValidationService, private ref: ChangeDetectorRef) {}

    ngOnInit(): void {
        return;
    }

    editWaypoint(): void {
        // This is for opening edit dialog
        this.StartEdit.emit(this.waypoint);
    }

    dblClickTitle(): void {
        setTimeout(() => {
            // TODO
            document.getElementById('name-input').focus();
        });
        this.nameBeingEdited = true;
        this.waypointNameEdited = this.waypoint.name;
        this.ref.detectChanges();
    }

    editedNameChange(): void {
        this.waypointNameValid = this.validationService.validateName(
            this.waypointNameEdited,
            null,
            100
        );
    }
    @ViewChildren('mySelect') mySelect;

    dblClickSymbol(): void {
        setTimeout(() => {
            // TODO
            document.getElementById('symbol-search').focus();
        });
        this.mySelect.changes.pipe(take(1)).subscribe((a) => a.last.open());
        this.symbolBeingEdited = true;
        this.waypointSymbolEdited = this.waypoint.symbol;
        if (!this.allSymbols) {
            this.allSymbols = this.validationService.getDeviceSymbols(this.deviceId).sort();
        }
        this.symbols = this.allSymbols;
        this.ref.detectChanges();
    }

    symbolChange(): void {
        if (this.waypoint.symbol !== this.waypointSymbolEdited) {
            this.waypoint.symbol = this.waypointSymbolEdited;
            this.SaveWaypoint.emit(this.waypoint);
        }
        this.waypointSymbolEdited = '';
        this.symbolBeingEdited = false;
    }

    onKey(value: string): boolean {
        this.symbols = this.search(value);
        return true;
    }

    search(value: string): string[] {
        const filter = value.toLowerCase();
        return this.allSymbols.filter((option) => option.toLowerCase().startsWith(filter));
    }

    inputKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.waypointNameEdited = '';
            this.nameBeingEdited = false;
            this.waypointNameValid = true;
            this.waypointSymbolEdited = '';
            this.symbolBeingEdited = false;
        }
        if (event.key === 'Enter') {
            this.inputBlur();
        }
        event.stopPropagation();
    }

    inputBlur(): void {
        if (!this.waypointNameValid) {
            this.waypointNameEdited = '';
            this.nameBeingEdited = false;
            this.waypointNameValid = true;
            return;
        } else {
            if (this.waypointNameEdited.trim() !== this.waypoint.name.trim()) {
                this.waypoint.name = this.waypointNameEdited;
                this.waypointNameEdited = '';
                this.nameBeingEdited = false;
                this.SaveWaypoint.emit(this.waypoint);
            } else {
                this.nameBeingEdited = false;
            }
        }
    }
}
