/* eslint-disable indent */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'latitude',
})
export class LatitudePipe implements PipeTransform {
    transform(value: number, ...args: unknown[]): string {
        let lon, d, m, s;
        switch (args[0]) {
            case 'ddm': // decimal degree minutes
                lon = value * Math.sign(value);
                return `${Math.floor(lon)}\xB0 ${parseFloat(
                    ((lon - Math.floor(lon)) * 60).toFixed(7)
                )}' ${Math.sign(value) + 1 ? 'N' : 'S'}`;
                break;
            case 'dms': //degrees minutes seconds
                lon = value * Math.sign(value);
                d = Math.floor(lon);
                m = Math.floor((lon - d) * 60);
                s = Math.round((lon - d - m / 60) * 60 * 60);
                // Check this
                return `${d}\xB0 ${m}' ${s}" ${Math.sign(value) + 1 ? 'N' : 'S'}`;
                break;

            default:
                return `${value}\xB0`;
        }
    }
}
