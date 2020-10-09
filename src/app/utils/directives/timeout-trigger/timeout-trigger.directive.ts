import { Directive, ElementRef, AfterViewInit, AfterViewChecked, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[odpTimeoutTrigger]'
})
export class TimeoutTriggerDirective implements AfterViewInit, AfterViewChecked, OnDestroy {

  @Input() odpTimeoutTrigger: number;
  @Output() trigger: EventEmitter<any>;
  button: HTMLButtonElement;
  enabled: boolean;
  interval: any;
  timeout: any;
  constructor(private element: ElementRef) {
    this.trigger = new EventEmitter<any>();
  }

  ngAfterViewInit() {
    this.button = this.element.nativeElement;
  }

  ngAfterViewChecked() {
    if (this.button) {
      if (!this.button.disabled && !this.enabled) {
        this.enabled = true;
        this.button.innerText = this.button.innerText + ' (' + this.odpTimeoutTrigger + ')';
        this.interval = setInterval(() => {
          this.odpTimeoutTrigger = this.odpTimeoutTrigger - 1;
          if (this.odpTimeoutTrigger === 0) {
            clearInterval(this.interval);
          }
          const strArr = this.button.innerText.split(' ');
          strArr.pop();
          strArr.push(' (' + this.odpTimeoutTrigger + ')');
          this.button.innerText = strArr.join(' ');
        }, 1000);
        this.timeout = setTimeout(() => {
          this.trigger.emit();
        }, this.odpTimeoutTrigger * 1000);
      }
    }
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

}
