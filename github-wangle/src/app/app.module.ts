import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { MaterialModule } from './material/material.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WaypointRepoService } from './services/WaypointRepoService';
import { NotificationService } from './services/NotificationService';
import { ValidationService } from './services/ValidationService';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StateService } from './state.service';
import { NavComponent } from './nav/nav.component';
import { WelcomeComponent } from './full/welcome.component';
import { MapComponent } from './components/map/map.component';
import { AgmCoreModule } from '@agm/core';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';
import { GoogleApiKey } from 'src/sensitive';
import { ListsComponent } from './components/lists/lists.component';
import { PointsComponent } from './components/points/points.component';
import { LongitudePipe } from './pipes/longitude.pipe';
import { LatitudePipe } from './pipes/latitude.pipe';
import { OrdinateComponent } from './components/coordinate/ordinate/ordinate.component';
import { CoordinateComponent } from './components/coordinate/coordinate.component';
import { EditWaypointComponent } from './full/edit/edit-waypoint.component';
import { EditWaypointListComponent } from './full/edit/edit-waypoint-list.component';
import { CompareComponent } from './full/compare/compare.component';
import { InvalidImportsComponent } from './full/compare/invalid-imports/invalid-imports.component';
import { PartialMatchComponent } from './full/compare/partial-match.component';
import { OnlyImportComponent } from './full/compare/only-import.component';
import { ExactMatchComponent } from './full/compare/exact-match.component';
import { FormsModule } from '@angular/forms';
import { ToolsComponent } from './tools/tools.component';
import { ConvertComponent } from './tools/convert/convert.component';
import { ConvertDialogComponent } from './components/convert-dialog/convert-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FlexLayoutModule } from '@angular/flex-layout';
import { InterceptorService } from './auth/interceptor.service';
import { HomeComponent } from './welcome/home/home.component';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { AlertDialogComponent } from './components/alert-dialog/alert-dialog.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { SharedService } from './shared.service';
import { appRoutes } from '../routes';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { ReturnDeviceNamePipe } from './pipes/return-device-name.pipe';
import { FilterPipe } from './pipes/compare-filter.pipe';
import { DownloadModalComponent } from './components/download-modal/download-modal.component';
import { PointsDragComponent } from './components/points/points-drag.component';
import { PointsSheetComponent } from './components/points/points-sheet.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ModalModule } from 'ng-modal-lib';
import { MiniComponent } from './components/map/mini.component';
import { GeolocationService } from './services/geolocation.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { ManageListsComponent } from './full/manage-lists/manage-lists.component';
import { TableManageComponent } from './full/manage-lists/table-manage.component';
import { ListsTableComponent } from './components/lists/lists-table/lists-table.component';
import { AdminComponent } from './admin/admin.component';
import { AutoFocusDirective } from './auto-focus.directive';
import { UploadBtnComponent } from './components/upload-btn/upload-btn.component';
import { DuplicatesDialogComponent } from './components/duplicates-dialog/duplicates-dialog.component';
@NgModule({
    declarations: [
        AppComponent,
        NavComponent,
        WelcomeComponent,
        HomeComponent,
        MapComponent,
        ListsComponent,
        PointsComponent,
        CoordinateComponent,
        OrdinateComponent,
        EditWaypointComponent,
        EditWaypointListComponent,
        CompareComponent,
        ExactMatchComponent,
        PartialMatchComponent,
        OnlyImportComponent,
        InvalidImportsComponent,
        ToolsComponent,
        ConvertComponent,
        ConvertDialogComponent,
        AlertDialogComponent,
        LatitudePipe,
        LongitudePipe,
        FilterPipe,
        ReturnDeviceNamePipe,
        DownloadModalComponent,
        PointsDragComponent,
        PointsSheetComponent,
        MiniComponent,
        ManageListsComponent,
        TableManageComponent,
        ListsTableComponent,
        AdminComponent,
        AutoFocusDirective,
        UploadBtnComponent,
        DuplicatesDialogComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatDialogModule,
        RouterModule.forRoot(appRoutes),
        FormsModule,
        MaterialModule,
        AgmCoreModule.forRoot({
            apiKey: GoogleApiKey,
        }),
        AgmJsMarkerClustererModule,
        FontAwesomeModule,
        HttpClientModule,
        FlexLayoutModule,
        DeviceDetectorModule.forRoot(),
        MatBottomSheetModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        DragDropModule,
        ModalModule,
    ],
    providers: [
        AuthService,
        AuthGuard,
        InterceptorService,
        WaypointRepoService,
        NotificationService,
        ValidationService,
        StateService,
        SharedService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: InterceptorService,
            multi: true,
        },
        MapComponent,

        GeolocationService,
    ],
    bootstrap: [AppComponent],
    entryComponents: [ConvertDialogComponent, PointsComponent],
})
export class AppModule {}
