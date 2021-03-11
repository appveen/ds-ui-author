import { Injectable } from '@angular/core';
import { Definition, Mapping } from './mapper.model';
import * as uuid from 'uuid/v1';
import * as Fuse from 'fuse.js';
import * as deepmerge from 'deepmerge';

@Injectable({
  providedIn: 'root'
})
export class MapperService {
  selectedEle: Definition;
  constructor() { }

  getUUID() {
    return uuid();
  }

  cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  getValue(key, obj) {
    if (!obj) {
      return null;
    }
    if (obj[key]) {
      return obj[key];
    }
    return key.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  }

  getSourceDefArray(source: any, formatType: string, returnNested?: boolean) {
    const self = this;
    const defArr = [];
    let rootKey;
    let hasRoot;
    if (typeof source === 'string') {
      source = JSON.parse(source);
    }
    // const keys = Object.keys(source);
    if ((source.length === 1
      && source.find(e => e.type === 'Object')
      && source.indexOf('$headers') === -1)
      || (source.length === 2
        && source.indexOf('$headers') > -1
        && source.find(e => e.type === 'Object'))) {
      if (formatType === 'XML' || formatType === 'JSON') {
        rootKey = source.filter(e => e.key.indexOf('$headers') === -1)[0];
        hasRoot = true;
      } else {
        hasRoot = false;
      }
    }
    const nestedArr = parse(source);
    if (returnNested) {
      return nestedArr;
    } else {
      return defArr;
    }

    function parse(definition: any, parentDef?: Definition) {
      const nestedDefArr = [];
      if (typeof definition === 'string') {
        definition = JSON.parse(definition);
      }
      if (!definition) {
        return;
      }
      const len = definition.length;
      definition.forEach((def, i) => {
        const key = def.key;
        if (!parentDef) {
          parentDef = Definition.getInstance();
        }
        const tempDef: Definition = Definition.getInstance();
        tempDef.lastChild = len === (i + 1);
        tempDef.hasRoot = hasRoot;
        tempDef.rootKey = rootKey;
        tempDef.formatType = formatType;
        if (!def.properties.dataKey) {
          def.properties.dataKey = key;
        }
        tempDef.id = self.getUUID();
        tempDef.key = key;
        tempDef.path = parentDef.path ? parentDef.path + '.' + key : key;
        tempDef.fullPath = parentDef.fullPath ? parentDef.fullPath + '.definition.' + key : key;
        tempDef.dataPath = parentDef.dataPath ?
          (parentDef.dataPath + '.definition.' + def.properties.dataKey) : def.properties.dataKey;
        tempDef.depth = parentDef.path ? parentDef.path.split('.') : [];
        const tempIndex = tempDef.depth.indexOf('_self');
        tempDef.depth = tempDef.depth.map(e => true);
        if (tempIndex > -1) {
          tempDef.depth[tempIndex - 1] = false;
          if (tempDef.lastChild) {
            tempDef.depth[0] = false;
          }
        }
        tempDef.parent = parentDef.path;
        defArr.push(tempDef);
        nestedDefArr.push(tempDef);
        if (key === '_id') {
          tempDef.name = 'ID';
          tempDef.type = 'String';
          tempDef.properties = { name: 'ID' };
          tempDef.definition = [];
          tempDef.dataPath = self.getDataPath(tempDef);
        } else {
          tempDef.name = def.properties.name;
          tempDef.type = def.type;
          tempDef.dataPath = self.getDataPath(tempDef);
          tempDef.properties = self.cloneObject(def.properties);
          if (returnNested) {
            tempDef.definition = parse(def.definition, tempDef);
          } else {
            parse(def.definition, tempDef);
          }
        }
      });
      return nestedDefArr;
    }
  }

