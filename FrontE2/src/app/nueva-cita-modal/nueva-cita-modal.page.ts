import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BezeroService } from '../zerbitzuak/bezero.service';  // Asegúrate de que la ruta sea correcta
import { ClienteCreationModalPage } from '../cliente-creation-modal/cliente-creation-modal.page';

@Component({
  selector: 'app-nueva-cita-modal',
  templateUrl: './nueva-cita-modal.page.html',
  styleUrls: ['./nueva-cita-modal.page.scss'],
})
export class NuevaCitaModalPage implements OnInit {
  bezeroak: any[] = [];
  clienteId: string = '';
  descripcion: string = '';
  esCentro: boolean = false;

  // Datos para nuevo cliente
  izena: string = '';
  abizena: string = '';
  telefonoa: string = '';
  piel: boolean = false;

  constructor(
    private modalController: ModalController,
    private bezeroService: BezeroService
  ) {}

  ngOnInit() {
    // Cargar los clientes existentes
    this.bezeroService.cargarClientes();
    this.bezeroService.bezeroak$.subscribe((clientes) => {
      this.bezeroak = clientes;
    });
  }

  // Confirmar cita y devolver los datos
  confirmarCita() {
    const clienteSeleccionado = this.bezeroak.find((bezero) => bezero.id === this.clienteId);

    if (!clienteSeleccionado) {
      console.error('No se seleccionó un cliente.');
      return;
    }

    const cita = {
      cliente: clienteSeleccionado,
      descripcion: this.descripcion,
      esCentro: this.esCentro ? 'E' : 'K',
    };

    // Devolvemos los datos de la cita y cerramos la modal
    this.modalController.dismiss(cita);
  }

   // Crear un nuevo cliente
   async crearNuevoCliente() {
    const modal = await this.modalController.create({
      component: ClienteCreationModalPage  // Abre la modal de creación de cliente
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        // Si se crea un nuevo cliente, actualizamos la lista de clientes y lo seleccionamos automáticamente
        const nuevoCliente = result.data;
        console.log('Nuevo cliente creado:', nuevoCliente);

        // Recargar la lista de clientes y seleccionar el nuevo cliente
        this.bezeroService.cargarClientes();
        this.clienteId = nuevoCliente.id;
      }
    });

    await modal.present();  // Presentar la modal
  }
  

  // Cerrar la modal sin hacer nada
  cancelar() {
    this.modalController.dismiss();
  }
}
