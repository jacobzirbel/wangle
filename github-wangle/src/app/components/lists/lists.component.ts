import {
    Component,
    OnInit,
    Output,
    EventEmitter,
    Input,
    OnDestroy,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';
import { faEdit, faMap, faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import { StateService } from 'src/app/state.service';
import { SharedService } from 'src/app/shared.service';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EditWaypointListComponent } from 'src/app/full/edit/edit-waypoint-list.component';
import { WaypointList } from 'src/app/models/WaypointList';
import { Permits } from 'src/app/models/Permits';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-lists',
    templateUrl: './lists.component.html',
    styleUrls: ['./lists.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListsComponent implements OnInit, OnDestroy {
    @Input() sidebar: boolean;
    @Output() ListNameChange = new EventEmitter<string>();
    route = '';
    permits: Permits;
    listsLoaded: Promise<boolean>;
    selectedWaypointList: WaypointList;
    fileName: string;
    waypointLists: WaypointList[];
    faDelete = faTrashAlt;
    faEdit = faEdit;
    faMap = faMap;
    faAdd = faPlus;

    subscriptions: Subscription[] = [];
    constructor(
        private stateService: StateService,
        private sharedService: SharedService,
        private router: Router,
        private matDialog: MatDialog,
        private ref: ChangeDetectorRef
    ) {
        router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.route = val.url.substr(1);
            }
        });
    }

    ngOnInit(): void {
        const s = (resolve, reject) => {
            const sub = this.sharedService.selectedList$.subscribe((list: WaypointList) => {
                this.ListNameChange.emit(list.name);
                this.selectedWaypointList = list;
                this.ref.detectChanges();
                resolve(true);
            }, reject);
            this.subscriptions.push(sub);
        };

        const a = (resolve, reject) => {
            const sub = this.sharedService.allLists$.subscribe((lists: WaypointList[]) => {
                this.waypointLists = lists;
                resolve(true);
            }, reject);
            this.subscriptions.push(sub);
        };
        const p = (resolve, reject) => {
            const sub = this.sharedService.permits$.subscribe((permits: Permits) => {
                this.permits = permits;
                resolve(true);
            }, reject);
            this.subscriptions.push(sub);
        };
        const wrap = (fn) => new Promise(fn);

        Promise.all([wrap(a), wrap(p), wrap(s)]).then(() => {
            this.listsLoaded = Promise.resolve(true);
            this.ref.detectChanges();
        });
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

    waypointListSelected(selected: WaypointList): void {
        this.sharedService.nextSelectedList(selected);
    }

    deleteList(list: WaypointList): void {
        if (this.router.url !== '/full') alert('error, deleteList');
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

    startManage(): void {
        this.sharedService.nextManage(true);
    }
}
