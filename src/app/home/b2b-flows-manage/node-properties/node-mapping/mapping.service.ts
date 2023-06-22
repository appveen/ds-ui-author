import { EventEmitter, Injectable } from '@angular/core';
import { CommonService } from '../../../../utils/services/common.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MappingService {

  selectedSourceNode: any;
  selectedTargetNode: any;
  reCreatePaths: EventEmitter<any>;
  deSelectPath: EventEmitter<any>;
  clearMappings: EventEmitter<any>;
  fuzzyMapping: EventEmitter<any>;
  addMethod: Subject<any> = new Subject();
  constructor() {
    this.reCreatePaths = new EventEmitter();
    this.deSelectPath = new EventEmitter();
    this.clearMappings = new EventEmitter();
    this.fuzzyMapping = new EventEmitter();
  }

  tryMapping() {
    if (this.selectedSourceNode && this.selectedTargetNode) {
      if (!this.selectedTargetNode.definition.source) {
        this.selectedTargetNode.definition.source = [];
      }
      let temp = {
        _id: this.selectedSourceNode.definition._id,
        type: this.selectedSourceNode.definition.type,
        dataPath: this.selectedSourceNode.definition.dataPath,
        nodeId: this.selectedSourceNode.node._id,
      }
      this.selectedTargetNode.definition.source.push(temp);
      if (!this.selectedTargetNode.definition.formula) {
        this.selectedTargetNode.definition.formula = '';
      }
      this.selectedTargetNode.definition.formula += `{{${temp._id}}}`;
      this.triggerAdd(this.selectedTargetNode.definition.formula)
      this.reCreatePaths.emit({ source: this.selectedSourceNode, target: this.selectedTargetNode });
      this.selectedSourceNode = null;
      this.selectedTargetNode = null;
    }
  }

  flatten(type: string, definition: Array<any>, parentDef?: any) {
    let list = [];
    try {
      if (definition && definition.length > 0) {
        definition.forEach((item, i) => {
          delete item._id;
          if (item.key == 'true') {
            item.key = '_self';
          }
          item.depth = parentDef ? parentDef.depth + 1 : 0;
          item._id = item.properties.dataPath;
          item.name = item.properties.name;
          item.dataPath = item.properties.dataPath;
          list.push(item);
          if (item.type == 'Array') {
            if (item.definition[0].type == 'Object') {
              list = list.concat(this.flatten(type, item.definition[0].definition, item));
            }
          } else if (item.type == 'Object') {
            list = list.concat(this.flatten(type, item.definition, item));
          }
        });
      };
    } catch (err) {
      console.log(err);
    }
    return list;
  }

  generateLinkPath(origX: number, origY: number, destX: number, destY: number, sc: number) {
    var lineCurveScale = 0.75,
      node_width = 100,
      node_height = 30;
    var dy = destY - origY;
    var dx = destX - origX;
    var delta = Math.sqrt(dy * dy + dx * dx);
    var scale = lineCurveScale;
    var scaleY = 0;
    if (dx * sc > 0) {
      if (delta < node_width) {
        scale = 0.75 - 0.75 * ((node_width - delta) / node_width);
        // scale += 2*(Math.min(5*node_width,Math.abs(dx))/(5*node_width));
        // if (Math.abs(dy) < 3*node_height) {
        //     scaleY = ((dy>0)?0.5:-0.5)*(((3*node_height)-Math.abs(dy))/(3*node_height))*(Math.min(node_width,Math.abs(dx))/(node_width)) ;
        // }
      }
    } else {
      scale = 0.4 - 0.2 * (Math.max(0, (node_width - Math.min(Math.abs(dx), Math.abs(dy))) / node_width));
    }
    if (dx * sc > 0) {
      return "M " + origX + " " + origY +
        " C " + (origX + sc * (node_width * scale)) + " " + (origY + scaleY * node_height) + " " +
        (destX - sc * (scale) * node_width) + " " + (destY - scaleY * node_height) + " " +
        destX + " " + destY
    } else {

      var midX = Math.floor(destX - dx / 2);
      var midY = Math.floor(destY - dy / 2);
      //
      if (dy === 0) {
        midY = destY + node_height;
      }
      var cp_height = node_height / 2;
      var y1 = (destY + midY) / 2
      var topX = origX + sc * node_width * scale;
      var topY = dy > 0 ? Math.min(y1 - dy / 2, origY + cp_height) : Math.max(y1 - dy / 2, origY - cp_height);
      var bottomX = destX - sc * node_width * scale;
      var bottomY = dy > 0 ? Math.max(y1, destY - cp_height) : Math.min(y1, destY + cp_height);
      var x1 = (origX + topX) / 2;
      var scy = dy > 0 ? 1 : -1;
      var cp = [
        // Orig -> Top
        [x1, origY],
        [topX, dy > 0 ? Math.max(origY, topY - cp_height) : Math.min(origY, topY + cp_height)],
        // Top -> Mid
        // [Mirror previous cp]
        [x1, dy > 0 ? Math.min(midY, topY + cp_height) : Math.max(midY, topY - cp_height)],
        // Mid -> Bottom
        // [Mirror previous cp]
        [bottomX, dy > 0 ? Math.max(midY, bottomY - cp_height) : Math.min(midY, bottomY + cp_height)],
        // Bottom -> Dest
        // [Mirror previous cp]
        [(destX + bottomX) / 2, destY]
      ];
      if (cp[2][1] === topY + scy * cp_height) {
        if (Math.abs(dy) < cp_height * 10) {
          cp[1][1] = topY - scy * cp_height / 2;
          cp[3][1] = bottomY - scy * cp_height / 2;
        }
        cp[2][0] = topX;
      }
      return "M " + origX + " " + origY +
        " C " +
        cp[0][0] + " " + cp[0][1] + " " +
        cp[1][0] + " " + cp[1][1] + " " +
        topX + " " + topY +
        " S " +
        cp[2][0] + " " + cp[2][1] + " " +
        midX + " " + midY +
        " S " +
        cp[3][0] + " " + cp[3][1] + " " +
        bottomX + " " + bottomY +
        " S " +
        cp[4][0] + " " + cp[4][1] + " " +
        destX + " " + destY;
    }
  }

  triggerAdd(value) {
    this.addMethod.next(value);
  }

  getValue() {
    return this.addMethod.asObservable();
  }

}
