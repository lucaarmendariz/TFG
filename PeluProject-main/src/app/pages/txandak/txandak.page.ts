import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { TxandakService } from 'src/app/service/txandak.service';
import { TxandakModalComponent } from 'src/app/shared/modals/txandak-modal/txandak-modal.component';

@Component({
  selector: 'app-txandak',
  templateUrl: './txandak.page.html',
  styleUrls: ['./txandak.page.scss'],
})
export class TxandakPage implements OnInit {
  txandakList: any[] = [];
  limpiezaList: any[] = [];
  recepcionList: any[] = [];
  fechaSeleccionada: string = ''; 
  fechasDisponibles: string[] = []; 

  constructor(
    private txandakService: TxandakService,
    private alertController: AlertController,
    private modalController: ModalController // <-- Necesario para abrir el modal
  ) {}

  ngOnInit() {
    this.generarFechasDisponibles();
  }

  generarFechasDisponibles() {
    const hoy = new Date();
    for (let i = 0; i < 7; i++) {
      const fecha = new Date();
      fecha.setDate(hoy.getDate() - i);
      this.fechasDisponibles.push(fecha.toISOString().split('T')[0]);
    }
    this.fechaSeleccionada = this.fechasDisponibles[0]; 
    this.loadTurnosPorFecha();
  }

  actualizarFecha(event: any) {
    this.fechaSeleccionada = event.detail.value;
    console.log('📅 Fecha seleccionada:', this.fechaSeleccionada);
    this.loadTurnosPorFecha();
  }

  loadTurnosPorFecha() {
    console.log('🔄 Cargando turnos para:', this.fechaSeleccionada);
    this.txandakService.getTurnosPorFecha(this.fechaSeleccionada).subscribe(
      (data) => {
        console.log('✅ Turnos obtenidos:', data);
        this.txandakList = data || [];
        this.limpiezaList = this.txandakList.filter(t => t.mota === 'G');
        this.recepcionList = this.txandakList.filter(t => t.mota === 'M');
      },
      (error) => {
        console.error('❌ Error al cargar los turnos:', error);
        this.txandakList = [];
        this.limpiezaList = [];
        this.recepcionList = [];
      }
    );
  }

  async abrirFormularioNuevoTurno() {
    const modal = await this.modalController.create({
      component: TxandakModalComponent,
    });
    await modal.present();

    // Refrescar la lista después de cerrar el modal
    modal.onDidDismiss().then(() => this.loadTurnosPorFecha());
  }

async deleteTxanda(id: number) {
  const alert = await this.alertController.create({
    header: 'Confirmar',
    message: '¿Seguro que deseas eliminar este turno?',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar',
        handler: () => {
          // Filtramos el elemento de la lista en el frontend, sin llamar al backend
          this.txandakList = this.txandakList.filter(txanda => txanda.id !== id);
          this.limpiezaList = this.limpiezaList.filter(txanda => txanda.id !== id);
          this.recepcionList = this.recepcionList.filter(txanda => txanda.id !== id);
        },
      },
    ],
  });
  await alert.present();
}
}

