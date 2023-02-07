import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, ElementRef, EventEmitter, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { delay, tap } from 'rxjs/operators';
import * as _ from 'lodash';

import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonService } from 'src/app/utils/services/common.service';
import { environment } from 'src/environments/environment';
import { B2bFlowService } from './b2b-flow.service';

@Component({
  selector: 'odp-b2b-flows-manage',
  templateUrl: './b2b-flows-manage.component.html',
  styleUrls: ['./b2b-flows-manage.component.scss']
})
export class B2bFlowsManageComponent implements OnInit, OnDestroy {

  @ViewChild('pageChangeModalTemplate', { static: false }) pageChangeModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('keyValModalTemplate', { static: false }) keyValModalTemplate: TemplateRef<HTMLElement>;
  pageChangeModalTemplateRef: NgbModalRef;
  keyValModalTemplateRef: NgbModalRef;
  edit: any;
  subscriptions: any;
  apiCalls: any;
  oldData: any;
  headerData: any;
  flowData: any;
  breadcrumbPaths: Array<Breadcrumb>;
  content: any;
  selectedEditorTheme: string;
  selectedFontSize: number;
  showCodeEditor: boolean;
  showConsole: boolean;
  loadingLogs: boolean;
  logs: Array<any>;
  showNewNodeDropdown: boolean;
  newNodeDropdownPos: any;
  selectedNode: any;
  showNodeProperties: boolean;
  openDeleteModal: EventEmitter<any>;
  nodeList: Array<any>;
  changesDone: boolean = false;
  saved: boolean = false

  contextMenuStyle: any;
  isMouseDown: any;

  showPathProperties: boolean;
  selectedPath: any;

  constructor(private commonService: CommonService,
    private appService: AppService,
    private route: ActivatedRoute,
    private router: Router,
    private ele: ElementRef,
    private ts: ToastrService,
    private flowService: B2bFlowService) {
    this.subscriptions = {};
    this.edit = {
      status: false,
      id: null,
      editClicked: false
    };
    this.breadcrumbPaths = [{
      active: false,
      label: 'Data Pipes',
      url: '/app/' + this.commonService.app._id + '/flow'
    }];
    this.apiCalls = {};
    this.flowData = {};
    this.selectedEditorTheme = 'vs-light';
    this.selectedFontSize = 14;
    this.ele.nativeElement.classList.add('h-100');
    this.logs = [];
    this.openDeleteModal = new EventEmitter();
    this.nodeList = [];
  }

  ngOnInit(): void {
    this.flowService.showAddNodeDropdown.pipe(
      tap(() => {
        this.resetSelection();
      }),
      delay(5)
    ).subscribe((data: any) => {
      this.selectedNode = data;
      this.newNodeDropdownPos = data.position;
      this.showNewNodeDropdown = true;
    });
    this.flowService.selectedNode.pipe(
      tap(() => {
        this.resetSelection();
      }),
      delay(5)
    ).subscribe((data: any) => {
      this.selectedNode = data;
      if (data) {
        this.showNodeProperties = true;
      } else {
        this.showNodeProperties = false;
      }
    });
    this.flowService.selectedPath.pipe(
      tap(() => {
        this.resetSelection();
      }),
      delay(5)
    ).subscribe((data: any) => {
      this.selectedPath = data;
      if (data) {
        this.showPathProperties = true;
      } else {
        this.showPathProperties = false;
      }
    });
    this.flowService.deleteNode.subscribe((data: any) => {
      this.openDeleteModal.emit({
        title: 'Delete Node?',
        message: 'Are you sure you want to delete this node?, You will have to re-configure flow.',
        data
      })
    });
    this.route.params.subscribe(params => {
      if (params && params.id) {
        this.edit.id = params.id;
        if (this.appService.edit) {
          this.edit.editClicked = true;
          this.appService.edit = null;
          this.edit.status = true;
        }
        this.getFlow(params.id, this.edit.status);
      } else {
        this.edit.status = true;
      }
    });
    this.saved = false
  }

  ngOnDestroy() {
    Object.keys(this.subscriptions).forEach(key => {
      if (this.subscriptions[key]) {
        this.subscriptions[key].unsubscribe();
      }
    });
    if (this.pageChangeModalTemplateRef) {
      this.pageChangeModalTemplateRef.close(false);
    }
  }

