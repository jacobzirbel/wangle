import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Waypoint } from 'src/app/models/Waypoint';
@Component({
    selector: 'app-duplicates-dialog',
    templateUrl: './duplicates-dialog.component.html',
    styleUrls: ['./duplicates-dialog.component.css'],
})
export class DuplicatesDialogComponent implements OnInit {
    selectedName: string;
    selectedSymbol: string;
    things: {
        waypoint: Waypoint;
        name: string;
        symbol: string;
        nameOptions: string[];
        symbolOptions: string[];
    }[];
    constructor(
        public dialogRef: MatDialogRef<DuplicatesDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { groups: Waypoint[][] }
    ) {}

    ngOnInit(): void {
        this.things = this.data.groups.map((group) => {
            const waypoint = group[0];
            const name = waypoint.name;
            const symbol = waypoint.symbol;
            let nameOptions = [];
            let symbolOptions = [];
            group.forEach((element) => {
                nameOptions.push(element.name);
                symbolOptions.push(element.symbol);
            });
            nameOptions = [...new Set(nameOptions)];
            symbolOptions = [...new Set(symbolOptions)];
            return { waypoint, name, symbol, nameOptions, symbolOptions };
        });
    }
    cancel() {
        this.dialogRef.close();
    }
    save() {
        const originals = [];
        const news = [];
        this.data.groups.forEach((e) => {
            originals.push(...e);
        });
        this.things.forEach((e) => {
            news.push({ ...e.waypoint, name: e.name, symbol: e.symbol });
        });
        this.dialogRef.close({ originals, news });
    }
}
