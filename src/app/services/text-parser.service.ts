import {Injectable} from '@angular/core';
import {EventLog} from '../classes/event-log/event-log';
import {Trace} from '../classes/event-log/trace';
import {TraceEvent} from '../classes/event-log/trace-event';

@Injectable({
    providedIn: 'root'
})
export class TextParserService {

    constructor() {
    }

    parse(eventLog: string): EventLog {
        const sequences = eventLog.split('+');
        const traces = sequences.filter(element => element.length > 0).map(sequence => {
            const events = sequence.split(',').map(eventName => new TraceEvent(eventName.trim()));
            return new Trace(events);
        });
        return new EventLog(traces);
    }
}
