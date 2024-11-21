import {TestBed} from '@angular/core/testing';
import {InductiveMinerService} from './inductive-miner.service';
import {EventLog} from '../classes/event-log/event-log';
import {Trace} from '../classes/event-log/trace';
import {TraceEvent} from '../classes/event-log/trace-event';

describe('InductiveMinerService', () => {
    let service: InductiveMinerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(InductiveMinerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return two valid Eventlogs when a sequence cut is made', () => {
        /**
         * ABD
         * ACD
         * ABCD
         * ACBD
         */
        const eventlog: EventLog = new EventLog([ 
                                        new Trace([new TraceEvent("A"),new TraceEvent("B"),new TraceEvent("D")]),
                                        new Trace([new TraceEvent("A"),new TraceEvent("C"),new TraceEvent("D")]),
                                        new Trace([new TraceEvent("A"),new TraceEvent("B"),new TraceEvent("C"),new TraceEvent("D")]),
                                        new Trace([new TraceEvent("A"),new TraceEvent("C"),new TraceEvent("B"),new TraceEvent("D")])
                                    ]);

                                    
        // 1. Sequence cut: A-->
        const edge1: Trace[] = [
                                new Trace(
                                    [new TraceEvent("A"), new TraceEvent("B")]),
                                new Trace(
                                    [new TraceEvent("A"), new TraceEvent("C")])
                            ]

        const resultA: EventLog[] = service.applyInductiveMiner(eventlog, edge1);
        expect(resultA.length).toBe(2);

        // Checks for A1
        // Expect every Trace in A1 to be of length "1" and contain only TraceEvent "A"
        for (const cTrace of resultA[0].traces) {
            expect(cTrace.events.length).toBe(1);
            for (const cTraceEvent of cTrace.events) {
                expect(cTraceEvent.conceptName).toBe("A");
            }
        }

        // Checks for A2
        expect(resultA[1].traces[0].events[0].conceptName).toBe("B")
        expect(resultA[1].traces[0].events[1].conceptName).toBe("D")

        expect(resultA[1].traces[1].events[0].conceptName).toBe("C")
        expect(resultA[1].traces[1].events[1].conceptName).toBe("D")

        expect(resultA[1].traces[2].events[0].conceptName).toBe("B")
        expect(resultA[1].traces[2].events[1].conceptName).toBe("C")
        expect(resultA[1].traces[2].events[2].conceptName).toBe("D")

        expect(resultA[1].traces[3].events[0].conceptName).toBe("C")
        expect(resultA[1].traces[3].events[1].conceptName).toBe("B")
        expect(resultA[1].traces[3].events[2].conceptName).toBe("D")
        


        // 2. Sequence cut: B-->D / C-->D
        const edge2: Trace[] = [
            new Trace(
                [new TraceEvent("B"), new TraceEvent("D")]),
            new Trace(
                [new TraceEvent("C"), new TraceEvent("D")])
        ]

        const resultB: EventLog[] = service.applyInductiveMiner(eventlog, edge2);
        expect(resultB.length).toBe(2);

        // Checks for A1
        expect(resultB[0].traces[0].events[0].conceptName).toBe("A")
        expect(resultB[0].traces[0].events[1].conceptName).toBe("B")

        expect(resultB[0].traces[1].events[0].conceptName).toBe("A")
        expect(resultB[0].traces[1].events[1].conceptName).toBe("C")

        expect(resultB[0].traces[2].events[0].conceptName).toBe("A")
        expect(resultB[0].traces[2].events[1].conceptName).toBe("B")
        expect(resultB[0].traces[2].events[2].conceptName).toBe("C")

        expect(resultB[0].traces[3].events[0].conceptName).toBe("A")
        expect(resultB[0].traces[3].events[1].conceptName).toBe("C")
        expect(resultB[0].traces[3].events[2].conceptName).toBe("B")

        // Checks for A2
        // Expect every Trace in A2 to be of length "1" and contain only TraceEvent "D"
        for (const cTrace of resultB[1].traces) {
            expect(cTrace.events.length).toBe(1);
            for (const cTraceEvent of cTrace.events) {
                expect(cTraceEvent.conceptName).toBe("D");
            }
        }
    });

    it('should return two valid Eventlogs when a sequence cut is made', () => {


    });
});

