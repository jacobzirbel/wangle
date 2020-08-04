import { MatchType } from './MatchType';
import { Waypoint } from './Waypoint';
import { ValidationObject } from '../services/ValidationService';

export interface CompareWaypoint {
    matchType: MatchType;
    wp1: Waypoint;
    wp2: Waypoint;
    included: boolean;
    valid?: ValidationObject;
}
