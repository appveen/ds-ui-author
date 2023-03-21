import { Component, Input, OnInit } from '@angular/core';
import { AppService } from 'src/app/utils/services/app.service';
import { MappingService } from '../mapping.service';

@Component({
  selector: 'odp-source-selector',
  templateUrl: './source-selector.component.html',
  styleUrls: ['./source-selector.component.scss']
})
export class SourceSelectorComponent implements OnInit {

  @Input() edit: any;
  @Input() index: number;
  @Input() nodeList: Array<any>;
  node: any
  inputSourceList: Array<any>;
  outputSourceList: Array<any>;
  toggle: any;
  constructor(private appService: AppService,
    private mappingService: MappingService) {
    this.nodeList = [];
    this.inputSourceList = [];
    this.outputSourceList = [];
    this.toggle = {};
    this.toggle['incoming'] = true;
    this.toggle['outgoing'] = true;
  }

  ngOnInit(): void {
    this.node = this.nodeList[this.index];
    if (this.node.dataStructure && this.node.dataStructure.incoming && this.node.dataStructure.incoming.definition) {
      let temp = this.appService.cloneObject(this.node.dataStructure.incoming.definition) || [];
      this.parseDefinition(this.node.dataStructure.incoming.formatType || 'JSON', temp, 'body');
      this.inputSourceList = temp;
    }
    if (this.node.dataStructure && this.node.dataStructure.outgoing && this.node.dataStructure.outgoing.definition) {
      let temp = this.appService.cloneObject(this.node.dataStructure.outgoing.definition) || [];
      this.parseDefinition(this.node.dataStructure.outgoing.formatType || 'JSON', temp, 'responseBody');
      this.outputSourceList = temp;
    }
  }

  reCreatePaths() {
    this.mappingService.reCreatePaths.emit();
  }

  parseDefinition(type: string, definition: Array<any>, bodyKey: string, parentDef?: any) {
    if (definition && definition.length > 0) {
      definition.forEach((def: any) => {
        delete def._id;
        let dataPath = parentDef ? parentDef.dataPath + '.' + def.key : def.key;
        let nameAsDataPath = parentDef ? parentDef.name + '.' + def.properties.name : def.properties.name;
        if (def.key == '_self') {
          dataPath = parentDef ? parentDef.dataPath + '[#].' + def.key : def.key;
        }
        if (type == 'JSON') {
          def._id = this.node._id + '.' + bodyKey + '.' + dataPath;
        } else {
          def._id = this.node._id + '.' + bodyKey + '.' + nameAsDataPath;
        }
        def.nodeId = this.node._id;
        def.name = nameAsDataPath;
        if (type == 'JSON') {
          def.dataPath = dataPath;
          def.properties.dataPath = dataPath;
        } else {
          def.dataPath = nameAsDataPath;
          def.properties.dataPath = nameAsDataPath;
        }
        if (def.type == 'Array') {
          if (def.definition[0].type == 'Object') {
            this.parseDefinition(type, def.definition[0].definition, bodyKey, def)
          }
        } else if (def.type == 'Object') {
          this.parseDefinition(type, def.definition, bodyKey, def)
        }
      });
    }
  }
}
