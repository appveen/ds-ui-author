import { Directive, Output, EventEmitter, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Directive({
    selector: '[odpReadWsdl]'
})
export class ReadWsdlDirective {

    @Output() content: EventEmitter<string>;
    constructor(private http: HttpClient) {
        const self = this;
        self.content = new EventEmitter();
    }

    @HostListener('change', ['$event'])
    onChange(event: Event) {
        const self = this;
        const target: HTMLInputElement = event.target as HTMLInputElement;
        if (target.type === 'file') {
            if (target.files[0]) {
                self.readContent(target.files[0]).then((data: any) => {
                    self.content.emit(data);
                }).catch(err => {
                    self.content.emit(null);
                });
            } else {
                self.content.emit(null);
            }
        } else {
            if (target.value) {
                self.fetchContent(target.value).then((data: any) => {
                    self.content.emit(data);
                }).catch(err => {
                    self.content.emit(null);
                });
            } else {
                self.content.emit(null);
            }
        }
    }

    fetchContent(url: string) {
        const self = this;
        return self.http.get(url, {
            responseType: 'text'
        }).toPromise();
    }

    readContent(file: any) {
        return new Promise<any>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve(reader.result);
            };
            reader.onerror = (event) => {
                reject(event);
            };
            reader.readAsText(file);
        });
    }
}
