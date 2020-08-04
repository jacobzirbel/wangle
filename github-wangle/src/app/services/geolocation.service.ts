/* eslint-disable indent */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class GeolocationService {
    coordinates: Coordinates;

    public getPosition(): Observable<Position> {
        return Observable.create((observer) => {
            navigator.geolocation.watchPosition((pos: Position) => {
                observer.next(pos);
            }),
                () => {
                    console.warn('Position is not available');
                },
                {
                    enableHighAccuracy: true,
                };
        });
    }
}
