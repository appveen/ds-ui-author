import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import * as Fuse from 'fuse.js';

import { AppService } from '../services/app.service';
import { Mapping, Definition } from './mapper.model';
import { EditConfig } from '../integration-flow/integration-flow.model';

@Component({
    selector: 'odp-mapper',
    templateUrl: './mapper.component.html',
    styleUrls: ['./mapper.component.scss']
})
export class MapperComponent implements OnInit, AfterViewInit {

    @Input() edit: EditConfig;
    @Input() toggleMapper: boolean;
    @Output() toggleMapperChange: EventEmitter<boolean>;
    @Input() commonSourceTarget: boolean;
    @Input() source: any;
    @Input() sourceType: string;
    @Input() destination: any;
    @Input() destinationType: string;
    @Input() mapping: Array<Mapping>;
    @Output() mappingChange: EventEmitter<Array<Mapping>>;
    @Input() xslt: any;
    @Output() xsltChange: EventEmitter<any>;
    mappings: Mapping[];
    destMappings: Mapping[];
    sourceDefinition: Definition[];
    destDefinition: Definition[];
    flatdestination: any;
    draggedItem: Definition;
    clickedItemKeys = [];
    toFormulaBuilder: string;
    formula: any;
    isEdit: boolean;
    toggleFormulaBuilder: boolean;
    clickedMapping: Mapping;
    sourceHasRoot: boolean;
    destinationHasRoot: boolean;
    sourceDefArray: Definition[];
    rootDataKey: string;
    constructor(private appService: AppService) {
        const self = this;
        self.toggleMapperChange = new EventEmitter<boolean>();
        self.mappingChange = new EventEmitter<any>();
        self.xsltChange = new EventEmitter<any>();
        self.source = {};
        self.destination = {};
        self.flatdestination = {};
        self.sourceType = 'JSON';
        self.destinationType = 'JSON';
        self.sourceDefArray = [];
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
        if (self.source) {
            const keys = Object.keys(self.source);
            if ((keys.length === 1
                && keys.find(e => self.source[e].type === 'Object')
                && keys.indexOf('$headers') === -1)
                || (keys.length === 2
                    && keys.indexOf('$headers') > -1
                    && keys.find(e => self.source[e].type === 'Object'))) {
                if (self.sourceType === 'XML' || self.sourceType === 'JSON') {
                    self.rootDataKey = keys.filter(e => e.indexOf('$headers') === -1)[0];
                    self.sourceHasRoot = true;
                } else {
                    self.sourceHasRoot = false;
                }
            }
            self.sourceDefinition = self.parseDefinition(self.source, 'source');
        }
        if (self.destination) {
            const tempArr = Object.keys(self.destination).filter(e => self.destination[e].type === 'Object');
            if ((Object.keys(self.destination).length === 1 && tempArr && tempArr.length === 1)
                || (Object.keys(self.destination).length === 2
                    && Object.keys(self.destination).indexOf('$headers') > -1
                    && tempArr && tempArr.length === 2)) {
                if (self.destinationType === 'XML' || self.destinationType === 'JSON') {
                    self.destinationHasRoot = true;
                } else {
                    self.destinationHasRoot = false;
                }
            }
            self.destDefinition = self.parseDefinition(self.destination, 'dest');
        }
        if (self.mapping && self.mapping.length > 0) {
            self.destMappings.forEach(e => {
                if (!e.source) {
                    e.source = [];
                }
                if (self.xslt) {
                    const f = self.appService.getValue(e.target.path, self.xslt);
                    if (f) {
                        e.target.properties.operation = f.properties.operation;
                        e.target.properties._args = f.properties._args;
                    }
                }
                const temp = self.mapping.find(x => x.target.path === e.target.path);
                if (temp && temp.source && temp.source.length > 0) {
                    if (e.source.length > 0) {
                        e.source.pop();
                    }
                    temp.source.forEach(r => {
                        const t = Definition.getInstance();
                        t.patch(r);
                        e.source.push(t);
                    });
                }
            });
        }
        if (self.destination) {
            self.flatdestination = self.appService.flattenObject(self.destination);
            if (self.destination._id) {
                self.flatdestination['_id.type'] = 'String';
            }
        }
    }

    ngAfterViewInit() {
        const self = this;
    }

    dragEvent(event, def) {
        const self = this;
        event.dataTransfer.effectAllowed = 'move';
        self.draggedItem = def;
    }

    /**
     *
     * @param event Drop Event
     * @param droppedDef Dropped Definition
     * @param mapping Mapping Object
     * @description After a drop we copy the content of selected definition to the source element of dropped mapping
     */
    dropEvent(event, droppedDef: Definition, mapping: Mapping, mappingIndex: number) {
        const self = this;
        if (event.target.classList.contains('field-placeholder')) {
            event.target.classList.remove('over');
        }
        if (self.draggedItem) {
            if (!droppedDef.valid) {
                droppedDef.patch(self.draggedItem);
            } else {
                const temp = Definition.getInstance();
                temp.patch(self.draggedItem);
                mapping.source.pop();
                mapping.source.push(temp);
            }
            self.draggedItem = null;
        }
    }

