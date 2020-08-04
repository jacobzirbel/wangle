import { Component, OnInit, ViewChild, OnDestroy, HostListener, ElementRef } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { WaypointList, RWRoute, Permits } from '../models/';
import { WaypointRepoService } from '../services/WaypointRepoService';
import { StateService } from '../state.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../auth/auth.service';
import { SharedService } from '../shared.service';
import { EditWaypointComponent } from './edit/edit-waypoint.component';
import { Subscription } from 'rxjs';
import { DownloadModalComponent } from '../components/download-modal/download-modal.component';
import { PointsSheetComponent } from '../components/points/points-sheet.component';
import { PointsDragComponent } from '../components/points/points-drag.component';
import { isMobile } from '../mobile';
import { MapComponent } from '../components/map/map.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { PreparedWaypointLists } from '../models/PreparedWaypointLists';
import { PointsDismissAction } from 'PointsDismissAction';
import { Waypoint } from '../models/Waypoint';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.css'],
})
export class WelcomeComponent implements OnInit, OnDestroy {
    permits: Permits;
    route: RWRoute;
    basicRoutes: RWRoute[] = ['view', 'create', 'find'];
    waypointLists: WaypointList[];
    selectedWaypointList: WaypointList;
    importWaypoints: Waypoint[];
    preparedWaypointsLists: PreparedWaypointLists;
    subscriptions: Subscription[] = [];

    showControls: boolean;
    showLocationButton = true;

    mobile: boolean;
    @ViewChild('modalRoot') modalRoot;

    @ViewChild('appMap') appMap: MapComponent;
    constructor(
        public router: Router,
        private activatedRoute: ActivatedRoute,
        private _bottomSheet: MatBottomSheet,
        // Do not remove waypointService!
        private waypointService: WaypointRepoService,
        private stateService: StateService,
        private matDialog: MatDialog,
        private sharedService: SharedService,
        public auth: AuthService,
        private elementRef: ElementRef
    ) {
        this.mobile = isMobile;
        this.showControls = true;
    }

    startCurrentLocation(): void {
        this.appMap.startCurrentLocation();
    }

    @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;
    @HostListener('window:keyup', ['$event'])
    keyEvent(event: KeyboardEvent): void {
        const { key, target } = event;
        // so you can still type in input boxes
        if ((<HTMLInputElement>target).tagName === 'INPUT') {
            return;
        }
        if (this.appMap.waypointBeingDragged || this.appMap.waypointNameEdited) {
            return;
        }
        const mapTypes = ['roadmap', 'hybrid', 'terrain'];
        const keyActionMap = {
            ['1']: () => (this.appMap.mapType = mapTypes[0]),
            ['2']: () => (this.appMap.mapType = mapTypes[1]),
            ['3']: () => (this.appMap.mapType = mapTypes[2]),
            ['a']: () => this.appMap.toggleClusters(),
            ['s']: () => this.appMap.updateNavionics(),
            ['w']: () =>
                this.pointsSheetRef ? this.pointsSheetRef.dismiss() : this.openBottomSheet(),
            ['d']: () =>
                this.pointsDialogRef ? this.pointsDialogRef.close() : this.separatePoints(),
            ['y']: () => console.log('whatever else you want'),
            ['b']: () => {
                this.showControls = true;
                this.menuTrigger?.openMenu();
            },
            // Don't use 't' is is used by map to start/end drag
            ['Escape']: () => {
                this.menuTrigger?.closeMenu();
                this.appMap.closeFromWelcome();
            },
        };
        const action = keyActionMap[key];
        if (action) {
            action();

            // assuming you are using shortcuts so you don't want to see controls
            // this.showControls = false;
        }
    }
    ngOnInit(): void {
        const { lists, permits, route } = this.activatedRoute.snapshot.data['initData'];

        this.waypointLists = lists;
        this.permits = permits;
        this.route = route;
        const id = localStorage.getItem('selectedList');
        this.selectedWaypointList =
            this.waypointLists.find((wpl) => wpl.waypointListId == id) || this.waypointLists[0];
        this.sharedService.nextLists(this.waypointLists);
        this.sharedService.nextPermits(this.permits);
        this.sharedService.nextSelectedList(this.selectedWaypointList);
        const slSub = this.sharedService.selectedList$.subscribe((list: WaypointList) => {
            localStorage.setItem('selectedList', list.waypointListId);
            this.selectedWaypointList = list;
        });
        this.subscriptions.push(slSub);

        this.pointsSheetRef = undefined;
        this.pointsDialogRef = undefined;
    }

