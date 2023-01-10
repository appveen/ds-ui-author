/// <reference path="../../../../node_modules/monaco-editor/monaco.d.ts" />
import { Component, Input, Output, EventEmitter, AfterViewInit, OnChanges } from '@angular/core';
import { AppService } from '../services/app.service';

let loadedMonaco = false;
let loadPromise: Promise<void>;

@Component({
  selector: 'odp-monotype-editor',
  templateUrl: './monotype-editor.component.html',
  styleUrls: ['./monotype-editor.component.scss']
})
export class MonotypeEditorComponent implements AfterViewInit, OnChanges {

  @Input() theme: string;
  @Input() fontSize: number;
  @Input() code: string;
  @Input() edit: { status: boolean, id?: string };
  @Output() codeChange: EventEmitter<string>;
  codeEditorInstance: monaco.editor.IStandaloneCodeEditor;
  typesString: string;
  constructor(private appService: AppService) {
    this.theme = 'vs-light';
    this.fontSize = 14;
    this.edit = { status: false };
    this.codeChange = new EventEmitter();
  }

  ngAfterViewInit(): void {
    if (loadedMonaco) {
      // Wait until monaco editor is available
      loadPromise.then(() => {
        this.initMonaco();
      });
    } else {
      loadedMonaco = true;
      loadPromise = new Promise<void>((resolve: any) => {
        if (typeof ((window as any).monaco) === 'object') {
          resolve();
          return;
        }
        const onAmdLoader: any = () => {
          // Load monaco
          (window as any).require.config({ paths: { 'vs': 'assets/monaco/vs' } });

          (window as any).require(['vs/editor/editor.main'], () => {
            this.initMonaco();
            resolve();
          });
        };

        // Load AMD loader if necessary
        if (!(window as any).require) {
          const loaderScript: HTMLScriptElement = document.createElement('script');
          loaderScript.type = 'text/javascript';
          loaderScript.src = 'assets/monaco/vs/loader.js';
          loaderScript.addEventListener('load', onAmdLoader);
          document.body.appendChild(loaderScript);
        } else {
          onAmdLoader();
        }
      });
    }
    this.appService.updateCodeEditorState.subscribe(() => {
      if (this.codeEditorInstance) {
        this.codeEditorInstance.updateOptions({ fontSize: this.fontSize, theme: this.theme, readOnly: !this.edit.status });
      }
    });
  }

  ngOnChanges() {
    if (this.codeEditorInstance) {
      this.codeEditorInstance.updateOptions({ fontSize: this.fontSize, theme: this.theme, readOnly: !this.edit.status });
    }
  }

  initMonaco(): void {

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      lib: ['es5'],
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    });

    this.codeEditorInstance = monaco.editor.create(document.getElementById('monotype-editor'), {
      value: this.code,
      language: 'javascript',
      theme: this.theme,
      automaticLayout: true,
      scrollBeyondLastLine: false,
      fontSize: this.fontSize,
      readOnly: !this.edit.status
    });

    this.codeEditorInstance.getModel().onDidChangeContent(e => {
      const val = this.codeEditorInstance.getValue();
      this.codeChange.emit(val);
    });

    this.codeEditorInstance.layout();
  }
}
