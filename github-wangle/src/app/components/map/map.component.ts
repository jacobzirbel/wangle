/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    AfterViewInit,
    OnDestroy,
    OnChanges,
    SimpleChanges,
    HostListener,
    ViewChildren,
} from '@angular/core';
import { Permits } from '../../models/';
import { LatLngBounds, AgmInfoWindow } from '@agm/core';
import { Subscription } from 'rxjs';
import { format } from 'date-fns';
import { Waypoint } from 'src/app/models/Waypoint';
import { CoordsClick } from 'src/app/models/CoordsClick';
import { NotificationService } from 'src/app/services/notification.service';
import { take } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

declare let JNC: any;
declare let google: any;
@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css'],
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    @Input() waypoints: Waypoint[];
    @Input() allowEdit = false;
    @Input() waypointCenter: Waypoint;
    @Input() title: string;
    @Input() zoom: number;
    @Input() permits: Permits;
    @Input() shouldWatchBounds: boolean;
    @Input() mini: boolean;
    @Input() deviceId: string;
    @Output() RightClick = new EventEmitter<number[]>();
    @Output() LeftClick = new EventEmitter<void>();
    @Output() NoLocation = new EventEmitter<void>();
    @Output() EditWaypoint = new EventEmitter<Waypoint>();
    @Output() BoundsChange = new EventEmitter<Waypoint[]>();
    @Output() WaypointEdited = new EventEmitter<Waypoint>();

    lat: number;
    lon: number;
    mapType = 'roadmap';
    @Input() useClusters = true;
    // useNavionics has to start as true for now
    useNavionics = true;
    overlays: google.maps.MVCArray<google.maps.MapType>;
    navionics_nauticalchart_layer: any;
    navionEvent: google.maps.Map;
    waypointsOnMap: Waypoint[];
    subscriptions: Subscription[] = [];

    inNameEdit = false;

    dragMarkers;
    @ViewChild('agm') agm;

    // Good center
    //latitude: 44.00377418163695,
    //longitude: -88.52163791579243,

    public mapStyles = [
        {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'on',
                },
            ],
        },
    ];
    constructor(private snackBar: MatSnackBar) {}

    ngOnInit(): void {
        return;
    }

    @ViewChild('infoWind') openInfoWindow: google.maps.InfoWindow | AgmInfoWindow;
    openInfoWindowWaypoint: Waypoint;
    openThisWaypoint(wp: Waypoint): void {
        this.openInfoWindowWaypoint = wp;
        setTimeout(() => {
            this.openInfoWindow?.open();
        });
    }

    ngAfterViewInit(): void {
        // marker is 27x43
        // latitude * 111139 = meters
        const s = this.agm.mapReady.subscribe((map) => this.setMapBounds(map));
        this.subscriptions.push(s);
        if (this.shouldWatchBounds) {
            this.watchBounds();
        }
        setInterval(async () => {
            // console.log('fit bounds');
            // let a = this.agm._mapsWrapper.getBounds();
            // console.log(await a);
        }, 2000);
    }
    ngOnChanges(changes: SimpleChanges): void {
        // TODO don't set map bounds if its not a new list
        if (changes.shouldWatchBounds && !changes.shouldWatchBounds.firstChange) {
            if (changes.shouldWatchBounds.currentValue) {
                this.agm._mapsWrapper.getBounds().then((mapBounds) => {
                    this.setPaddedBounds(mapBounds);
                    this.setWaypointsOnMap(this.paddedBounds);
                });
                this.watchBounds();
            } else {
                this.waypointsOnMap = undefined;
                this.idleTimer = undefined;
                this.watchBoundsSubscription.unsubscribe();
            }
        }

        if (changes.waypoints && !changes.waypoints.firstChange) {
            const prev = changes.waypoints.previousValue;
            const current: Waypoint[] = changes.waypoints.currentValue;
            const allWaypointsGone = current.length === 0;
            const allWaypointsNew = prev.length === 0;
            const fromSameList = current.some((e) =>
                prev.map((e) => e.waypointId).includes(e.waypointId)
            );
            // if listId is letter or 0
            if (!Number(current[0]?.waypointListId)) {
                this.setMapBounds(this.agm._mapsWrapper);
                return;
            }
            if (allWaypointsGone) {
                if (this.shouldWatchBounds) {
                    this.waypointsOnMap = [];
                }
            } else if (allWaypointsNew || !fromSameList) {
                this.setMapBounds(this.agm._mapsWrapper);
            } else {
                if (this.shouldWatchBounds) {
                    if (!this.paddedBounds) console.error('no padded bounds');
                    this.setWaypointsOnMap(this.paddedBounds);
                }
            }
        }
    }

    watchBoundsSubscription: Subscription;
    paddedBounds;
    idleTimer;
    setPaddedBounds = (mapBounds: google.maps.LatLngBounds): void => {
        const NE = mapBounds.getNorthEast();
        const SW = mapBounds.getSouthWest();
        const average_lng = (NE.lat() + SW.lat()) / 2;
        const meters_per_pixel =
            (156543.03392 * Math.cos((average_lng * Math.PI) / 180)) / Math.pow(2, this.zoom);
        const marker_height_meters = 43 * meters_per_pixel;
        const marker_width_meters = 27 * meters_per_pixel;
        const latToChange = marker_height_meters / 111139;
        const lngToChange = marker_width_meters / 111139;
        const bounds: google.maps.LatLngBounds = new google.maps.LatLngBounds();
        bounds.extend({
            lat: SW.lat(),
            lng: SW.lng() + lngToChange / 1,
        });
        bounds.extend({
            lat: NE.lat() - latToChange,
            lng: NE.lng() - lngToChange / 1,
        });
        this.paddedBounds = bounds;
    };
    watchBounds(): void {
        // On map means marker is mostly on map
        this.watchBoundsSubscription = this.agm.boundsChange.subscribe((event) => {
            if (!this.idleTimer) {
                this.idleTimer = setTimeout(() => {
                    this.setPaddedBounds(event);
                    this.setWaypointsOnMap(this.paddedBounds);
                });
            } else {
                clearTimeout(this.idleTimer);
                this.idleTimer = setTimeout(() => {
                    this.setPaddedBounds(event);
                    this.setWaypointsOnMap(this.paddedBounds);
                }, 200);
            }
            // // @ts-ignore
            // let b = this.agmMap._mapsWrapper.getBounds();
        });
        this.subscriptions.push(this.watchBoundsSubscription);
    }
    setWaypointsOnMap(bounds: google.maps.LatLngBounds): void {
        this.waypointsOnMap = [];
        for (const wp of this.waypoints) {
            if (bounds.contains(new google.maps.LatLng(wp.latitude, wp.longitude))) {
                this.waypointsOnMap.push(wp);
                // wp.name = 'MAP';
            } else {
                // wp.name = 'NOT';
            }
        }
        console.log('emitting: ' + this.waypointsOnMap.length);
        this.BoundsChange.emit(this.waypointsOnMap);
    }

    setMapBounds(map: google.maps.Map): void {
        if (this.mini) this.zoom = 13;
        const bounds: google.maps.LatLngBounds = new google.maps.LatLngBounds();
        if (!this.waypoints?.length) {
            bounds.extend(new google.maps.LatLng(44, -89));
            bounds.extend(new google.maps.LatLng(46, -91));
        } else {
            for (const mm of this.waypoints) {
                bounds.extend(new google.maps.LatLng(mm.latitude, mm.longitude));
            }
            if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
                const extendPoint1 = new google.maps.LatLng(
                    bounds.getNorthEast().lat() + 0.01,
                    bounds.getNorthEast().lng() + 0.01
                );
                const extendPoint2 = new google.maps.LatLng(
                    bounds.getNorthEast().lat() - 0.01,
                    bounds.getNorthEast().lng() - 0.01
                );
                bounds.extend(extendPoint1);
                bounds.extend(extendPoint2);
            }
        }
        map.fitBounds(bounds);
    }

    openWaypointInfoWindow(wp: Waypoint): void {
        this.openThisWaypoint(wp);
        this.centerMapOnWaypoint(wp);
    }

    // openInfoWindow(infoWindow: google.maps.InfoWindow | AgmInfoWindow): void {
    //     if (this.prevInfoWindow) this.prevInfoWindow.close();
    //     infoWindow.open();
    //     this.prevInfoWindow = infoWindow;
    // }

    closeFromWelcome(): void {
        this.openInfoWindowWaypoint = undefined;
    }

    centerMapOnCoords(lat: number, lon: number): void {
        this.lat = lat;
        this.lon = lon;

        // uses a private method
        // @ts-ignore
        this.agm._setCenter();
    }
    centerMapOnWaypoint(wp: Waypoint): void {
        if (this.agm.zoom < 13) {
            this.zoom = 13;
        }
        this.lat = wp.latitude;
        this.lon = wp.longitude;
        // uses a private method
        // @ts-ignore
        this.agm._setCenter();
    }

    toggleClusters(): void {
        this.useClusters = !this.useClusters;
    }

    editWaypoint(wp: Waypoint): void {
        this.EditWaypoint.emit(wp);
        this.openInfoWindowWaypoint = undefined;
    }

    applyNavionics(event?: google.maps.Map): void {
        if (!this.navionEvent) this.navionEvent = event;
        this.navionics_nauticalchart_layer = new JNC.Google.NavionicsOverlay({
            navKey: 'Navionics_webapi_00713',
            chartType: JNC.Google.NavionicsOverlay.CHARTS.SONAR,
            depthUnit: JNC.DEPTH_UNIT.FEET,
        });

        this.overlays = event.overlayMapTypes;
        if (this.useNavionics) {
            this.overlays.insertAt(0, this.navionics_nauticalchart_layer);
        }
    }
    @ViewChildren('markerCard') markerCard;
    onRightClick(event: CoordsClick): void {
        this.markerCard.changes.pipe(take(1)).subscribe((a) => {
            setTimeout(() => {
                // a.last.dblClickSymbol();
                a.last.dblClickTitle();
            }, 500);
        });
        const newWp: Waypoint = {
            name: 'New Waypoint',
            latitude: event.coords.lat,
            longitude: event.coords.lng,
            symbol: 'Waypoint',
            waypointId: '0',
        };
        this.waypoints.unshift(newWp);
        this.WaypointEdited.emit(newWp);
        this.openThisWaypoint(this.waypoints[0]);
        // return false;
    }

    onZoomChanged(zoom: number): void {
        this.zoom = zoom;
    }

    updateNavionics(): void {
        this.useNavionics = !this.useNavionics;
        if (this.useNavionics) {
            this.overlays.insertAt(0, this.navionics_nauticalchart_layer);
        } else {
            this.overlays.removeAt(0);
        }
    }

    clickTimerRef;
    handleMapClick(): void {
        this.clickTimerRef = setTimeout(() => {
            if (this.clickTimerRef) this.toggleControls();
        }, 200);
    }

    handleMapDblClick(): void {
        this.clickTimerRef = null;
    }

    clusterClick(): void {
        this.clickTimerRef = null;
    }

    toggleControls(): void {
        this.LeftClick.emit();
    }

    currentLocation: Coordinates;
    showCurrentLocation: boolean;
    currentCenteredOnce = false;
    public startCurrentLocation(): void {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentLocation = position.coords;
                    this.showCurrentLocation = true;
                    setTimeout(() => {
                        this.currentLocation = undefined;
                    }, 12500);
                    this.centerMapOnCoords(position.coords.latitude, position.coords.longitude);
                },
                () => {
                    alert('location not available');
                    this.NoLocation.emit();
                }
            );
        } else {
            alert('location not available');
            this.NoLocation.emit();
        }
    }

    addCurrentLocation(): void {
        const date = new Date();
        const dateFormatted = format(date, 'MMMdHHmmss');
        const newWp: Waypoint = {
            name: dateFormatted,
            latitude: this.currentLocation.latitude,
            longitude: this.currentLocation.longitude,
            symbol: 'waypoint',
            waypointId: '0',
        };
        this.EditWaypoint.emit(newWp);
    }

    saveName(wp: Waypoint): void {
        this.WaypointEdited.emit(wp);
    }

    latHold: number;
    lonHold: number;
    waypointBeingDragged: Waypoint;
    dragStart(event: CoordsClick, wp: Waypoint): void {
        this.waypointBeingDragged = wp;
        this.latHold = wp.latitude;
        this.lonHold = wp.longitude;
        wp.latitude = undefined;
        wp.longitude = undefined;
    }
    dragEnd(event: CoordsClick, wp: Waypoint): void {
        if (!this.dragMarkers) {
            this.snackBar.dismiss();
            setTimeout(() => {
                this.dragMarkers = true;
                setTimeout(() => {
                    this.dragMarkers = false;
                });
            });
        }
        if (this.waypointBeingDragged) {
            wp.latitude = event.coords.lat;
            wp.longitude = event.coords.lng;
            this.WaypointEdited.emit(this.waypointBeingDragged);
        } else {
            wp.latitude = this.latHold;
            wp.longitude = this.lonHold;
        }
        this.latHold = undefined;
        this.lonHold = undefined;
        this.waypointBeingDragged = undefined;
    }

    @HostListener('window:keyup', ['$event'])
    keyUpEvent(event: KeyboardEvent): void {
        const { key, target } = event;
        // so you can still type in input boxes
        if ((<HTMLInputElement>target).tagName === 'INPUT') {
            return;
        }
        if (key === 't') {
            this.snackBar.dismiss();
            if (this.waypointBeingDragged) {
                this.snackBar.open('Drag mode cancelled');
            }
            this.dragMarkers = false;
            this.waypointBeingDragged = undefined;
        }
    }
    @HostListener('window:keypress', ['$event'])
    keyDownEvent(event: KeyboardEvent): void {
        const { key, target } = event;
        if ((<HTMLInputElement>target).tagName === 'INPUT') {
            return;
        }
        if (this.permits.wpEdit && !this.dragMarkers && key === 't') {
            this.snackBar.open('Drag Mode On');
            this.dragMarkers = true;
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub?.unsubscribe());
    }
}
