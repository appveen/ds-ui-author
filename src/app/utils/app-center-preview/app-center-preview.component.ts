import { Component, Input, AfterContentChecked, AfterViewInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'odp-app-center-preview',
  templateUrl: './app-center-preview.component.html',
  styleUrls: ['./app-center-preview.component.scss']
})
export class AppCenterPreviewComponent implements AfterViewInit, AfterContentChecked {

  @Input() logo: string;
  @Input() color: string;
  @Input() theme: string;
  @Input() bannerColor: string;
  @Output() textColor: EventEmitter<string>;
  canvas: HTMLCanvasElement;
  dimensions: ClientRect;
  cols: Array<number>;
  themeBackground: string;
  constructor() {
    this.textColor = new EventEmitter();
    this.cols = [100, 70, 120, 70, 140];
  }

  ngAfterViewInit() {
    const self = this;
    self.initCanvas();
  }


  ngAfterContentChecked() {
    if (!this.color) {
      this.color = '3498DB';
    }
    if (this.canvas) {
      const nodes = this.canvas.querySelectorAll('rect,line,image');
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].remove();
      }
      this.initCanvas();
      this.textColor.emit(this.getTextColor());
    }
  }

  initCanvas() {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.dimensions = this.canvas.getBoundingClientRect();
    this.canvas.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    if (this.theme && (this.theme === 'dark' || this.theme === 'Dark')) {
      this.themeBackground = '333';
    } else {
      this.themeBackground = 'fff';
    }
    // const background: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    // background.setAttribute('height', `300px`);
    // background.setAttribute('width', `100%`);
    // background.setAttribute('class', 'background');
    // background.setAttribute('fill', `${this.lighten(this.color, 20)}`);
    // this.canvas.appendChild(background);
    const app: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    app.setAttribute('x', `80px`);
    app.setAttribute('y', `30px`);
    app.setAttribute('height', `270px`);
    app.setAttribute('width', `921px`);
    app.setAttribute('fill', `#${this.themeBackground}`);
    app.setAttribute('filter', `url(#appShadow)`);
    this.canvas.appendChild(app);
    const header: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    header.setAttribute('x', `80px`);
    header.setAttribute('y', `30px`);
    header.setAttribute('height', `60px`);
    header.setAttribute('width', `921px`);
    if (this.bannerColor) {
      header.setAttribute('fill', `#333`);
    } else {
      header.setAttribute('fill', `#efefef`);
    }
    this.canvas.appendChild(header);
    this.createSideNav();
    const body: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    body.setAttribute('x', `280px`);
    body.setAttribute('y', `90px`);
    body.setAttribute('height', `210px`);
    body.setAttribute('width', `721px`);
    body.setAttribute('fill', `#eee`);
    this.canvas.appendChild(body);
    this.createSubHeader();
    this.createListing();
  }

  createSideNav() {
    const sidenav: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    sidenav.setAttribute('x', `80px`);
    sidenav.setAttribute('y', `90px`);
    sidenav.setAttribute('height', `210px`);
    sidenav.setAttribute('width', `200px`);
    sidenav.setAttribute('fill', `#${this.themeBackground}`);
    this.canvas.appendChild(sidenav);

    const item1: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    item1.setAttribute('x', `80px`);
    item1.setAttribute('y', `90px`);
    item1.setAttribute('height', `30px`);
    item1.setAttribute('width', `200px`);
    item1.setAttribute('fill', `${this.lighten(this.color, 50)}`);
    this.canvas.appendChild(item1);
    const item1Text: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    item1Text.setAttribute('x', `100px`);
    item1Text.setAttribute('y', `102px`);
    item1Text.setAttribute('height', `6px`);
    item1Text.setAttribute('width', `100px`);
    item1Text.setAttribute('fill', `#${this.color}`);
    this.canvas.appendChild(item1Text);

    const item2: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    item2.setAttribute('x', `80px`);
    item2.setAttribute('y', `120px`);
    item2.setAttribute('height', `30px`);
    item2.setAttribute('width', `200px`);
    item2.setAttribute('fill', `#${this.themeBackground}`);
    this.canvas.appendChild(item2);
    const item2Text: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    item2Text.setAttribute('x', `100px`);
    item2Text.setAttribute('y', `132px`);
    item2Text.setAttribute('height', `6px`);
    item2Text.setAttribute('width', `160px`);
    item2Text.setAttribute('fill', `#ccc`);
    this.canvas.appendChild(item2Text);

    const item3: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    item3.setAttribute('x', `80px`);
    item3.setAttribute('y', `150px`);
    item3.setAttribute('height', `30px`);
    item3.setAttribute('width', `200px`);
    item3.setAttribute('fill', `#${this.themeBackground}`);
    this.canvas.appendChild(item3);
    const item3Text: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    item3Text.setAttribute('x', `100px`);
    item3Text.setAttribute('y', `162px`);
    item3Text.setAttribute('height', `6px`);
    item3Text.setAttribute('width', `160px`);
    item3Text.setAttribute('fill', `#ccc`);
    this.canvas.appendChild(item3Text);

    const item4: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    item4.setAttribute('x', `80px`);
    item4.setAttribute('y', `180px`);
    item4.setAttribute('height', `30px`);
    item4.setAttribute('width', `200px`);
    item4.setAttribute('fill', `#${this.color}`);
    this.canvas.appendChild(item4);
    const item4Text: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    item4Text.setAttribute('x', `100px`);
    item4Text.setAttribute('y', `192px`);
    item4Text.setAttribute('height', `6px`);
    item4Text.setAttribute('width', `160px`);
    item4Text.setAttribute('fill', `#${this.themeBackground}`);
    this.canvas.appendChild(item4Text);

    const item5: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    item5.setAttribute('x', `80px`);
    item5.setAttribute('y', `210px`);
    item5.setAttribute('height', `30px`);
    item5.setAttribute('width', `200px`);
    item5.setAttribute('fill', `#${this.themeBackground}`);
    this.canvas.appendChild(item5);
    const item5Text: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    item5Text.setAttribute('x', `100px`);
    item5Text.setAttribute('y', `222px`);
    item5Text.setAttribute('height', `6px`);
    item5Text.setAttribute('width', `160px`);
    item5Text.setAttribute('fill', `#ccc`);
    this.canvas.appendChild(item5Text);
  }

  createSubHeader() {
    const subHeader: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    subHeader.setAttribute('x', `280px`);
    subHeader.setAttribute('y', `90px`);
    subHeader.setAttribute('height', `30px`);
    subHeader.setAttribute('width', `721px`);
    subHeader.setAttribute('fill', `#${this.themeBackground}`);
    this.canvas.appendChild(subHeader);

    const label: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    label.setAttribute('x', `290px`);
    label.setAttribute('y', `102px`);
    label.setAttribute('height', `6px`);
    label.setAttribute('width', `100px`);
    label.setAttribute('fill', `#666`);
    this.canvas.appendChild(label);

    const button1: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    button1.setAttribute('x', `calc(100% - 290px)`);
    button1.setAttribute('y', `102px`);
    button1.setAttribute('height', `6px`);
    button1.setAttribute('width', `50px`);
    button1.setAttribute('fill', `#${this.color}`);
    this.canvas.appendChild(button1);

    const button2: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    button2.setAttribute('x', `calc(100% - 220px)`);
    button2.setAttribute('y', `102px`);
    button2.setAttribute('height', `6px`);
    button2.setAttribute('width', `50px`);
    button2.setAttribute('fill', `#${this.color}`);
    this.canvas.appendChild(button2);

    const button3: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    button3.setAttribute('x', `calc(100% - 150px)`);
    button3.setAttribute('y', `102px`);
    button3.setAttribute('height', `6px`);
    button3.setAttribute('width', `50px`);
    button3.setAttribute('class', `green`);
    this.canvas.appendChild(button3);
  }

  createListing() {
    const listTable: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    listTable.setAttribute('x', `295px`);
    listTable.setAttribute('y', `135px`);
    listTable.setAttribute('height', `200px`);
    listTable.setAttribute('width', `691px`);
    listTable.setAttribute('fill', `#${this.themeBackground}`);
    listTable.setAttribute('filter', `url(#tableShadow)`);
    this.canvas.appendChild(listTable);


    const listHeader: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    listHeader.setAttribute('x', `295px`);
    listHeader.setAttribute('y', `135px`);
    listHeader.setAttribute('height', `30px`);
    listHeader.setAttribute('width', `691px`);
    listHeader.setAttribute('fill', `#${this.themeBackground}`);
    this.canvas.appendChild(listHeader);
    const listHeaderLine: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'line') as SVGElement;
    listHeaderLine.setAttribute('x1', `295px`);
    listHeaderLine.setAttribute('y1', `165px`);
    listHeaderLine.setAttribute('x2', `986px`);
    listHeaderLine.setAttribute('y2', `165px`);
    listHeaderLine.setAttribute('width', `691px`);
    listHeaderLine.setAttribute('stroke', `#ccc`);
    this.canvas.appendChild(listHeaderLine);

    const listHeaderCheckbox: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
    listHeaderCheckbox.setAttribute('x', `305px`);
    listHeaderCheckbox.setAttribute('y', `${135 + 10}px`);
    listHeaderCheckbox.setAttribute('height', `10px`);
    listHeaderCheckbox.setAttribute('width', `10px`);
    listHeaderCheckbox.setAttribute('fill', `#${this.color}`);
    this.canvas.appendChild(listHeaderCheckbox);

    this.cols.forEach((len, i) => {
      let x = 340;
      if (i > 0) {
        x += (i * 30) + this.cols.slice(0, i).reduce((c, p) => c + p);
      }
      const col: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
      col.setAttribute('x', `${x}px`);
      col.setAttribute('y', `${135 + 12}px`);
      col.setAttribute('height', `6px`);
      col.setAttribute('width', `${len}px`);
      col.setAttribute('fill', `#aaa`);
      this.canvas.appendChild(col);
    });

    for (let j = 0; j <= 3; j++) {
      const yStart = 166 + (j * 31);
      const yEnd = 196 + (j * 31);
      const listItem: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
      listItem.setAttribute('x', `295px`);
      listItem.setAttribute('y', `${yStart}px`);
      listItem.setAttribute('height', `30px`);
      listItem.setAttribute('width', `691px`);
      listItem.setAttribute('fill', `#${this.themeBackground}`);
      this.canvas.appendChild(listItem);
      const listItemLine: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'line') as SVGElement;
      listItemLine.setAttribute('x1', `295px`);
      listItemLine.setAttribute('y1', `${yEnd}px`);
      listItemLine.setAttribute('x2', `986px`);
      listItemLine.setAttribute('y2', `${yEnd}px`);
      listItemLine.setAttribute('width', `691px`);
      listItemLine.setAttribute('stroke', `#ccc`);
      this.canvas.appendChild(listItemLine);

      const checkbox: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
      checkbox.setAttribute('x', `305px`);
      checkbox.setAttribute('y', `${yStart + 10}px`);
      checkbox.setAttribute('height', `10px`);
      checkbox.setAttribute('width', `10px`);
      checkbox.setAttribute('stroke', `#${this.color}`);
      checkbox.setAttribute('style', `stroke-width:2`);
      checkbox.setAttribute('fill', `#${this.themeBackground}`);
      this.canvas.appendChild(checkbox);

      this.cols.forEach((len, i) => {
        let x = 340;
        if (i > 0) {
          x += (i * 30) + this.cols.slice(0, i).reduce((c, p) => c + p);
        }
        const col: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGElement;
        col.setAttribute('x', `${x}px`);
        col.setAttribute('y', `${yStart + 12}px`);
        col.setAttribute('height', `6px`);
        col.setAttribute('width', `${len}px`);
        col.setAttribute('fill', `#ddd`);
        this.canvas.appendChild(col);
      });
    }

  }

  lighten(color: string, percent: number) {
    if (color.split('').indexOf('#') === 0) {
      color = color.substr(1, 6);
    }
    const num = parseInt(color, 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      G = (num >> 8 & 0x00FF) + amt,
      B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 +
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }
  darken(color: string, percent: number) {
    if (color.split('').indexOf('#') === 0) {
      color = color.substr(1, 6);
    }
    const num = parseInt(color, 16),
      amt = Math.round(2.55 * (-percent)),
      R = (num >> 16) + amt,
      G = (num >> 8 & 0x00FF) + amt,
      B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 +
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }
  rgba(color: string, opacity: number) {
    const result = /^#?([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/i.exec(color);
    if (result) {
      const text = 'rgba(' + parseInt(result[1], 16) +
        ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16) + ',' + opacity + ')';
      return text;
    }
    return null;
  }

  getTextColor() {
    const result = /^#?([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/i.exec(this.color);
    const o = Math.round(((parseInt(result[1], 16) * 299) +
      (parseInt(result[2], 16) * 587) +
      (parseInt(result[3], 16) * 114)) / 1000);
    return (o > 125) ? '000000' : 'FFFFFF';
  }
}
