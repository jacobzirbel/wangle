import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertData } from 'src/app/models/';

@Component({
    selector: 'app-alert-dialog',
    templateUrl: './alert-dialog.component.html',
    styleUrls: ['./alert-dialog.component.css'],
})
export class AlertDialogComponent implements OnInit {
    input: boolean;
    content1: string;
    content2: string;
    content3: string;
    entered = 1;
    constructor(
        public dialogRef: MatDialogRef<AlertDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: AlertData
    ) {}
    ngOnInit(): void {
        this.content1 = this.data.content1;
        this.content2 = this.data.content2;
        this.content3 = this.data.content3;
        this.input = this.data.input;
    }
    close(): void {
        this.dialogRef.close();
    }
    ok(): void {
        this.dialogRef.close(this.entered);
    }
}