    dragOverEvent(event) {
        event.preventDefault();
    }

    dragEnterEvent(event, mapping: Mapping) {
        if (event.target.classList.contains('field-placeholder') && !event.target.classList.contains('disabled')) {
            if (!event.target.classList.contains('mapped')) {
                event.target.classList.add('over');
            } else {
                mapping.source.push(Definition.getInstance());
            }
        }
    }

    dragLeaveEvent(event, mapping: Mapping) {
        if (event.target.classList.contains('field-placeholder') && !event.target.classList.contains('disabled')) {
            if (!event.target.classList.contains('mapped')) {
                event.target.classList.remove('over');
            } else {
                mapping.source.pop();
            }
        }
    }

    /**
     *
     * @param mapping Mapping Object
     * @param index Index of Mapping Object
     * @description This method removes the source from the mapping by removing the source definition object from the source array,
     * if array is empty we put and empty definition
     */
    removeMapping(mapping: Mapping, index: number, mappingIndex: number) {
        const self = this;
        mapping.source.splice(index, 1);
        mapping.target.properties.operation = '';
        delete mapping.target.properties._args;
        if (mapping.source.length === 0) {
            mapping.source.push(Definition.getInstance());
        }
    }
    /**
     *
     * @param definition Definiton
     * @param depth Depth of definition
     * @param depthFirst If its the first child
     * @param depthLast If its the last child
     * @description This method return proper class required to either print or hide vertical lines for complex structure
     */
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
            const xslt = self.getXSLT();
            self.xsltChange.emit(xslt);
            self.mappingChange.emit(self.destMappings);
        }
        self.toggleMapperChange.emit(false);
    }

    findRootAndPatchPath(index: number, sourceDef: Definition) {
        const self = this;
        const currMapping = self.destMappings[index];
        if (index > 0 && currMapping.target.parent) {
            const rootMapping = self.destMappings.find(e => e.target.id === currMapping.target.parent);
            let tempIndex = index - 1;
            let targetParent = self.destMappings[tempIndex];
            while (tempIndex > 0 && targetParent.target.type !== 'Array') {
                tempIndex--;
                targetParent = self.destMappings[tempIndex];
            }
            let sourceParent = self.appService.findDefinition(self.sourceDefArray, sourceDef.parent);
            while (sourceParent && sourceParent.parent && sourceParent.name !== '_self') {
                sourceParent = self.appService.findDefinition(self.sourceDefArray, sourceParent.parent);
            }
            if (sourceParent && targetParent) {
                targetParent.target.properties.innerType = sourceDef.name === '_self' ? sourceDef.type : sourceParent.type;
                targetParent.target.properties.XPath = sourceParent.xpath;
            }
        }
    }

    findRootAndRemovePath(index: number) {
        const self = this;
        const currMapping = self.destMappings[index];
        if (index > 0 && currMapping.target.parent) {
            const rootMapping = self.destMappings.find(e => e.target.id === currMapping.target.parent);
            let tempIndex = index - 1;
            let targetParent = self.destMappings[tempIndex];
            while (tempIndex > 0 && targetParent.target.type !== 'Array') {
                tempIndex--;
                targetParent = self.destMappings[tempIndex];
            }
            if (targetParent) {
                delete targetParent.target.properties.innerType;
                delete targetParent.target.properties.XPath;
            }
        }
    }

    parseDefinition(definition: any, type: string, options?: any): Definition[] {
        if (typeof definition === 'string') {
            definition = JSON.parse(definition);
        }
        const self = this;
        if (!options) {
            options = {};
        }
        if (typeof definition === 'string') {
            definition = JSON.parse(definition);
        }
        const json: Definition[] = [];
        if (!definition) {
            return json;
        }
        const len = Object.keys(definition).length;
        Object.keys(definition).forEach((key, i) => {
            const tempDef: Definition = Definition.getInstance();
            const tempMap: Mapping = Mapping.getInstance();
            if (key === '_self') {
                tempDef.lastChild = options.lastChild;
            } else {
                tempDef.lastChild = len === (i + 1);
            }
            if (type === 'source') {
                tempDef.hasRoot = self.sourceHasRoot;
                tempDef.formatType = self.sourceType;
                if (!self.mappings) {
                    self.mappings = [];
                }
                self.mappings.push(tempMap);
            } else if (type === 'dest') {
                tempDef.formatType = self.destinationType;
                if (!self.destMappings) {
                    self.destMappings = [];
                }
                if (!self.isEdit) {
                    self.destMappings.push(tempMap);
                }
            }
            if (!definition[key].properties.name) {
                definition[key].properties.name = key;
            }
            if (!definition[key].properties.dataKey) {
                definition[key].properties.dataKey = key;
            }
            tempDef.id = self.appService.getUUID();
            tempDef.objKey = key;
            tempDef.key = options.prevKey ? options.prevKey + '.' + key : key;
            tempDef.path = options.path ? options.path + '.definition.' + key : key;
            tempDef.fullPath = options.fullPath ?
                (options.fullPath + '.definition.' + definition[key].properties.dataKey) : definition[key].properties.dataKey;
            tempDef.depth = options.prevKey ? options.prevKey.split('.') : [];
            const tempIndex = tempDef.depth.indexOf('_self');
            tempDef.depth = tempDef.depth.map(e => true);
            tempDef.parent = options.parent;
            if (type === 'source') {
                self.sourceDefArray.push(tempDef);
            }
            if (tempIndex > -1) {
                tempDef.depth[tempIndex - 1] = false;
                if (options.lastChild) {
                    tempDef.depth[0] = false;
                }
            }
            if (key === '_id') {
                tempDef.name = 'ID';
                tempDef.type = 'String';
                tempDef.properties = { name: 'ID' };
                tempDef.definition = [];
                tempDef.xpath = self.appService.getXPath(tempDef.fullPath, tempDef.type, tempDef.hasRoot, self.rootDataKey);
            } else {
                tempDef.name = definition[key].properties.name;
                tempDef.type = definition[key].type;
                tempDef.xpath = self.appService.getXPath(tempDef.fullPath, tempDef.type, tempDef.hasRoot, self.rootDataKey);
                tempDef.properties = self.appService.cloneObject(definition[key].properties);
                tempDef.definition = self.parseDefinition(definition[key].definition, type, {
                    prevKey: tempDef.key,
                    lastChild: tempDef.lastChild,
                    path: tempDef.path,
                    fullPath: tempDef.fullPath,
                    parentDefinition: tempDef,
                    parent: tempDef.id
                });
            }
            tempMap.target = tempDef;
            if (self.commonSourceTarget && !tempDef.isObject && !tempDef.isArray && tempDef.xpath.indexOf('$headers') === -1) {
                const sourceDef = self.sourceDefArray.find(e => e.path === tempDef.path);
                tempMap.source.push(sourceDef);
            } else {
                const fuse = new Fuse(self.sourceDefArray, {
                    caseSensitive: true,
                    keys: ['key', 'path']
                });
                const temp = fuse.search(tempDef.key);
                if (temp && temp.length > 0) {
                    temp.forEach(item => {
                        tempMap.source.push(item);
                    });
                } else {
                    tempMap.source.push(Definition.getInstance());
                }
            }
            json.push(tempDef);
        });
        return json;
    }

    getXSLT() {
        const self = this;
        self.destMappings.forEach((e, ei, ea) => {
            if (!e.target.isArray) {
                if (e.target.properties.operation) {
                    self.flatdestination[e.target.path + '.properties.operation'] = e.target.properties.operation;
                }
                if (!self.flatdestination[e.target.path + '.properties.operation'] && e.target.type !== 'Object') {
                    self.flatdestination[e.target.path + '.properties.operation'] = '';
                }
                if (e.target.properties._args && e.target.properties._args.length > 0) {
                    self.flatdestination[e.target.path + '.properties._args'] = e.target.properties._args;
                }
                e.source.forEach((s, si) => {
                    if (s.xpath && !self.flatdestination[e.target.path + '.properties.operation']) {
                        let tempIndex = ei - 1;
                        let targetParent = ea[tempIndex];
                        while (tempIndex > 0 && targetParent.target.type !== 'Array') {
                            tempIndex--;
                            targetParent = ea[tempIndex];
                        }
                        let sourceParent = self.appService.findDefinition(self.sourceDefArray, s.parent);
                        while (sourceParent && sourceParent.parent && sourceParent.name !== '_self') {
                            sourceParent = self.appService.findDefinition(self.sourceDefArray, sourceParent.parent);
                        }
                        if (sourceParent && targetParent) {
                            self.flatdestination[targetParent.target.path + '.properties.innerType']
                                = s.name === '_self' ? s.type : sourceParent.type;
                            self.flatdestination[targetParent.target.path + '.properties.XPath'] = sourceParent.xpath;
                        }
                        self.flatdestination[e.target.path + '.properties.innerType'] = s.type;
                        self.flatdestination[e.target.path + '.properties._args'] = [{
                            type: 'FIXED',
                            XPath: s.xpath,
                            innerType: s.type
                        }];
                    }
                });
            }
        });
        return self.appService.unFlattenObject(self.flatdestination);
    }

    openFormulaBuilder(mapping: Mapping) {
        const self = this;
        self.toggleFormulaBuilder = true;
        self.clickedMapping = mapping;
    }
}
