/// <reference path="../../../../node_modules/monaco-editor/monaco.d.ts" />
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Component, Input, Output, EventEmitter, AfterViewInit, OnChanges } from '@angular/core';

let loadedMonaco = false;
let loadPromise: Promise<void>;

@Component({
  selector: 'odp-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements AfterViewInit, OnChanges {

  @Input() theme: string;
  @Input() code: string;
  @Output() codeChange: EventEmitter<string>;
  codeEditorInstance: monaco.editor.IStandaloneCodeEditor;
  typesString: string;
  constructor(private httpClient: HttpClient) {
    this.theme = 'vs-dark';
    this.codeChange = new EventEmitter();
    // const req = new HttpRequest('GET', '/assets/types.txt', {
    //   responseType: 'text'
    // });
    // this.httpClient.request(req).subscribe((res) => {
    //   if (res.type === HttpEventType.Response) {
    //     this.typesString = res.body as any;
    //   }
    // }, err => {
    //   console.log(err);
    // });
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
  }

  ngOnChanges() {
    if (this.codeEditorInstance) {
      (window as any).monaco.editor.setTheme(this.theme);
    }
  }

  initMonaco(): void {
    // (window as any).monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    //   target: monaco.languages.typescript.ScriptTarget.ES2016,
    //   allowNonTsExtensions: true,
    //   moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs
    // });
    // (window as any).monaco.languages.typescript.typescriptDefaults.addExtraLib(this.typesString, 'node_modules/@types/lodash/index.d.ts');
    this.codeEditorInstance = (window as any).monaco.editor.create(document.getElementById('code-editor'), {
      value: this.code,
      language: 'javascript',
      theme: this.theme,
      automaticLayout: true,
      scrollBeyondLastLine: false
    });

    this.codeEditorInstance.getModel().onDidChangeContent(e => {
      const val = this.codeEditorInstance.getValue();
      this.codeChange.emit(val);
    });

    this.codeEditorInstance.layout();

    // this.codeEditorInstance.onDidChangeCursorPosition((e) => {
    //   if (e.position.lineNumber < 7) {
    //     this.codeEditorInstance.setPosition({
    //       lineNumber: 7,
    //       column: 1
    //     });
    //   }
    // });
  }
}
