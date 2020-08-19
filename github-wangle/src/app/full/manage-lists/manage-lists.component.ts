import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { WaypointList, RWRoute, Permits } from 'src/app/models/';
import { StateService } from 'src/app/state.service';
import { CompareComponent } from '../compare/compare.component';
import { MatDialog } from '@angular/material/dialog';
import { PreparedWaypointLists } from 'src/app/models/PreparedWaypointLists';
import { SelectionModel } from '@angular/cdk/collections';
import { Waypoint } from 'src/app/models/Waypoint';
import { EditWaypointListComponent } from '../edit/edit-waypoint-list.component';
import { SharedService } from 'src/app/shared.service';
import { WaypointRepoService } from 'src/app/services/WaypointRepoService';
import { DuplicatesDialogComponent } from 'src/app/components/duplicates-dialog/duplicates-dialog.component';

@Component({
    selector: 'app-manage-lists',
    templateUrl: './manage-lists.component.html',
    styleUrls: ['./manage-lists.component.css'],
})
export class ManageListsComponent implements OnInit {
    waypointLists: WaypointList[];
    currentList: WaypointList;
    permits: Permits;
    route: RWRoute;
    allWaypointsList: Waypoint[];
    mapWaypoints: Waypoint[];
    waypointsOnMap: Waypoint[];
    waypointsSelected: Waypoint[] = [];
    fileName: string;
    showMap: boolean;

    selection = new SelectionModel<Waypoint>(true, []);

    filterValue: string;
    constructor(
        public router: Router,
        private activatedRoute: ActivatedRoute,
        public auth: AuthService,
        public stateService: StateService,
        public sharedService: SharedService,
        private waypointService: WaypointRepoService,
        private matDialog: MatDialog
    ) {}

    ngOnInit(): void {
        const { lists, permits, route } = this.activatedRoute.snapshot.data['initData'];
        this.waypointLists = lists;
        this.permits = permits;
        this.route = route;
        const id = localStorage.getItem('fullSelectedList');
        this.currentList =
            this.waypointLists.find((wpl) => wpl.waypointListId == id) || this.waypointLists[0];
        this.mapWaypoints = [...this.currentList.waypoints];
        this.allWaypointsList = [...this.currentList.waypoints];
    }

    deDuplicateList() {
        console.time('de');
        const compareLatLng = this.waypointService.compareLatLng;
        const waypoints = [...this.currentList.waypoints];
        const groups = [];
        waypoints.forEach((outer, i) => {
            const group = waypoints.slice(i).filter((inner) => {
                return compareLatLng(inner, outer);
            });
            if (group.length > 1) {
                group.forEach((e) => {
                    const index = waypoints.indexOf(e);
                    waypoints.splice(index, 1);
                });
                groups.push(group);
            }
        });
        const dialogRef = this.matDialog.open(DuplicatesDialogComponent, {
            data: { groups },
        });
        dialogRef.afterClosed().subscribe((result) => {
            this.stateService.deleteArrayOfWaypoints(
                result.originals,
                this.currentList.waypointListId
            );
            this.stateService.addWaypointArray(result.news, this.currentList.waypointListId);
        });
    }

    deleteList(list: WaypointList): void {
        this.stateService.deleteList(list.waypointListId);
    }

    editList(list: WaypointList): void {
        if (this.router.url !== '/full') alert('error, editList');
        const dialogRef = this.matDialog.open(EditWaypointListComponent, {
            data: { waypointList: Object.assign({}, list) },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (!result) return;
            this.stateService.editList(result);
        });
    }

    addWaypointList(): void {
        const a: WaypointList = {
            name: 'new list',
            deviceId: '0',
            waypoints: [],
            waypointListId: '0',
        };

        this.editList(a);
    }

    setWaypointsOnMap(waypointsOnMapIds: string[]): void {
        this.waypointsOnMap = this.currentList.waypoints.filter((wp) =>
            waypointsOnMapIds.includes(wp.waypointId)
        );
    }
    // selectedChange(event: Waypoint[]): void {
    //     this.waypointsSelected = event;
    // }
    selectedChange(row: Waypoint): void {
        this.selection.toggle(row);
        this.waypointsSelected = [...this.selection.selected];
    }
    masterToggle(allWereSelected: boolean, waypoints: Waypoint[]): void {
        if (allWereSelected) {
            this.selection.deselect(...waypoints);
        } else {
            this.selection.select(...waypoints);
        }
        this.waypointsSelected = [...this.selection.selected];
    }
    waypointListSelected(list: WaypointList): void {
        localStorage.setItem('fullSelectedList', list.waypointListId);
        this.currentList = list;
        this.refreshTables();
        this.filterValue = '';
    }

    handleFilterInput(event: KeyboardEvent): void {
        this.filterValue = (event.target as HTMLInputElement).value;
    }
    deleteSelected(): void {
        this.stateService
            .deleteArrayOfWaypoints(this.waypointsSelected, this.currentList.waypointListId)
            .then(() => {
                this.refreshTables();
                this.selection = new SelectionModel<Waypoint>(true, []);
            });
    }

    // move copy should be refactored after working out API return values
    moveToDifferentList(): void {
        const dialogRef = this.matDialog.open(CompareComponent, {
            data: {
                waypointLists: this.waypointLists,
                // selectedWaypointList is the list points are moved to
                selectedWaypointList: this.waypointLists[0],
                importWaypoints: this.waypointsSelected,
                isImport: false,
            },
        });
        dialogRef.afterClosed().subscribe((result: PreparedWaypointLists) => {
            const { onlyImport, toListId } = result;
            if (onlyImport?.length) {
                this.stateService.moveWaypoints(onlyImport, toListId).then(() => {
                    this.refreshTables();
                    this.selection = new SelectionModel<Waypoint>(true, []);
                });
            }
        });
    }
    copyToList(): void {
        const dialogRef = this.matDialog.open(CompareComponent, {
            data: {
                waypointLists: this.waypointLists,
                // selectedWaypointList = list points are moved to
                selectedWaypointList: this.waypointLists[0],
                importWaypoints: this.waypointsSelected,
                isImport: false,
            },
        });

        dialogRef.afterClosed().subscribe((result: PreparedWaypointLists) => {
            const { onlyImport, toListId } = result;
            if (onlyImport?.length) {
                this.stateService.copyWaypoints(onlyImport, toListId).then(() => {
                    this.refreshTables();
                    // this.selection = new SelectionModel<Waypoint>(true, []);
                });
            }
        });
    }
    refreshTables(): void {
        this.mapWaypoints = [...this.currentList.waypoints];
        this.allWaypointsList = [...this.currentList.waypoints];
        this.waypointsSelected = [];
    }
}
