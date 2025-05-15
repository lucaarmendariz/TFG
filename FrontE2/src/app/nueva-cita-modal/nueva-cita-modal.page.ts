import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { BezeroService } from '../zerbitzuak/bezero.service';
import { ClienteCreationModalPage } from '../cliente-creation-modal/cliente-creation-modal.page';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { CitaService } from '../zerbitzuak/zitak.service.ts.service';
import { GaleriaComponent } from '../components/galeria/galeria.component';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../zerbitzuak/language.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-nueva-cita-modal',
    templateUrl: './nueva-cita-modal.page.html',
    styleUrls: ['./nueva-cita-modal.page.scss'],
    standalone: false
})
export class NuevaCitaModalPage implements OnInit, OnDestroy {
  bezeroak: any[] = [];
  clienteId: string = '';
  descripcion: string = '';
  esCentro: boolean = false;

  selectedLanguage: string = 'es';
  private langSubscription!: Subscription;

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
    private bezeroService: BezeroService,
    private http: HttpClient,
    private citaService: CitaService,
    private modalController: ModalController,
    private toastController: ToastController,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.selectedLanguage = this.languageService.getCurrentLanguage();
    this.translate.use(this.selectedLanguage);

    this.langSubscription = this.languageService.currentLang$.subscribe(lang => {
      this.selectedLanguage = lang;
      this.translate.use(lang);
    });

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

  ngOnDestroy() {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
  
  async abrirGaleria() {
    const clienteSeleccionado = this.bezeroak.find(b => b.id === this.clienteId);

    if (!clienteSeleccionado || !clienteSeleccionado.historiala) {
      console.warn('No hay cliente seleccionado o no tiene historial.');
      return;
    }

    const imagenes = clienteSeleccionado.historiala
      .filter((h: any) => h.img_url && h.img_url.trim() !== '')
      .map((h: any) => h.img_url);

    if (imagenes.length === 0) {
      const msg = await this.translate.get('cita.noHistorialImages').toPromise();
      this.mostrarToast(msg, 2000, 'warning');
      return;
    }

    const modal = await this.modalController.create({
      component: GaleriaComponent,
      componentProps: { imagenes },
      cssClass: 'galeria-modal'
    });

    await modal.present();
  }

  async mostrarToast(mensaje: string, duracion: number = 2000, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color
    });
    toast.present();
  }

  async confirmarCita() {
    const clienteSeleccionado = this.bezeroak.find((bezero) => bezero.id === this.clienteId);

    if (!clienteSeleccionado) {
      const errMsg = await this.translate.get('cita.errorNoCliente').toPromise();
      console.error(errMsg);
      return;
    }

    this.citaCrear.izena = clienteSeleccionado.izena;
    this.citaCrear.telefonoa = clienteSeleccionado.telefonoa;
    this.citaCrear.deskribapena = this.descripcion;
    this.citaCrear.etxekoa = this.esCentro;

    this.citaService.setCitaIzenaDesc(this.citaCrear.izena, this.citaCrear.deskribapena);

    if (!this.citaCrear.data || !this.citaCrear.hasieraOrdua || !this.citaCrear.amaieraOrdua || !this.citaCrear.eserlekua) {
      const errMsg = await this.translate.get('cita.errorFaltanDatos').toPromise();
      console.error(errMsg);
      return;
    }

    try {
      this.createCita();
      this.modalController.dismiss(null, 'confirm'); // <- CONFIRM role
    } catch (error) {
      console.error("Error al crear la cita:", error);
    }
  }

  async crearNuevoCliente() {
    const modal = await this.modalController.create({
      component: ClienteCreationModalPage
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        const nuevoCliente = result.data;
        console.log('Nuevo cliente creado:', nuevoCliente);

        this.bezeroService.cargarClientes();
        this.clienteId = nuevoCliente.id;
      }
    });

    await modal.present();
  }

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
    
    this.http.post(`${environment.url}hitzorduak`, json_data, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      async () => {
        const successMsg = await this.translate.get('cita.creadaCorrectamente').toPromise();
        console.log(successMsg);
      },
      (error) => {
        this.translate.get('cita.errorCrear').subscribe(translated => {
          console.error(translated, error);
        });
        throw new Error("No se ha creado la cita.");
      }
    );
  }

  cancelar() {
    this.modalController.dismiss(null, 'cancel');
  }
}
