/* eslint-disable no-useless-escape */
import { Injectable } from '@angular/core';
import { Waypoint } from '../../app/models/';
import { DeviceService } from '../services/DeviceService';

export class ValidationObject {
    constructor(startValid = true) {
        this.valid = startValid;
    }
    public nameValid: boolean;
    public latValid: boolean;
    public lonValid: boolean;
    public symbolValid: boolean;
    public valid;
}

@Injectable()
export class ValidationService {
    public maxName = 100;
    public symbolsArray: string[];

    constructor(private deviceService: DeviceService) {}

    validate(wp: Waypoint, deviceId: string): ValidationObject {
        const allowedSymbols = this.getAllowedSymbols(deviceId);
        const device = this.deviceService.getDevice(deviceId);
        const ret = {
            nameValid: this.validateName(
                wp.name,
                // TODO add these in db
                device.waypointAllowedCharacters,
                device.maxWaypointNameLength || 20
            ),
            latValid: this.validateLatitude(wp.latitude),
            lonValid: this.validateLongitude(wp.longitude),
            symbolValid: this.validateSymbol(allowedSymbols, wp.symbol),
            get valid() {
                return this.nameValid && this.latValid && this.lonValid && this.symbolValid;
            },
        };

        return ret;
    }

    validateName(name: string, pattern: string, max: number): boolean {
        // Need to change waypointAllowedCharacters in db
        const regExp = RegExp(/^[a-zA-Z0-9\s\.`'/()]+$/);

        return regExp.test(name) && name.length < max && name.length > 0;
    }

    validateLatitude(lat: number): boolean {
        return Math.abs(lat) <= 90;
    }

    validateLongitude(lon: number): boolean {
        return Math.abs(lon) <= 180;
    }
    validateSymbol(allowed: string[], sym: string): boolean {
        if (allowed.length === 0) return true;
        if (sym === '') return true;
        if (allowed.includes(sym)) return true;
        return false;
    }
    onlyAlphaNumeric(s: string): boolean {
        return /^[a-zA-Z0-9\s\/\-\']+$/.test(s);
    }
    onlyNumber(s: string): boolean {
        return /^[0-9\.\-]*$/.test(s);
    }

    getAllowedSymbols(deviceId?: string): string[] {
        if (deviceId == '0') {
            return [...this.getAllowedSymbols('1'), ...this.getAllowedSymbols('2')];
        }
        return this.deviceService
            .getDeviceList()
            .find((d) => d.id == deviceId)
            .symbols.map((e) => e.name);
    }
}
