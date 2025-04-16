import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-borrow-modal',
  templateUrl: './borrow-modal.component.html',
  styleUrls: ['./borrow-modal.component.scss'], // Asegúrate de que existe este archivo (puede estar vacío)
})
export class BorrowModalComponent {
  @Input() item: any;  // Recibe el producto o material que se presta
  studentName: string = ''; // Guarda el nombre del alumno

  constructor(private modalCtrl: ModalController) {}

  // Confirma el préstamo y devuelve el nombre del alumno
  confirm() {
    if (this.studentName.trim()) {
      this.modalCtrl.dismiss({ studentName: this.studentName });
    }
  }

  // Cierra el modal sin hacer cambios
  cancel() {
    this.modalCtrl.dismiss();
  }
}