  getMappings(sourceDef: Definition[], target: any, xslt?: any) {
    const self = this;
    const mappings = [];
    parse(target);
    return mappings;
    function parse(definition: any, parentDef?: Definition) {
      if (typeof definition === 'string') {
        definition = JSON.parse(definition);
      }
      if (!definition) {
        return;
      }
      const len = definition.length;
      definition.forEach((def, i) => {
        const key = def.key;
        if (!parentDef) {
          parentDef = Definition.getInstance();
        }
        const tempMap: Mapping = Mapping.getInstance();
        const tempDef: Definition = Definition.getInstance();
        tempDef.lastChild = len === (i + 1);
        if (!def.properties.dataKey) {
          def.properties.dataKey = key;
        }
        tempDef.id = self.getUUID();
        tempDef.key = key;
        tempDef.path = parentDef.path ? parentDef.path + '.' + key : key;
        tempDef.fullPath = parentDef.fullPath ? parentDef.fullPath + '.definition.' + key : key;
        tempDef.dataPath = parentDef.dataPath ?
          (parentDef.dataPath + '.definition.' + def.properties.dataKey) : def.properties.dataKey;
        tempDef.depth = parentDef.path ? parentDef.path.split('.') : [];
        const tempIndex = tempDef.depth.indexOf('_self');
        tempDef.depth = tempDef.depth.map(e => true);
        if (tempIndex > -1) {
          tempDef.depth[tempIndex - 1] = false;
          if (tempDef.lastChild) {
            tempDef.depth[0] = false;
          }
        }
        tempDef.parent = parentDef.path;
        mappings.push(tempMap);
        if (key === '_id') {
          tempDef.name = 'ID';
          tempDef.type = 'String';
          tempDef.properties = { name: 'ID' };
          tempDef.definition = [];
        } else {
          tempDef.name = def.properties.name;
          tempDef.type = def.type;
          tempDef.properties = self.cloneObject(def.properties);
          parse(def.definition, tempDef);
        }
        tempMap.target = tempDef;
        if (xslt) {
          const f = self.getValue(tempDef.fullPath, xslt);
          if (f) {
            tempDef.properties.operation = f.properties.operation;
            tempDef.properties._args = f.properties._args;
          }
          // if (tempDef.properties._args && tempDef.properties._args.length > 0) {
          //   tempMap.source.pop();
          //   tempDef.properties._args.forEach(arg => {
          //     if (arg.type === 'FIXED') {
          //       const temp = sourceDef.find(sd => sd.dataPath === arg.dataPath);
          //       if (temp) {
          //         const t = Definition.getInstance();
          //         t.patch(temp);
          //         tempMap.source.push(t);
          //       }
          //     } else if (arg.type === 'DEDUCED') {

          //     } else {
          //       const t = Definition.getInstance();
          //       t.patch(f);
          //       tempMap.source.push(tempDef);
          //     }
          //   });
          // }
          const sources = self.getSourcesFromXSLT(sourceDef, tempDef.properties._args);
          if (sources && sources.length > 0) {
            tempMap.source.pop();
            sources.forEach(e => {
              tempMap.source.push(e);
            });
          }
        } else {
          const fuse = new Fuse(sourceDef, {
            caseSensitive: true,
            keys: ['key', 'path']
          });
          const temp = fuse.search(tempDef.path);
          if (temp && temp.length > 0 && tempDef.type !== 'Object'
            && tempDef.type !== 'Array' && temp[0].type !== 'Object' && temp[0].type !== 'Array') {

            tempMap.source.push(temp[0]);
          }
        }
        if (tempMap.source.length === 0) {
          tempMap.source.push(Definition.getInstance());
        }
      });
    }
  }

  getSourcesFromXSLT(sourceDefArray, args) {
    let arr = [];
    if (args && args.length > 0) {
      args.forEach(arg => {
        if (arg.type === 'FIXED') {
          const temp = sourceDefArray.find(sd => sd.dataPath === arg.dataPath);
          if (temp) {
            const t = Definition.getInstance();
            t.patch(temp);
            arr.push(t);
          }
        } else if (arg.type === 'DEDUCED') {
          arr = this.getSourcesFromXSLT(sourceDefArray, arg._args);
        }
      });
    }
    return arr;
  }

