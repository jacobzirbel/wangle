import { Component, OnInit, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
    listName: string;
    sidebar: boolean;
    isLoggedIn: boolean;

    constructor(public auth: AuthService, public router: Router, private cdf: ChangeDetectorRef) {
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
    login() {
        this.auth.login();
    }
    logout() {
        this.auth.logout();
    }
    toggleSide(): void {
        if (this.sidebar) this.sidenav.toggle();
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
