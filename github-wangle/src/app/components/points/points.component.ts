import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { WaypointList, Permits } from 'src/app/models/';
import {
    faEdit,
    faMap,
    faTrashAlt,
    faPlus,
    faFileDownload,
} from '@fortawesome/free-solid-svg-icons';
import { WaypointRepoService } from 'src/app/services/WaypointRepoService';
import { SharedService } from 'src/app/shared.service';
import { AuthService } from 'src/app/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { isMobile } from './../../../app/mobile';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { PointsDismissAction } from 'PointsDismissAction';
import { Waypoint } from 'src/app/models/Waypoint';
// import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
    selector: 'app-points',
    templateUrl: './points.component.html',
    styleUrls: ['./points.component.css'],
})
export class PointsComponent implements OnInit {
    @Input() selectedWaypointList: WaypointList;
    // @Input() waypointLists: WaypointList[];
    @Input() permits: Permits;
    @Output() Dismiss = new EventEmitter<[PointsDismissAction, Waypoint]>();
    @Output() Hover = new EventEmitter<[number, number, Waypoint]>();
    @Input() cols: number;
    tableWaypoints: Waypoint[];
    dataSource;
    faDelete = faTrashAlt;
    faEdit = faEdit;
    faMap = faMap;
    faAdd = faPlus;
    faFileDownload = faFileDownload;
    coordinateFormat: string;
    readyWaypointList: {
        onlyImport: Waypoint[];
        partialMatches: { current: Waypoint; updated: Waypoint }[];
    };
    ready = false;
    displayedColumns = ['name', 'latitude', 'longitude', 'symbol'];
    smallScreen: boolean;
    @Input() height: string;
    mobile: boolean = isMobile;
    constructor(
        private waypointService: WaypointRepoService,
        public matDialog: MatDialog,
        private sharedService: SharedService,
        public auth: AuthService
    ) {}
    @ViewChild('pointsTable') pointsTable;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    ngOnInit(): void {
        if (window.innerWidth < 720) {
            this.smallScreen = true;
            this.displayedColumns = ['name', 'symbol'];
        }
        if (this.cols && this.cols < this.displayedColumns.length) {
            this.displayedColumns.length = this.cols;
        }
        this.tableWaypoints = [...this.selectedWaypointList.waypoints];
        this.dataSource = new MatTableDataSource(this.tableWaypoints);
        this.sharedService.selectedList$.subscribe((list: WaypointList) => {
            this.tableWaypoints = [...list.waypoints];
            this.dataSource = new MatTableDataSource(this.tableWaypoints);
            this.dataSource.sort = this.sort;
        });
        this.dataSource.sort = this.sort;
    }
    applyFilter(event: KeyboardEvent): void {
        const filterValue = (event.target as HTMLInputElement).value;

        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    separate(): void {
        this.Dismiss.emit(['detach', null]);
        // this._bottomSheetRef.dismiss();
    }

    convertList(): void {
        const newId = this.selectedWaypointList.deviceId == '1' ? '2' : '1';
        this.waypointService.convertList(this.selectedWaypointList, newId);
    }

    centerMap(wp: Waypoint): void {
        // this._bottomSheetRef.dismiss(['center', wp]);
        this.Dismiss.emit(['center', wp]);
    }
    hover(e: MouseEvent, wp: Waypoint): void {
        if (!isMobile) this.Hover.emit([e.y, e.x, wp]);
    }

    downloadWaypointList(): void {
        // this._bottomSheetRef.dismiss(['download', null]);
        this.Dismiss.emit(['download', null]);
    }

    // editWaypoint(wp?: Waypoint): void {
    //     const blank: Waypoint = {
    //         name: 'New Waypoint',
    //         symbol: '',
    //         latitude: 0,
    //         longitude: 0,
    //         waypointId: '0',
    //         waypointListId: this.selectedWaypointList.waypointListId,
    //     };
    //     // this._bottomSheetRef.dismiss(['edit', wp || blank]);
    //     this.Dismiss.emit(['edit', wp || blank]);
    // }
}