  resetSelection() {
    this.showNewNodeDropdown = false;
    this.showNodeProperties = false;
    this.selectedNode = null;
    this.newNodeDropdownPos = null;
    this.showPathProperties = false;
    this.selectedPath = null;
  }

  getFlow(id: string, draft?: boolean) {
    this.apiCalls.getFlow = true;
    let path = `/${this.commonService.app._id}/flow/${id}`;
    if (draft) {
      path += '?draft=true';
    }
    this.showCodeEditor = false;
    this.subscriptions['getFlow'] = this.commonService.get('partnerManager', path).subscribe(res => {
      this.breadcrumbPaths.push({
        active: true,
        label: res.name + ' (Edit)'
      });
      this.commonService.changeBreadcrumb(this.breadcrumbPaths);
      this.apiCalls.getFlow = false;
      this.showCodeEditor = true;
      if (res.inputNode.dataStructure && res.inputNode.dataStructure.outgoing) {
        this.patchDataStructure(res.inputNode.dataStructure.outgoing, res.dataStructures);
      }
      res.nodes.forEach(item => {
        if (item.dataStructure && item.dataStructure.outgoing) {
          this.patchDataStructure(item.dataStructure.outgoing, res.dataStructures);
        }
        if (item.type == 'DATASERVICE') {
          this.patchDataStructure(item.options.dataService, res.dataStructures);
        }
      });
      this.flowData = this.appService.cloneObject(res);
      delete this.flowData.__v;
      delete this.flowData._metadata;
      this.oldData = this.appService.cloneObject(this.flowData);
      // this.appService.updateCodeEditorState.emit(this.edit);
      this.nodeList = [];
      if (this.flowData.inputNode) {
        this.nodeList.push(this.flowData.inputNode);
      }
      if (this.flowData.nodes) {
        this.flowData.nodes.forEach(item => {
          this.nodeList.push(item);
        });
      }
      this.nodeList.forEach((node, i) => {
        if (!node.name) {
          node.name = this.appService.toSnakeCase(this.flowService.getNodeType(node.type, i == 0));
        }
        if (!node.coordinates || !node.coordinates.x || !node.coordinates.y) {
          node.coordinates = {
            x: 20 + (i * 120),
            y: 20 + (i * 72)
          };
        }
      });
      this.flowService.cleanPayload(this.nodeList);
    }, err => {
      this.apiCalls.getFlow = false;
      this.commonService.errorToast(err);
    });
  }

  patchDataStructure(format: any, dataStructure: any) {
    if (format && dataStructure && dataStructure[format._id]) {
      _.assign(format, dataStructure[format._id]);
    }
  }

  discardDraft() {
    const path = `/${this.commonService.app._id}/flow/utils/${this.edit.id}/draftDelete`;
    this.apiCalls.discardDraft = true;
    this.subscriptions['discardDraft'] = this.commonService.put('partnerManager', path, {}).subscribe(res => {
      this.apiCalls.discardDraft = false;
      this.getFlow(this.flowData._id);
    }, err => {
      this.apiCalls.discardDraft = false;
      this.commonService.errorToast(err);
    });
  }

  enableEditing() {
    this.edit.status = true;
    if (this.flowData.draftVersion) {
      this.getFlow(this.flowData._id, true);
    } else {
      this.appService.updateCodeEditorState.emit(this.edit);
    }
  }

  getPayload() {
    const dataStructures = {};
    this.flowData.app = this.commonService.app._id;
    const tempNodeList = JSON.parse(JSON.stringify(this.nodeList));
    this.flowService.cleanPayload(tempNodeList);
    tempNodeList.forEach(item => {
      if (item.dataStructure && item.dataStructure.outgoing && item.dataStructure.outgoing._id) {
        dataStructures[item.dataStructure.outgoing._id] = JSON.parse(JSON.stringify(item.dataStructure.outgoing));
        item.dataStructure.outgoing = {
          _id: item.dataStructure.outgoing._id,
          name: item.dataStructure.outgoing.name
        };
      }
      if (item.type === 'DATASERVICE' && item.options && item.options.dataService && item.options.dataService._id) {
        dataStructures[item.options.dataService._id] = JSON.parse(JSON.stringify(item.options.dataService));
        item.options.dataService = {
          _id: item.options.dataService._id,
          name: item.options.dataService.name
        };
      }
      if (item.type === 'FAAS' && item.options && item.options.faas && item.options.faas._id) {
        item.options.faas = {
          _id: item.options.faas._id,
          name: item.options.faas.name
        };
      }
    });
    this.flowData.inputNode = tempNodeList[0];
    tempNodeList.splice(0, 1);
    this.flowData.nodes = tempNodeList;
    this.flowData.dataStructures = dataStructures;
    if (!environment.production) {
      console.log(this.flowData);
    }
    return this.flowData;
  }