    addFromMap(coords: number[]): void {
        if (!this.permits.wpEdit) return;
        if (!coords[0] || (!coords[1] && !coords.includes(0))) alert('addFromMaperror');

        const newWp: Waypoint = {
            name: 'New Waypoint',
            latitude: coords[0] || 45,
            longitude: coords[1] || 90,
            symbol: 'Waypoint',
            waypointId: '0',
        };
        this.openEditDialog(newWp);
    }
    openEditDialog(newWp: Waypoint): void {
        const dialogRef = this.matDialog.open(EditWaypointComponent, {
            panelClass: 'width-dialog',
            data: {
                mini: true,
                waypoint: newWp,
                selectedWaypointList: this.selectedWaypointList,
            },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (!result?.save) return;
            if (this.route === 'full') this.full.save(result.save, result.listId);
            if (this.basicRoutes.includes(this.route))
                this.basic.save(newWp, result.save, result.listId);
        });
    }
    pointsSheetRef;
    pointsDialogRef;
    openBottomSheet(): void {
        if (this.pointsSheetRef) return;
        if (this.pointsDialogRef) {
            this.pointsDialogRef.close();
            this.pointsDialogRef = undefined;
        }
        this.pointsSheetRef = this._bottomSheet.open(PointsSheetComponent, {
            panelClass: 'no-scroll-sheet',
            data: {
                list: this.selectedWaypointList,
                permits: this.permits,
            },
        });
        this.pointsSheetRef
            .afterDismissed()
            .subscribe((fromDismiss?: [PointsDismissAction, Waypoint]) => {
                this.pointsSheetRef = undefined;
                if (!fromDismiss) {
                    return;
                }
                const [action, wp] = fromDismiss;
                if (!action) {
                    console.warn('No dismiss action');
                } else if (action === 'dismiss') {
                    return;
                } else if (action === 'detach') {
                    this.separatePoints();
                    return;
                } else if (!this.waypointMethods[action]) {
                    alert('bottomsheet dismiss error');
                    return;
                } else {
                    this.waypointMethods[action](wp);
                }
            });
    }
    separatePoints(): void {
        if (this.pointsDialogRef) return;
        if (this.pointsSheetRef) {
            this.pointsSheetRef.dismiss(['dismiss', null]);
            this.pointsSheetRef = undefined;
        }
        this.pointsDialogRef = this.matDialog.open(PointsDragComponent, {
            maxHeight: '50vh',
            minHeight: '50vh',
            panelClass: 'no-scroll',
            hasBackdrop: false,
            position: {
                ['left']: '10px',
            },
            data: {
                list: this.selectedWaypointList,
                permits: this.permits,
                center: (wp: Waypoint) => {
                    this.waypointMethods.center(wp);
                },
            },
        });
        this.pointsDialogRef
            .afterClosed()
            .subscribe((fromDismiss?: [PointsDismissAction, Waypoint]) => {
                this.pointsDialogRef = undefined;
                if (!fromDismiss) {
                    return;
                }
                const [action, wp] = fromDismiss;
                if (!action) {
                    console.warn('no dismiss dialog action');
                    return;
                } else if (action === 'dismiss') {
                    return;
                } else if (!this.waypointMethods[action]) {
                    alert('dialog dismiss error');
                    return;
                } else if (!wp) {
                    console.error('no dialog dismiss waypoint');
                }
                this.waypointMethods[action](wp);
            });
    }

    waypointMethods = {
        download: (): void => {
            this.matDialog.open(DownloadModalComponent, {
                data: {
                    list: this.selectedWaypointList,
                },
            });
        },
        edit: (wp: Waypoint): void => {
            const dialogRef = this.matDialog.open(EditWaypointComponent, {
                panelClass: 'width-dialog',
                data: {
                    waypoint: wp,
                    waypointLists: this.waypointLists,
                    selectedWaypointList: this.selectedWaypointList,
                },
            });
            dialogRef.afterClosed().subscribe((result) => {
                if (!result) return;
                if (result.save) {
                    if (this.route === 'full') this.full.edit(result.save);
                    if (this.basicRoutes.includes(this.route)) {
                        this.basic.save(wp, result.save, result.listId);
                    }
                } else if (result.delete) {
                    if (this.route === 'full') this.full.delete(result.delete, result.listId);
                    if (this.basicRoutes.includes(this.route)) {
                        this.basic.delete(wp);
                    }
                }
            });
        },
        save: (wpChangedName): void => {
            console.log(wpChangedName);
            if (this.route === 'full') {
                this.full.edit(wpChangedName);
            }
            if (this.basicRoutes.includes(this.route)) {
                console.log('basicroutes');
                this.basic.save(
                    wpChangedName,
                    wpChangedName,
                    this.selectedWaypointList.waypointListId
                );
            }
        },
        center: (wp: Waypoint): void => {
            this.appMap.openWaypointInfoWindow(wp);
        },
    };

    basic = {
        save: (original: Waypoint, wp: Waypoint, listId: string): void => {
            if (listId != this.selectedWaypointList.waypointListId) {
                alert('Error: listIds do not match');
            }
            const brandNew = !this.selectedWaypointList.waypoints
                .map((e) => e.waypointId)
                .includes(wp.waypointId);
            if (brandNew) {
                wp.waypointId = (this.selectedWaypointList.waypoints.length + 1).toString();
                this.selectedWaypointList.waypoints.push(wp);
            } else {
                Object.assign(original, wp);
            }
            console.log('setItem');
            localStorage.setItem(
                this.route + 'Waypoints',
                JSON.stringify(this.selectedWaypointList.waypoints)
            );
        },
        delete: (wp: Waypoint): void => {
            const index = this.selectedWaypointList.waypoints.indexOf(wp);
            this.selectedWaypointList.waypoints.splice(index, 1);
            localStorage.setItem(
                this.route + 'Waypoints',
                JSON.stringify(this.selectedWaypointList.waypoints)
            );
        },
    };

    full = {
        save: (wp: Waypoint, listId: string): void => {
            this.stateService.addWaypoint(wp, listId).then((e) => console.log(e));
        },
        edit: (wp: Waypoint): void => {
            this.stateService.editWaypoint(wp);
        },

        delete: (wp: Waypoint, listId: string): void => {
            this.stateService.deleteWaypoint(wp.waypointId, listId);
        },
    };

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => {
            sub.unsubscribe();
        });
        if (this.pointsSheetRef) this.pointsSheetRef.close();
        if (this.pointsDialogRef) this.pointsDialogRef.close();
        this.elementRef.nativeElement.remove();
    }
}
