import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConvertDialogComponent } from './components/convert-dialog/convert-dialog.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Router } from '@angular/router';
import { setMobile } from './mobile';
import { AuthService } from './auth/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    title = 'WangleWaypoints';
    constructor(
        private matDialog: MatDialog,
        private detectService: DeviceDetectorService,
        private router: Router,
        public auth: AuthService
    ) {}
    ngOnInit(): void {
        setMobile(this.detectService.isMobile());

        let h = window.innerHeight;
        document.documentElement.style.setProperty('--fromTop', `${h - 111}px`);
        document.documentElement.style.setProperty('--fullAfterNav', `${h - 55}px`);
        window.addEventListener('resize', () => {
            h = window.innerHeight;
            document.documentElement.style.setProperty('--fromTop', `${h - 111}px`);
            document.documentElement.style.setProperty('--fullAfterNav', `${h - 55}px`);
        });
    }

    openDialog(): void {
        const dialogConfig = new MatDialogConfig();
        this.matDialog.open(ConvertDialogComponent, dialogConfig);
    }
    fullLogout(): void {
        this.deleteCookie('_ga');
        this.deleteCookie('auth0.is.authenticated');
        location.reload();
    }
    deleteCookie(name: string): void {
        const date = new Date();

        // Set it expire in -1 days
        date.setTime(date.getTime() + -1 * 24 * 60 * 60 * 1000);

        // Set it
        document.cookie = name + '=; expires=' + date.toUTCString() + '; path=/';
    }
}