  saveDummyCode(deploy?: boolean) {
    const payload = this.getPayload();
    let request;
    this.apiCalls.save = true;
    this.saved = true
    if (deploy) {
      this.flowData.status = 'RUNNING';
    }
    if (this.edit.id) {
      request = this.commonService.put('partnerManager', `/${this.commonService.app._id}/flow/${this.edit.id}`, payload);
    } else {
      request = this.commonService.post('partnerManager', `/${this.commonService.app._id}/flow`, payload);
    }
    this.subscriptions['save'] = request.subscribe((res: any) => {
      this.apiCalls.save = false;
      this.edit.status = false;
      if (deploy) {
        this.apiCalls.deploy = false;
        this.ts.success('Saved ' + payload.name + ' and deployment process has started.');
        this.router.navigate(['/app', this.commonService.app._id, 'flow']);
      } else {
        this.ts.success('Saved ' + payload.name + '.');
        this.router.navigate(['/app', this.commonService.app._id, 'flow']);
      }
    }, (err: any) => {
      this.apiCalls.save = false;
      this.commonService.errorToast(err);
    });
  }

  save(deploy?: boolean) {
    const payload = this.getPayload();
    let request;
    this.apiCalls.save = true;
    this.saved = true
    if (this.edit.id) {
      request = this.commonService.put('partnerManager', `/${this.commonService.app._id}/flow/${this.edit.id}`, payload);
    } else {
      request = this.commonService.post('partnerManager', `/${this.commonService.app._id}/flow`, payload);
    }
    this.subscriptions['save'] = request.subscribe(res => {
      this.apiCalls.save = false;
      this.edit.status = false;
      if (deploy) {
        this.deploy();
      } else {
        this.ts.success('Saved ' + payload.name + '.');
        this.router.navigate(['/app', this.commonService.app._id, 'flow']);
      }
    }, err => {
      this.apiCalls.save = false;
      this.commonService.errorToast(err);
    });
  }

  deploy() {
    if (this.edit.id) {
      this.apiCalls.deploy = true;
      this.commonService.put('partnerManager', `/${this.commonService.app._id}/flow/utils/${this.edit.id}/deploy`, { app: this.commonService.app._id }).subscribe(res => {
        this.apiCalls.deploy = false;
        this.ts.success('Saved ' + this.flowData.name + ' and deployment process has started.');
        this.router.navigate(['/app', this.commonService.app._id, 'flow']);
      }, err => {
        this.apiCalls.deploy = false;
        this.commonService.errorToast(err);
      });
    }
  }

  cancel() {
    if (!this.edit.status || this.edit.editClicked || !this.edit.id) {
      this.router.navigate(['/app', this.commonService.app._id, 'flow']);
    } else {
      if (!this.edit.editClicked) {
        this.edit.status = false;
        this.getFlow(this.edit.id);
      }
    }
  }

  testRun() {
    this.apiCalls.testRun = true;
    this.commonService.put('partnerManager', `/${this.commonService.app._id}/flow/utils/${this.edit.id}/test`, {
      code: this.flowData.code,
      port: this.flowData.port
    }).subscribe(res => {
      this.apiCalls.testRun = false;
      this.ts.info('There are no syntax errors!');
    }, err => {
      this.apiCalls.testRun = false;
      this.commonService.errorToast(err);
    });
  }

  closeDeleteNodeModal(val: any) {
    if (val & val.data && val.data.nodeIndex > 0) {
      if (val.data.nodeIndex < this.flowData.nodes.length) {
        let prev
        if (val.data.nodeIndex > 1) {
          prev = this.flowData.nodes[val.data.nodeIndex - 2];
        } else {
          prev = this.flowData.inputNode;
        }
        const curr = this.flowData.nodes[val.data.nodeIndex - 1];
        const next = this.flowData.nodes[val.data.nodeIndex];
        const pt = prev.onSuccess.find(e => e._id == curr._id);
        pt._id = next._id;
      }
      this.flowData.nodes.splice(val.data.nodeIndex - 1, 1);
    }
  }

