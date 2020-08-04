import { PipeTransform, Pipe } from '@angular/core';
import { DeviceService } from '../services/DeviceService';

@Pipe({
    name: 'returnDeviceName',
    pure: true,
})
export class ReturnDeviceNamePipe implements PipeTransform {
    constructor(private deviceService: DeviceService) {}

    transform(value: string): string {
        return this.returnDeviceName(value);
    }
    returnDeviceName(id: string): string {
        return this.deviceService.getDevice(id)?.name;
    }
}
