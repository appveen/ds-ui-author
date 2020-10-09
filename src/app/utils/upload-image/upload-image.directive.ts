import { Directive, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[odpUploadImage]'
})
export class UploadImageDirective {

  @Input() imageWidth: number;
  @Input() imageHeight: number;
  @Output() odpUploadImage: EventEmitter<{ image?: any, message?: string }>;
  constructor(private ele: ElementRef) {
    this.odpUploadImage = new EventEmitter();
    this.imageWidth = 72;
    this.imageHeight = 72;
  }

  @HostListener('change', ['$event'])
  onChange(event: any) {
    const target: HTMLInputElement = (event.target as HTMLInputElement);
    const file = target.files[0];
    const size = file.size / (1024 * 1024);
    if (Math.ceil(size) > 100) {
      this.odpUploadImage.emit({
        message: 'Please upload an image with size less then 1 MB'
      });
      target.value = null;
      return;
    }
    const img = new Image();
    const reader = new FileReader();
    const canvas = document.createElement('canvas');
    canvas.width = this.imageWidth;
    canvas.height = this.imageHeight;
    const ctx = canvas.getContext('2d');
    reader.readAsDataURL(file);
    // tslint:disable-next-line:only-arrow-functions
    reader.onload = function () {
      img.src = reader.result.toString();
    };
    const self = this;
    // tslint:disable-next-line:only-arrow-functions
    img.onload = function () {
      ctx.drawImage(img, 0, 0, self.imageWidth, self.imageHeight);
      const dataUrl = canvas.toDataURL(file.type, 5 / 10);
      self.odpUploadImage.emit({
        image: dataUrl
      });
    };
  }
}
