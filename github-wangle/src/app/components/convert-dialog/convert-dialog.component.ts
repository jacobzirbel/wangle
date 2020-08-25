import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConvertDialogData } from 'src/app/models/ConvertDialogData';

@Component({
    selector: 'app-convert-dialog',
    templateUrl: './convert-dialog.component.html',
    styleUrls: ['./convert-dialog.component.css'],
})
export class ConvertDialogComponent implements OnInit {
    changes: string[][];
    displayedColumns: string[] = ['before', 'after'];
    constructor(
        public dialogRef: MatDialogRef<ConvertDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConvertDialogData
    ) {}
    ngOnInit(): void {
        this.changes = Object.keys(this.data.changes)
            .map((e) => {
                return [e, this.data.changes[e]];
            })
            .filter((e) => e[0] !== e[1]);
    }
    changeAndClose(): void {
        this.dialogRef.close(this.data.changes);
    }
    close(): void {
        this.dialogRef.close();
    }
}
