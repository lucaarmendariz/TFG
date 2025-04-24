import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BezeroService } from '../zerbitzuak/bezero.service';
import { ClienteCreationModalPage } from '../cliente-creation-modal/cliente-creation-modal.page';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { CitaService } from '../zerbitzuak/zitak.service.ts.service';

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

  // Datos para nueva cita
  citaCrear: any = {
    "data": null,
    "hasieraOrdua": null,
    "amaieraOrdua": null,
    "eserlekua": 0,
    "izena": '',
    "telefonoa": '',
    "deskribapena": '',
    "etxekoa": false
  };

  // Datos para nuevo cliente
  izena: string = '';
  abizena: string = '';
  telefonoa: string = '';
  piel: boolean = false;

  constructor(
    private modalController: ModalController,
    private bezeroService: BezeroService,
    private http: HttpClient,
    private citaService: CitaService
  ) {}

  ngOnInit() {
    // 1. Traer la cita seleccionada desde el otro componente
    const cita = this.citaService.getCita();
  
    this.citaCrear.data = cita.data;
    this.citaCrear.hasieraOrdua = cita.hasieraOrdua;
    this.citaCrear.amaieraOrdua = cita.amaieraOrdua;
    this.citaCrear.eserlekua = cita.eserlekua;
    
    // 2. Cargar clientes
    this.bezeroService.cargarClientes();
    this.bezeroService.bezeroak$.subscribe((clientes) => {
      this.bezeroak = clientes;
    });
  }
  

  // Confirmar cita y devolver los datos
  async confirmarCita() {
    // Verificar que se ha seleccionado un cliente
    const clienteSeleccionado = this.bezeroak.find((bezero) => bezero.id === this.clienteId);

    if (!clienteSeleccionado) {
      console.error('No se seleccionó un cliente.');
      return;
    }

    // Asignar los datos de la cita
    this.citaCrear.izena = clienteSeleccionado.izena;
    this.citaCrear.telefonoa = clienteSeleccionado.telefonoa;
    this.citaCrear.deskribapena = this.descripcion;
    this.citaCrear.etxekoa = this.esCentro;

    this.citaService.setCitaIzenaDesc(this.citaCrear.izena, this.citaCrear.deskribapena);

console.log(this.citaService.getCita());

    // Asegurarse de que todos los datos de la cita estén completos
    if (!this.citaCrear.data || !this.citaCrear.hasieraOrdua || !this.citaCrear.amaieraOrdua || !this.citaCrear.eserlekua) {
      console.error('Faltan datos para la cita.');
      return;
    }

    // Llamar a la función para crear la cita
    try {
      this.createCita();  // Llamar a tu función para hacer el POST
      this.modalController.dismiss();  // Cerrar la modal si todo va bien
    } catch (error) {
      console.error("Error al crear la cita:", error);
    }
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

  // Función: createCita
  createCita() {
    const { data, hasieraOrdua, amaieraOrdua, eserlekua, izena, telefonoa, deskribapena, etxekoa } = this.citaCrear;

    const json_data = {
      "data": data,
      "hasieraOrdua": hasieraOrdua,
      "amaieraOrdua": amaieraOrdua,
      "eserlekua": eserlekua,
      "izena": izena,
      "telefonoa": telefonoa,
      "deskribapena": deskribapena,
      "etxekoa": etxekoa ? "E" : "K"
    };
    
    // Realizar la solicitud POST
    this.http.post(`${environment.url}hitzorduak`, json_data, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      async () => {
        console.log('Cita creada correctamente.');
        // Si la cita se crea correctamente, se puede agregar más lógica aquí, como redirigir o mostrar un mensaje.
      },
      (error) => {
        console.error("Error al crear la cita:", error);
        throw new Error("No se ha creado la cita.");
      }
    );
  }

  // Cerrar la modal sin hacer nada
  cancelar() {
    this.modalController.dismiss();
  }
}
