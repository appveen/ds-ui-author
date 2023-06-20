import { Component, EventEmitter, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { switchMap } from 'rxjs/operators';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-mapper-formulas',
  templateUrl: './mapper-formulas.component.html',
  styleUrls: ['./mapper-formulas.component.scss']
})
export class MapperFormulasComponent implements OnInit {

  form: UntypedFormGroup;
  formulaList: Array<any>;
  selectedFormula: any;
  toggleNewFormulaWindow: boolean;
  createFormulaLoader: boolean;
  openDeleteModal: EventEmitter<any>;
  constructor(private fb: UntypedFormBuilder,
    private commonService: CommonService,
    private ts: ToastrService) {
    this.formulaList = [];
    this.openDeleteModal = new EventEmitter();
    this.form = this.fb.group({
      name: [null, [Validators.required, Validators.pattern(/[a-zA-Z_\\.]{2,30}/)]]
    })
  }

  ngOnInit(): void {
    this.fetchAllFormulas();
  }

  fetchAllFormulas() {
    this.commonService.get('user', '/admin/metadata/mapper/formula/count')
      .pipe(switchMap((ev: any) => {
        return this.commonService.get('user', '/admin/metadata/mapper/formula', { count: ev })
      }))
      .subscribe(res => {
        this.formulaList = res;
      }, err => {
        this.commonService.errorToast(err);
      });
  }

  selectFormula(item: any) {
    this.selectedFormula = null;
    setTimeout(() => {
      this.selectedFormula = item;
    }, 100);
  }

  openNewFormulaWindow() {
    this.form.reset({});
    this.toggleNewFormulaWindow = true;
  }

  triggerCreateFormula() {
    if (this.form.invalid) {
      return;
    }
    this.createFormulaLoader = true;
    let payload = this.form.value;
    this.commonService.post('user', '/admin/metadata/mapper/formula', payload).subscribe(res => {
      this.createFormulaLoader = false;
      this.selectedFormula = res;
      this.ts.success('Formula Created.');
      this.formulaList.unshift(res);
      this.toggleNewFormulaWindow = false;
    }, err => {
      this.createFormulaLoader = false;
      this.commonService.errorToast(err);
    });
  }

  deleteFormula(item: any) {
    this.openDeleteModal.emit({
      title: 'Delete Formula?',
      message: `Are you sure you want to delete formula <strong>${item.name}</strong>`,
      item
    });
  }

  closeDeleteModal(data: any) {
    if (data) {
      this.triggerDeleteFormula(data.item);
    }
  }

  triggerDeleteFormula(item: any) {
    this.createFormulaLoader = true;
    this.commonService.delete('user', `/admin/metadata/mapper/formula/${item._id}`).subscribe(res => {
      this.fetchAllFormulas();
      this.createFormulaLoader = false;
      this.ts.success('Formula Deleted.');
    }, err => {
      this.createFormulaLoader = false;
      this.commonService.errorToast(err);
    });
  }

  saveFormula() {
    this.createFormulaLoader = true;
    this.commonService.put('user', `/admin/metadata/mapper/formula/${this.selectedFormula._id}`, this.selectedFormula).subscribe(res => {
      this.fetchAllFormulas();
      this.createFormulaLoader = false;
      this.ts.success('Formula Updated.');
    }, err => {
      this.createFormulaLoader = false;
      this.commonService.errorToast(err);
    });
  }
}
