import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tabla-bezero',
  templateUrl: './tabla-bezero.component.html',
  styleUrls: ['./tabla-bezero.component.scss'],
})
export class TablaBezeroComponent {
  @Input() bezeroak: any[] = [];
  @Output() seleccionar = new EventEmitter<any>();

  constructor() {}

  seleccionarBezero(bezero: any) {
    this.seleccionar.emit(bezero);
  }
}
