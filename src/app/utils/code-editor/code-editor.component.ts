/// <reference path="../../../../node_modules/monaco-editor/monaco.d.ts" />
import { Component, Input, Output, EventEmitter, AfterViewInit, OnChanges } from '@angular/core';
import { AppService } from '../services/app.service';

let loadedMonaco = false;
let loadPromise: Promise<void>;

@Component({
  selector: 'odp-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements AfterViewInit, OnChanges {

  @Input() edit: { status: boolean, id?: string };
  @Input() theme: string;
  @Input() fontSize: number;
  @Input() code: string;
  @Output() codeChange: EventEmitter<string>;
  @Input() insertText: EventEmitter<string>;
  codeEditorInstance: monaco.editor.IStandaloneCodeEditor;
  typesString: string;
  constructor(private appService: AppService) {
    this.theme = 'vs-light';
    this.fontSize = 14;
    this.edit = { status: false };
    this.codeChange = new EventEmitter();
    this.insertText = new EventEmitter();
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


    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range: monaco.IRange = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        return {
          suggestions: [
            {
              range,
              label: 'router.post',
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: 'Add a POST Route',
              insertText: [
                'router.post(\'/\', async (req, res) => {',
                '\t',
                '});'].join('\n')
            },
            {
              range,
              label: 'router.put',
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: 'Add a PUT Route',
              insertText: [
                'router.put(\'/\', async (req, res) => {',
                '\t',
                '});'].join('\n')
            },
            {
              range,
              label: 'router.get',
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: 'Add a GET Route',
              insertText: [
                'router.get(\'/\', async (req, res) => {',
                '\t',
                '});'].join('\n')
            },
            {
              range,
              label: 'router.delete',
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: 'Add a DELETE Route',
              insertText: [
                'router.delete(\'/\', async (req, res) => {',
                '\t',
                '});'].join('\n')
            },
            {
              range,
              label: 'SDK.App',
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: 'Use App from SDK',
              insertText: 'const App = await DataStack.App(\'Adam\');'
            },
            {
              range,
              label: 'SDK.DataService',
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: 'Use DataService from SDK',
              insertText: 'const DataService = await App.DataService(\'Test\');'
            },
            {
              range,
              label: 'SDK.DataService.List',
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: 'Use DataService List from SDK',
              insertText: 'const records = await DataService.DataAPIs().ListRecords({count:30,page:1,sort:\'\',select:\'\',filter:{}});'
            },
            {
              range,
              label: 'SDK.DataService.Get',
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: 'Use DataService Get from SDK',
              insertText: 'const records = await DataService.DataAPIs().GetRecord(\'ID\');'
            },
            {
              range,
              label: 'SDK.DataService.Update',
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: 'Use DataService Update from SDK',
              insertText: [
                'const updatedData = {};',
                'const records = await DataService.DataAPIs().UpdateRecord(\'ID\', updatedData);'
              ].join('\n')
            },
            {
              range,
              label: 'SDK.DataService.Delete',
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: 'Use DataService Delete from SDK',
              insertText: [
                'const records = await DataService.DataAPIs().DeleteRecord(\'ID\');'
              ].join('\n')
            },
            {
              range,
              label: 'SDK.DataService.Create',
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: 'Use DataService Create from SDK',
              insertText: [
                'const data = {};',
                'const records = await DataService.DataAPIs().CreateRecord(data);'
              ].join('\n')
            }
          ]
        };
      }
    });

    this.codeEditorInstance = monaco.editor.create(document.getElementById('code-editor'), {
      value: this.code,
      language: 'javascript',
      theme: this.theme,
      automaticLayout: true,
      scrollBeyondLastLine: false,
      fontSize: this.fontSize,
      readOnly: !this.edit.status,
      minimap: { enabled: false }
    });

    this.codeEditorInstance.getModel().onDidChangeContent(e => {
      const val = this.codeEditorInstance.getValue();
      this.codeChange.emit(val);
    });

    this.codeEditorInstance.layout();

    this.insertText.subscribe((text: string) => {
      this.codeEditorInstance.trigger('keyboard', 'type', { text });
    })
  }
}
