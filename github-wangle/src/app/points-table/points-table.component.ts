// import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
// import { MatPaginator } from '@angular/material/paginator';
// import { MatSort } from '@angular/material/sort';
// import { MatTable } from '@angular/material/table';
// import { PointsTableDataSource, Waypoint } from './points-table-datasource';

// @Component({
//   selector: 'app-points-table',
//   templateUrl: './points-table.component.html',
//   styleUrls: ['./points-table.component.css'],
// })
// export class PointsTableComponent implements AfterViewInit, OnInit {
//   @ViewChild(MatPaginator) paginator: MatPaginator;
//   @ViewChild(MatSort) sort: MatSort;
//   @ViewChild(MatTable) table: MatTable<Waypoint>;
//   dataSource: PointsTableDataSource;

//   /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
//   displayedColumns = ['name', 'latitude', 'longitude', 'symbol'];

//   ngOnInit() {
//     this.dataSource = new PointsTableDataSource();
//   }

//   ngAfterViewInit() {
//     this.dataSource.sort = this.sort;
//     this.dataSource.paginator = this.paginator;
//     this.table.dataSource = this.dataSource;
//   }
// }
