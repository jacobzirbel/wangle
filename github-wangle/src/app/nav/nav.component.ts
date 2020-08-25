import { Component, OnInit, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../components/alert-dialog/alert-dialog.component';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
    listName: string;
    sidebar: boolean;
    isLoggedIn: boolean;

    constructor(
        public auth: AuthService,
        public router: Router,
        private cdf: ChangeDetectorRef,
        private matDialog: MatDialog
    ) {
        this.sidebar = window.innerWidth < 960;
    }
    @HostListener('window:resize', ['$event'])
    onResize(): void {
        this.sidebar = window.innerWidth < 960;
    }

    @ViewChild('sidenav') sidenav;

    ngOnInit(): void {
        return;
    }
    login(): void {
        const dialogRef = this.matDialog.open(AlertDialogComponent, {
            width: '300px',
            data: {
                content1: 'Email us to join',
                content2: 'wanglewaypoints@gmail.com',
                input: true,
            },
        });
        dialogRef.updatePosition({ top: '23vh' });
        dialogRef.afterClosed().subscribe((entered: number) => {
            if (entered == 1) {
                // this.router.navigateByUrl('/full');
                this.auth.login();
            }
        });
    }
    logout() {
        this.auth.logout();
    }
    toggleSide(): void {
        this.sidenav.close();
    }
    listChange(name: string): void {
        if (this.listName) {
            setTimeout(() => {
                this.toggleSide();
            }, 300);
        }
        this.listName = name;
        this.cdf.detectChanges();
    }
}