  getDataPath(definition: Definition) {
    const segments = definition.dataPath.split('_self');
    let path;
    if (segments[segments.length - 1] === '' && definition.type !== 'Object') {
      path = '.';
    } else {
      path = (segments[segments.length - 1] ? segments[segments.length - 1] : segments[segments.length - 2])
        .split('.definition.').join('.').replace(/^\/(.*)/, '$1');
      if (definition.type === 'Array') {
        path = path + '[]';
      }
      if (path.charAt(path.length - 1) === '.') {
        const arr = path.split('');
        arr.pop();
        arr.push('[]');
        path = arr.join('');
      }
    }
    if (!definition.hasRoot && (segments.length === 1 || definition.type === 'Object')) {
      path = path;
    } else if (path !== '.') {
      if (path.indexOf('$headers') > -1 && definition.hasRoot) {
        path = definition.rootKey + '.' + path;
      } else {
        path = path;
      }
    }
    return path;
  }

  getXSLT(mappings: Mapping[], sourceDefArray: Definition[], target: any) {
    const self = this;
    let flatdestination;
    if (target) {
      flatdestination = Object.assign.apply({}, target.map(def => self.flattenObject(def, def.key)));
      // flatdestination = self.flattenObject(target);
      if (target._id) {
        flatdestination['_id.type'] = 'String';
      }
    }
    mappings.forEach((e, ei, ea) => {
      if (!e.target.isArray) {
        if (e.target.properties.operation) {
          flatdestination[e.target.fullPath + '.properties.operation'] = e.target.properties.operation;
        }
        if (!flatdestination[e.target.fullPath + '.properties.operation'] && e.target.type !== 'Object') {
          flatdestination[e.target.fullPath + '.properties.operation'] = '';
        }
        if (e.target.properties._args && e.target.properties._args.length > 0) {
          flatdestination[e.target.fullPath + '.properties._args'] = e.target.properties._args;
        }
        e.source.forEach((s, si) => {
          if (s.dataPath && !flatdestination[e.target.fullPath + '.properties.operation']) {
            let tempIndex = ei - 1;
            let targetParent = ea[tempIndex];
            while (tempIndex > 0 && targetParent.target.type !== 'Array' && targetParent.target.parent) {
              tempIndex--;
              targetParent = ea[tempIndex];
            }
            let sourceParent = sourceDefArray.find(se => se.path === s.path);
            while (sourceParent && sourceParent.parent && sourceParent.key !== '_self') {
              sourceParent = sourceDefArray.find(se => se.path === sourceParent.parent);
            }
            if (sourceParent && (sourceParent.type === 'Object' || sourceParent.type === 'Array') && targetParent) {
              flatdestination[targetParent.target.fullPath + '.properties.innerType']
                = s.key === '_self' ? s.type : sourceParent.type;
              flatdestination[targetParent.target.fullPath + '.properties.dataPath'] = sourceParent.dataPath;
            }
            flatdestination[e.target.fullPath + '.properties.innerType'] = s.type;
            flatdestination[e.target.fullPath + '.properties._args'] = [{
              type: 'FIXED',
              dataPath: s.dataPath,
              innerType: s.type
            }];
          }
        });
      }
    });
    return self.unFlattenObject(flatdestination);
  }

  findDefinition(definition: Definition[], id: string) {
    const self = this;
    let temp: Definition;
    for (const def of definition) {
      if (def.id === id || def.path === id) {
        temp = def;
        break;
      } else if (def.definition && def.definition.length > 0) {
        const temp2 = self.findDefinition(def.definition, id);
        if (temp2 && !temp) {
          temp = temp2;
          break;
        }
      }
    }
    return temp;
  }

  flattenObject(obj, parent?) {
    const self = this;
    let temp = {};
    if (obj) {
      Object.keys(obj).forEach(key => {
        const fieldKey = parent ? parent + '.' + key : key;
        if (typeof obj[key] !== 'object') {
          temp[fieldKey] = obj[key];
        } else {
          temp = Object.assign(temp, self.flattenObject(obj[key], fieldKey));
        }
      });
    }
    return temp;
  }

  unFlattenObject(fields) {
    let temp = {};
    if (!fields) {
      return temp;
    }
    Object.keys(fields).forEach(key => {
      const keys = key.split('.');
      if (keys.length > 1) {
        keys.reverse();
        const tempObj = keys.reduce((p, c) => {
          return Object.defineProperty({}, c, {
            value: p,
            enumerable: true,
            configurable: true,
            writable: true
          });
        }, fields[key]);
        temp = deepmerge(temp, tempObj);
      } else {
        temp[key] = fields[key];
      }
    });
    return temp;
  }
}
