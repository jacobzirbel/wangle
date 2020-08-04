import { Pipe, PipeTransform } from '@angular/core';
import { CompareWaypoint } from '../models/CompareWaypoint';
import { MatchType } from '../models/MatchType';

@Pipe({
    name: 'filter',
    pure: false,
})
export class FilterPipe implements PipeTransform {
    transform(value: [CompareWaypoint[], MatchType]): CompareWaypoint[] {
        if (value[1] === 'included') return value[0].filter((e) => e.included);
        return value[0].filter((e) => e.matchType === value[1]);
    }
}