  canDeactivate(): Promise<boolean> | boolean {
    const self = this;
    if (this.changesDone && !this.saved) {
      return new Promise((resolve, reject) => {
        self.pageChangeModalTemplateRef = this.commonService.modal(this.pageChangeModalTemplate);
        self.pageChangeModalTemplateRef.result.then(close => {
          resolve(close);
        }, dismiss => {
          resolve(false);
        });
      });
    }
    return true;
  }

  addNode(event: any, type: string) {
    this.contextMenuStyle = null;
    const tempNode = this.flowService.getNodeObject(type);
    tempNode.coordinates = {};
    const ele: HTMLElement = document.querySelectorAll('.flow-designer-svg')[0] as HTMLElement;
    const rect = ele.getBoundingClientRect();
    tempNode.coordinates.x = event.pageX - rect.left - 70;
    tempNode.coordinates.y = event.pageY - rect.top - 18;
    this.nodeList.push(tempNode);
  }

  addNodeToCanvas(type: string) {
    const temp = this.nodeList[this.nodeList.length - 1];
    const event = { pageX: temp.coordinates.x + 400, pageY: temp.coordinates.y + 200 };
    this.addNode(event, type);
  }

  onRightClick(event: PointerEvent) {
    event.preventDefault();
    const clientHeight = (event.target as HTMLElement).clientHeight;
    if (clientHeight > 330 && (event.clientY + 330) > clientHeight) {
      this.contextMenuStyle = { top: (event.clientY - 330) + 'px', left: event.clientX + 'px' };
    } else {
      this.contextMenuStyle = { top: event.clientY + 'px', left: event.clientX + 'px' };
    }
  }


  @HostListener('document:keydown', ['$event'])
  onDeleteKey(event: any) {
    if ((((event.metaKey || event.ctrlKey) && event.key == 'Backspace') || event.key == 'Delete') && this.selectedNode) {
      this.nodeList.forEach((node: any) => {
        if (this.selectedNode.prevNode && node._id == this.selectedNode.prevNode._id) {
          let tempIndex = node.onSuccess.findIndex(e => e._id == this.selectedNode.currNode._id);
          node.onSuccess.splice(tempIndex, 1);
        }
      });
      let index = this.nodeList.findIndex(e => e._id == this.selectedNode.currNode._id);
      if (this.flowData.inputNode._id != this.selectedNode.currNode._id) {
        this.nodeList.splice(index, 1);
        this.flowService.reCreatePaths.emit(null);
        this.flowService.selectedNode.emit(null);
      }
    }
  }


  @HostListener('mousedown', ['$event'])
  onMouseDown(event: any) {
    this.isMouseDown = event;
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: any) {
    this.isMouseDown = null;
    // this.flowService.anchorSelected = null;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: any) {
    if (this.isMouseDown) {
      let targetEle = (this.isMouseDown.target as HTMLElement);
      let currNode = this.nodeList.find(e => e._id == targetEle.dataset.id);
      if (currNode) {
        const tempX = event.clientX - this.isMouseDown.clientX;
        const tempY = event.clientY - this.isMouseDown.clientY;
        this.isMouseDown = event;
        currNode.coordinates.x += tempX;
        currNode.coordinates.y += tempY;
        this.flowService.reCreatePaths.emit();
      }
    }
  }


  get apiCallsPending() {
    return Object.values(this.apiCalls).some(e => e);
  }

  get isValidSchema() {
    return true;
  }

  get namespace() {
    if (this.flowData && this.flowData.namespace) {
      return this.flowData.namespace.split('-')[0];
    }
    return '-';
  }

  get fqdn() {
    if (this.commonService.userDetails && this.commonService.userDetails.fqdn) {
      return this.commonService.userDetails.fqdn;
    }
    return '-';
  }

  get hasDeployPermission() {
    return this.commonService.hasPermission('PMFPD')
  }

  get hasManagePermission() {
    return this.commonService.hasPermission('PMF')
  }

}
