import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TxandakService } from 'src/app/service/txandak.service';

@Component({
  selector: 'app-txandak-modal',
  templateUrl: './txandak-modal.component.html',
  styleUrls: ['./txandak-modal.component.scss'],
})
export class TxandakModalComponent implements OnInit {
  nuevoTurno = { data: '', mota: '', langilea: { id: null } };
  empleados: any[] = [];

  constructor(private modalCtrl: ModalController, private txandakService: TxandakService) {}

  ngOnInit() {
    this.cargarEmpleados();
  }

  cargarEmpleados() {
    this.txandakService.getEmpleados().subscribe(
      (data) => {
        console.log('✅ Empleados cargados:', data);
        this.empleados = data;
      },
      (error) => {
        console.error('❌ Error cargando empleados:', error);
      }
    );
  }

  guardarTurno() {
    if (!this.nuevoTurno.data || !this.nuevoTurno.mota || !this.nuevoTurno.langilea.id) {
      console.error('❌ Faltan datos para guardar el turno.');
      return;
    }

    console.log('📤 Enviando turno:', this.nuevoTurno);

    this.txandakService.createTxanda(this.nuevoTurno).subscribe(
      (response) => {
        console.log('✅ Turno guardado:', response);
        this.cerrarModal(true);
      },
      (error) => {
        console.error('❌ Error guardando turno:', error);
      }
    );
  }

  cerrarModal(actualizar = false) {
    this.modalCtrl.dismiss({ actualizar });
  }
}
