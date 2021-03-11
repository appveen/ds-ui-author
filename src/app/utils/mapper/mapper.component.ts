import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { AppService } from '../services/app.service';
import { Mapping, Definition } from './mapper.model';
import { EditConfig } from '../integration-flow/integration-flow.model';
import { MapperService } from './mapper.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'odp-mapper',
    templateUrl: './mapper.component.html',
    styleUrls: ['./mapper.component.scss']
})
export class MapperComponent implements OnInit {

    @Input() edit: EditConfig;
    @Input() toggleMapper: boolean;
    @Output() toggleMapperChange: EventEmitter<boolean>;
    @Input() commonSourceTarget: boolean;
    @Input() source: any;
    @Input() sourceType: string;
    @Input() destination: any;
    @Input() destinationType: string;
    @Input() xslt: any;
    @Output() xsltChange: EventEmitter<any>;
    @Output() mappingChange: EventEmitter<any>;
    mapping: Array<Mapping>;
    sourceDefinition: Definition[];
    sourceDefinitionFlat: Definition[];
    constructor(private appService: AppService,
        private mapperService: MapperService) {
        const self = this;
        self.toggleMapperChange = new EventEmitter<boolean>();
        self.xsltChange = new EventEmitter<any>();
        self.source = {};
        self.destination = {};
        self.sourceType = 'JSON';
        self.destinationType = 'JSON';
        self.mappingChange = new EventEmitter<any>();
        self.edit = {
            status: false
        };
    }

    ngOnInit() {
        const self = this;
        if (typeof self.source === 'string') {
            self.source = JSON.parse(self.source);
        }
        if (typeof self.destination === 'string') {
            self.destination = JSON.parse(self.destination);
        }
        this.appService.fixSchema(self.source);
        this.appService.fixSchema(self.destination);
        if (self.source) {
            self.sourceDefinition = self.mapperService.getSourceDefArray(self.source, self.sourceType, true);
            self.sourceDefinitionFlat = self.mapperService.getSourceDefArray(self.source, self.sourceType);
            if (self.xslt) {
                self.mapping = self.mapperService.getMappings(self.sourceDefinitionFlat, self.destination, self.xslt);
            } else {
                self.mapping = self.mapperService.getMappings(self.sourceDefinitionFlat, self.destination);
            }
        }
    }

    verticalLineClass(definition: Definition, depth: boolean, depthFirst: boolean, depthLast: boolean) {
        let style = [];
        if (definition.lastChild || definition.name === '_self') {
            style.push('h-50');
        } else {
            style = [];
            style.push('h-100');
        }
        if (!depth || (definition.name === '_self' && definition.lastChild && depthFirst && !depthLast)) {
            style.push('border-0');
        }
        if (definition.depth.length > 1 && depthFirst) {
            if (style.indexOf('h-50') > -1) {
                style.splice(style.indexOf('h-50'), 1);
            }
            style.push('h-100');
        }
        return style.join(' ');
    }

    done(flag: boolean) {
        const self = this;
        if (self.source && self.destination && flag) {
            const xslt = self.mapperService.getXSLT(self.mapping, self.sourceDefinitionFlat, self.destination);
            if (!environment.production) {
                console.log('XSLT', JSON.stringify(xslt, null, 2));
            }
            self.xsltChange.emit(xslt);
            self.mappingChange.emit(self.mapping);
        }
        self.toggleMapperChange.emit(false);
    }

}
