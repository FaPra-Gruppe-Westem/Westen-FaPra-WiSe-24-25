import {Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild} from '@angular/core';
import {DisplayService} from '../../services/display.service';
import {catchError, of, Subscription, take} from 'rxjs';
import {SvgService} from '../../services/svg.service';
import {ExampleFileComponent} from "../example-file/example-file.component";
import {FileReaderService} from "../../services/file-reader.service";
import { HttpClient } from "@angular/common/http";
import { EventLog } from 'src/app/classes/Datastructure/event-log/event-log';
import { InductivePetriNet } from 'src/app/classes/Datastructure/InductiveGraph/inductivePetriNet';

@Component({
    selector: 'app-display',
    templateUrl: './display.component.html',
    styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnDestroy {

    @ViewChild('drawingArea') drawingArea: ElementRef<SVGElement> | undefined;

    @Output('fileContent') fileContent: EventEmitter<string>;

    private _sub: Subscription;
    private _petriNet: InductivePetriNet | undefined;

    constructor(private _svgService: SvgService,
                private _displayService: DisplayService,
                private _fileReaderService: FileReaderService,
                private _http: HttpClient) {

        this.fileContent = new EventEmitter<string>();

        this._sub  = this._displayService.InductivePetriNet$.subscribe(log => {

            this._petriNet = log;
            this.draw();
        });
    }

    ngOnDestroy(): void {
        this._sub.unsubscribe();
        this.fileContent.complete();
    }

    public processDropEvent(e: DragEvent) {
        e.preventDefault();

        const fileLocation = e.dataTransfer?.getData(ExampleFileComponent.META_DATA_CODE);

        if (fileLocation) {
            this.fetchFile(fileLocation);
        } else {
            this.readFile(e.dataTransfer?.files);
        }
    }

    public prevent(e: DragEvent) {
        // dragover must be prevented for drop to work
        e.preventDefault();
    }

    private fetchFile(link: string) {
        this._http.get(link,{
            responseType: 'text'
        }).pipe(
            catchError(err => {
                console.error('Error while fetching file from link', link, err);
                return of(undefined);
            }),
            take(1)
        ).subscribe(content => {
            this.emitFileContent(content);
        })
    }

    private readFile(files: FileList | undefined | null) {
        if (files === undefined || files === null || files.length === 0) {
            return;
        }
        this._fileReaderService.readFile(files[0]).pipe(take(1)).subscribe(content => {
            this.emitFileContent(content);
        });
    }

    private emitFileContent(content: string | undefined) {
        if (content === undefined) {
            return;
        }
        this.fileContent.emit(content);
    }

    private draw() {
        if (this.drawingArea === undefined) {
            console.debug('drawing area not ready yet')
            return;
        }

        this.clearDrawingArea();
        const petriGraph = this._petriNet?.getSVGRepresentation();
        
        //petriGraph = {(places), (transitions), arcs, (dfgs)}
        if (petriGraph && Array.isArray(petriGraph)) {  // or ensure it's an iterable
            try {
                for (const node of petriGraph) {
                    this.drawingArea.nativeElement.appendChild(node);
                }
            } catch (error) {
                console.error("Error appending petriGraph:", error);
            }
        } else {
            console.warn("No valid petriGraph found to append.");
        }
    }

    private clearDrawingArea() {
        const drawingArea = this.drawingArea?.nativeElement;
        if (drawingArea?.childElementCount === undefined) {
            return;
        }

        while (drawingArea.childElementCount > 0) {
            drawingArea.removeChild(drawingArea.lastChild as ChildNode);
        }
    }
}
