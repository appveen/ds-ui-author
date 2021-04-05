/// <reference path="../../../../node_modules/monaco-editor/monaco.d.ts" />
import { Component, Input, Output, EventEmitter, AfterViewInit, OnChanges } from '@angular/core';

let loadedMonaco = false;
let loadPromise: Promise<void>;

@Component({
  selector: 'odp-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements AfterViewInit, OnChanges {

  @Input() code: string;
  @Output() codeChange: EventEmitter<string>;
  codeEditorInstance: monaco.editor.IStandaloneCodeEditor;
  constructor() {
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
        if (typeof ((<any>window).monaco) === 'object') {
          resolve();
          return;
        }
        const onAmdLoader: any = () => {
          // Load monaco
          (<any>window).require.config({ paths: { 'vs': 'assets/monaco/vs' } });

          (<any>window).require(['vs/editor/editor.main'], () => {
            this.initMonaco();
            resolve();
          });
        };

        // Load AMD loader if necessary
        if (!(<any>window).require) {
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
      this.codeEditorInstance.setValue(this.code);
    }
  }

  initMonaco(): void {
    this.codeEditorInstance = (<any>window).monaco.editor.create(document.getElementById('code-editor'), {
      value: this.code,
      language: 'javascript',
      theme: 'vs-dark'
    });

    this.codeEditorInstance.getModel().onDidChangeContent(e => {
      this.codeChange.emit(this.codeEditorInstance.getValue());
    });
  }
}
