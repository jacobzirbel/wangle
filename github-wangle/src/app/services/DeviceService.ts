import { Injectable } from '@angular/core';
import { Device } from '../models/Device';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { baseUrl } from '../../sensitive';
import { deviceList } from './devices';
@Injectable({
    providedIn: 'root',
})
export class DeviceService {
    deviceList: Device[];
    currentDevice: Device;
    //"https://prowaypoint.azurewebsites.net/";
    constructor(private http: HttpClient) {
        this.deviceList = deviceList;
    }

    getDevices(): Observable<Device[]> {
        return this.http.get<Device[]>(baseUrl + 'api/SampleData/GetDevices');
    }
    getDeviceList(): Device[] {
        return this.deviceList;
    }
    getDevice(id: string): Device {
        this.currentDevice = deviceList.find((device) => device.id == id);
        return this.currentDevice;
    }
}
