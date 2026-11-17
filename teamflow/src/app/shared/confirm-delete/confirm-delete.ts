import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-confirm-delete',
  templateUrl: './confirm-delete.html',
})
export class ConfirmDelete implements AfterViewInit {
  @Input({ required: true }) title = '';
  @Input({ required: true }) item = '';
  @Input() description = 'A törlés nem vonható vissza.';
  @Output() readonly confirmed = new EventEmitter<void>();
  @Output() readonly cancelled = new EventEmitter<void>();
  @ViewChild('dialog', { static: true }) private dialog!: ElementRef<HTMLDialogElement>;

  ngAfterViewInit(): void {
    this.dialog.nativeElement.showModal();
  }
}
