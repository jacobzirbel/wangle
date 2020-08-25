import {
    Component,
    OnInit,
    ViewChild,
    Input,
    OnChanges,
    SimpleChanges,
    Output,
    EventEmitter,
} from '@angular/core';
import { Waypoint } from 'src/app/models/';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
    selector: 'table-manage',
    templateUrl: './table-manage.component.html',
    styleUrls: ['./table-manage.component.css'],
})
export class TableManageComponent implements OnInit, OnChanges {
    @Input() waypoints: Waypoint[];
    @Input() filterValue: string;
    // @Input() alreadySelected: Waypoint[] = [];
    @Input() selection;
    @Output() SelectedChange = new EventEmitter<Waypoint>();
    @Output() MasterToggle = new EventEmitter<boolean>();
    tableWaypoints: Waypoint[];
    dataSource;
    // selection;
    displayedColumns = ['select', 'name', 'latitude', 'longitude', 'symbol'];
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.waypoints?.currentValue) {
            this.dataSource = new MatTableDataSource(changes.waypoints.currentValue);
            this.dataSource.sort = this.sort;
            this.dataSource.filter = this.filterValue?.trim().toLowerCase();
        }
        if (changes.filterValue?.currentValue) {
            this.dataSource.filter = changes.filterValue.currentValue.trim().toLowerCase();
            console.log(this.dataSource.filteredData);
        }
        // if (changes.alreadySelected?.currentValue) {
        //     this.selection = new SelectionModel<Waypoint>(
        //         true,
        //         changes.alreadySelected.currentValue
        //     );
        // }
    }
    ngOnInit(): void {
        // this.selection = new SelectionModel<Waypoint>(true, this.alreadySelected);
    }
    checkboxChange(event: MatCheckboxChange, row: Waypoint): void {
        if (event) {
            // this.selection.toggle(row);
            this.SelectedChange.emit(row);
        }
    }
    // applyFilter(event: KeyboardEvent): void {
    //     const filterValue = (event.target as HTMLInputElement).value;
    //     this.dataSource.filter = filterValue.trim().toLowerCase();
    // }
    isAllSelected(): boolean {
        return this.waypoints?.every((twp) => this.selection.selected.includes(twp));
    }
    someAreSelected(): boolean {
        return this.waypoints?.some((twp) => this.selection.selected.includes(twp));
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): void {
        this.MasterToggle.emit(this.isAllSelected());
        // if (this.isAllSelected()) {
        //     // this.dataSource.data.forEach((row) => this.selection.deselect(row));
        //     this.MasterToggle.emit(true);
        // } else {
        //     // this.dataSource.data.forEach((row) => this.selection.select(row));
        //     this.MasterToggle.emit(false);
        // }
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: Waypoint): string {
        if (!row) {
            return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
            row.waypointId + 1
        }`;
    }
}
