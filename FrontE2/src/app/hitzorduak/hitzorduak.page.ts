import { CitaService } from './../zerbitzuak/zitak.service.ts.service';
import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';
import { environment } from 'src/environments/environment';
import { HeaderComponent } from '../components/header/header.component';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { BezeroService } from '../zerbitzuak/bezero.service';
import { NuevaCitaModalPage } from '../nueva-cita-modal/nueva-cita-modal.page';
import { ReactiveFormsModule } from '@angular/forms'; // Importar ReactiveFormsModule


@Component({
  selector: 'app-hitzorduak',
  templateUrl: './hitzorduak.page.html',
  styleUrls: ['./hitzorduak.page.scss'],
})
export class HitzorduakPage implements OnInit {
  @ViewChild(HeaderComponent) headerComponent!: HeaderComponent;
  loading: boolean = true;
  serviciosSeleccionados: any[] = [];
  ordutegiak: any[] = [];
  asientos!: number;
  hitzorduArray: any[] = [];
  hitzorduak: any[] = [];
  tratamenduArray: any[] = [];
  tratamenduSelec: any[] = [];
  langileArray: any[] = [];
  hoursArray: any[] = [];
  rowspanAux: any[] = [];
  citaCrear: any = { "data": null, "hasieraOrdua": null, "amaieraOrdua": null, "eserlekua": 0, "izena": '', "telefonoa": '', "deskribapena": '', "etxekoa": false };
  citaEditar: any = {
    data: null,
    hasieraOrdua: null,
    amaieraOrdua: null,
    eserlekua: 0,
    izena: '',
    telefonoa: '',
    deskribapena: '',
    etxekoa: false
    };
    idLangile: any = null;
  dataSelec!: any;
  todayDate!: any;
  selectedLanguage: string = 'es';

  bezeroak: any[] = [];  // Lista de clientes
  crearNombre: string = '';
  crearApellido: string = '';
  crearTelefono: string = '';
  crearPiel: boolean = false;

  firstCell: { time: string, seat: number } | null = null;
  secondCell: { time: string, seat: number } | null = null;
  highlightedCells: { time: string, seat: number }[] = [];

  filtroBusqueda: string = '';
  hitzorduArrayFiltrado: any[] = [];

  segmentoActivo: string = 'cita'; 

  filtrarCitas() {
    const texto = this.filtroBusqueda?.toLowerCase() || '';

    if (!texto.trim()) {
      // Si no hay texto, mostrar todas las citas
      this.hitzorduArrayFiltrado = [...this.hitzorduArray];
      return
    }

    this.hitzorduArrayFiltrado = this.hitzorduArray.filter((cita: any) => {
      const cliente = cita.izena?.toLowerCase() || '';
      const telefono = cita.telefonoa?.toLowerCase() || '';
      const langile = cita.langilea?.izena?.toLowerCase() || '';
      const tratamiento = cita.etxekoa === 'E' ? 'etxekoa' : 'kanpokoa';
      const asiento = String(cita.eserlekua);
      const servicios = (cita.zerbitzuak || [])
        .map((s: any) => s.izena?.toLowerCase())
        .join(' ');
      return (
        cliente.includes(texto) ||
        langile.includes(texto) ||
        tratamiento.includes(texto) ||
        asiento.includes(texto) ||
        servicios.includes(texto) ||
        telefono.includes(texto)
      );
    });
    console.log('Citas cargadas:', this.hitzorduArray);

  }

  cambiarCliente(event: any) {
    const telefonoSeleccionado = event.target.value;
    const clienteSeleccionado = this.bezeroak.find(cliente => cliente.telefonoa === telefonoSeleccionado);
  
    if (clienteSeleccionado) {
      this.citaEditar.izena = clienteSeleccionado.izena;
      this.citaEditar.abizena = clienteSeleccionado.abizena;
      this.citaEditar.telefonoa = clienteSeleccionado.telefonoa;
    }
  }
  

  limpiarBusqueda() {
    this.filtroBusqueda = '';
    this.filtrarCitas();
  }

  mostrarFormulario = false;

  abrirFormularioEdicion(cita: any) {
    this.citaEditar = { ...cita }; // Clonamos para no alterar directamente
    this.mostrarFormulario = true;
  }

  async cerrarFormulario() {
    this.mostrarFormulario = false;
    this.citaEditar = {};
    await this.cargarHitzordu(); // Recargar citas después de la actualización
    this.limpiar_campos(); // Limpiar campos si es necesario
  }


  servicioSeleccionado(): boolean {
    return this.tratamenduArray.some(katTrat =>
      katTrat.zerbitzuak.some((trat: any) => trat.selected)
    );
  }

  preciosValidos(): boolean {
    return this.tratamenduSelec.every(katTrat =>
      !katTrat.extra || katTrat.zerbitzuak.every((trat: any) =>
        !trat.selected || (trat.precio && trat.precio > 0)
      )
    );
  }

  citaValida(): boolean {
    return this.citaEditar && this.citaEditar.data !== null;
  }


  updateHighlightedCells() {
    if (this.firstCell && this.secondCell) {
      const minTimeIndex = Math.min(
        this.hoursArray.indexOf(this.firstCell.time),
        this.hoursArray.indexOf(this.secondCell.time)
      );
      const maxTimeIndex = Math.max(
        this.hoursArray.indexOf(this.firstCell.time),
        this.hoursArray.indexOf(this.secondCell.time)
      );
      this.highlightedCells = [];
      for (let i = minTimeIndex; i <= maxTimeIndex; i++) {
        this.highlightedCells.push({ time: this.hoursArray[i], seat: this.firstCell.seat });
      }
    }
    this.resetSelection();
  }

  resetSelection() {
    this.firstCell = null;
    this.secondCell = null;
    this.highlightedCells = [];
  }

  isCellHighlighted(time: string, seat: number): boolean {
    return this.highlightedCells.some(cell => cell.time === time && cell.seat === seat);
  }

  async abrirNuevaCitaModal() {
    const modal = await this.modalController.create({
      component: NuevaCitaModalPage
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.role === 'confirm') {
        // El usuario confirmó la cita → agregar la card
        this.hitzorduArray.push(this.citaService.getCita());
        this.updateHighlightedCells();
        this.resetSelection(); // limpiar selección
        this.cargarHitzordu();
      } else if (result.role === 'cancel') {
        // El usuario canceló la cita → limpiar
        this.citaService.clearCita();
        this.resetSelection();
      }
    });
  
    await modal.present();
  }
  
  async reservar_cita(eserlekua: number, time: string) {
    if (this.citaEditar.hasieraOrduaErreala) {
      return;
    }

    if (this.citaEditar.eserlekua === 0) {
      // if (this.firstCell && this.firstCell.seat !== eserlekua) {
      //   const cambiar = await this.mostrarAlertaCambioAsiento();
      //   if (!cambiar) return;
      //   this.resetSelection();
      //   this.limpiar_campos();
      // }

      if (this.citaCrear.data) {
        if (this.citaCrear.hasieraOrdua < time) {
          this.citaCrear.amaieraOrdua = this.hoursArray[this.hoursArray.indexOf(time) + 1];
          this.secondCell = { time, seat: eserlekua };
          this.citaService.setCita(this.citaCrear.data, this.citaCrear.hasieraOrdua, this.citaCrear.amaieraOrdua, this.citaCrear.eserlekua)
          console.log('Primera: ' + this.firstCell?.time)
          console.log('segunda: ' + this.secondCell.time)
          await this.abrirNuevaCitaModal();
          this.limpiar_campos();
          this.updateHighlightedCells();
          
          this.resetSelection();
          return;
        } 
      } else {
        this.citaCrear.data = this.dataSelec;
        this.citaCrear.hasieraOrdua = time;
        this.citaCrear.amaieraOrdua = this.hoursArray[this.hoursArray.indexOf(time) + 1];
        this.citaCrear.eserlekua = eserlekua;
        this.firstCell = { time, seat: eserlekua };
        this.highlightedCells = [{ time, seat: eserlekua }];
      }
      // } else {
      //   if (this.citaEditar.data !== this.dataSelec) {
      //     const cambiarDia = await this.mostrarAlertaCambioDia();
      //     if (!cambiarDia) return;

      //     this.resetSelection();
      //     this.citaEditar.data = this.dataSelec;
      //     this.citaEditar.hasieraOrdua = time;
      //     this.citaEditar.amaieraOrdua = this.hoursArray[this.hoursArray.indexOf(time) + 1];
      //     this.citaEditar.eserlekua = eserlekua;
      //     this.firstCell = { time, seat: eserlekua };
      //     this.highlightedCells = [{ time, seat: eserlekua }];
      //     return;
      //   }

      //   if (this.citaEditar.eserlekua !== eserlekua) {
      //     const cambiarAsiento = await this.mostrarAlertaCambioAsiento();
      //     if (!cambiarAsiento) return;

      //     this.resetSelection();
      //     this.citaEditar.data = this.dataSelec;
      //     this.citaEditar.hasieraOrdua = time;
      //     this.citaEditar.amaieraOrdua = this.hoursArray[this.hoursArray.indexOf(time) + 1];
      //     this.citaEditar.eserlekua = eserlekua;
      //     this.firstCell = { time, seat: eserlekua };
      //     this.highlightedCells = [{ time, seat: eserlekua }];
      //     return;
      //   }

      //   if (this.citaEditar.hasieraOrdua < time) {
      //     this.citaEditar.amaieraOrdua = this.hoursArray[this.hoursArray.indexOf(time) + 1];
      //     this.secondCell = { time, seat: eserlekua };
      //     this.updateHighlightedCells();

      //   } else {
      //     this.citaEditar.hasieraOrdua = time;
      //     this.firstCell = { time, seat: eserlekua };
      //     this.updateHighlightedCells();
      //   }
    }
  }
  // Método llamado cuando se inicia el arrastre
  onDragStart(event: DragEvent, cita: any) {
    // Almacenamos la cita que se está arrastrando en el evento
    event.dataTransfer?.setData('cita', JSON.stringify(cita));
  }

  // Método llamado cuando se arrastra sobre una celda
  onDragOver(event: DragEvent) {
    // Evitamos el comportamiento por defecto para permitir el drop
    event.preventDefault();
  }

  // Método llamado cuando se suelta la cita (drag and drop)
  async onDrop(event: DragEvent, time: string, seat: number) {
    event.preventDefault();

    const citaJson = event.dataTransfer?.getData('cita');
    if (citaJson) {
      const cita = JSON.parse(citaJson);

      // Calcular la duración original de la cita en milisegundos
      const inicioOriginal = new Date(`${cita.data}T${cita.hasieraOrdua}`);
      const finOriginal = new Date(`${cita.data}T${cita.amaieraOrdua}`);
      const duracionMs = finOriginal.getTime() - inicioOriginal.getTime();

      // Nueva hora de inicio
      const nuevaHoraInicio = new Date(`${cita.data}T${time}`);
      // Nueva hora de fin manteniendo la duración original
      const nuevaHoraFin = new Date(nuevaHoraInicio.getTime() + duracionMs);

      // Verificamos si ya existe una cita que se solape en ese rango
      const citaExistente = this.hitzorduArray.find(c =>
        c.id !== cita.id && // Ignoramos la misma cita
        c.eserlekua === seat &&
        (
          nuevaHoraInicio < new Date(`${c.data}T${c.amaieraOrdua}`) &&
          nuevaHoraFin > new Date(`${c.data}T${c.hasieraOrdua}`)
        )
      );

      if (citaExistente) {
        this.mostrarAlertaSuperposicion();
        return;
      }

      // Si no hay superposición, editamos la cita
      if (cita.id) {
        await this.editarSitioCita(cita, time, seat); // ✅ FIXED: se pasa `time` correctamente
      }

      await this.cargarHitzordu();
    }
  }




  // Método para mostrar la alerta de superposición
  async mostrarAlertaSuperposicion(): Promise<boolean> {
    // Muestra un mensaje de alerta al usuario y espera su respuesta
    const alert = await this.alertController.create({
      header: '¡Advertencia!',
      message: "Lo sentimos, no se puede asignar la cita en este asiento y horario. El asiento ya está ocupado en este momento. Por favor, elige otro horario o asiento disponible.",
      buttons: [
        {
          text: 'Vale, gracias',
          role: 'cancel',
          handler: () => {
            return false;
          }
        },
      ]
    });

    await alert.present();
    const result = await alert.onDidDismiss();
    return result.role === 'accept';
  }




  // Método para editar una cita
  async editarSitioCita(cita: any, nuevaHoraInicioStr: string, nuevoAsiento: number) {
    // Calculamos la duración original
    const inicioOriginal = new Date(`${cita.data}T${cita.hasieraOrdua}`);
    const finOriginal = new Date(`${cita.data}T${cita.amaieraOrdua}`);
    const duracionMs = finOriginal.getTime() - inicioOriginal.getTime();

    // Nueva hora de inicio como Date
    const nuevaHoraInicio = new Date(`${cita.data}T${nuevaHoraInicioStr}`);
    // Nueva hora de fin manteniendo la duración
    const nuevaHoraFin = new Date(nuevaHoraInicio.getTime() + duracionMs);

    // Actualizamos la cita con los nuevos valores
    cita.hasieraOrdua = nuevaHoraInicioStr;
    cita.amaieraOrdua = nuevaHoraFin.toTimeString().slice(0, 5);
    cita.eserlekua = nuevoAsiento;

    const etxeko = cita.etxekoa ? "E" : "K";
    const json_data = {
      id: cita.id,
      data: cita.data,
      hasieraOrdua: cita.hasieraOrdua,
      amaieraOrdua: cita.amaieraOrdua,
      eserlekua: cita.eserlekua,
      izena: cita.izena,
      telefonoa: cita.telefonoa,
      deskribapena: cita.deskribapena,
      etxekoa: etxeko
    };

    this.http.put(`${environment.url}hitzorduak`, json_data, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      async () => {
        await this.cargarHitzordu(); 
        this.limpiar_campos(); 
      },
      (error) => {
        console.error("Error al editar la cita:", error);
        throw new Error("No se ha editado la cita.");
      }
    );
  }





  async mostrarAlertaCambioAsiento(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header: this.translate.instant('citas.modal.cambioAsiento'),
        message: this.translate.instant('citas.modal.messageCambioAsiento'),
        buttons: [
          {
            text: this.translate.instant('citas.botones.cancelar'),
            role: 'cancel',
            handler: () => resolve(false),
          },
          {
            text: this.translate.instant('citas.botones.confirmar'),
            handler: () => resolve(true),
          }
        ]
      });
      await alert.present();
    });
  }

  async mostrarAlertaCambioDia(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header: this.translate.instant('citas.modal.cambioDia'),
        message: this.translate.instant('citas.modal.messageCambioDia'),
        buttons: [
          {
            text: this.translate.instant('citas.botones.cancelar'),
            role: 'cancel',
            handler: () => resolve(false),
          },
          {
            text: this.translate.instant('citas.botones.confirmar'),
            handler: () => resolve(true),
          }
        ]
      });
      await alert.present();
    });
  }


  constructor(private translate: TranslateService, private alertCtrl: AlertController, private navCtrl: NavController,
    private http: HttpClient, private modalController: ModalController, private alertController: AlertController,
    private bezeroService: BezeroService, private citaService: CitaService,
  ) {
    this.translate.setDefaultLang('es');
    this.translate.use(this.selectedLanguage);
  }

  ngOnInit() {
    this.dataSelec = this.lortuData();
    this.todayDate = this.lortuData();
    this.cargarHitzordu();
    this.getHoursInRange();
    this.cargar_alumnos();
    this.cargarTratamenduak();
    this.filtrarCitas();
    this.bezeroService.bezeroak$.subscribe(clientes => {
      this.bezeroak = clientes;
    });
    this.bezeroService.cargarClientes();
    this.bezeroService.bezeroak$.subscribe((clientes) => {
      this.bezeroak = clientes;
    });    
    
  
    // También asegúrate de que citaEditar ya esté definido
    this.citaEditar = this.citaService.getCita();
  }

  // Función: lortuData
  lortuData(): string {
    const gaur = new Date();
    const urtea = gaur.getFullYear();
    let hilabetea: string | number = gaur.getMonth() + 1; // Los meses comienzan en 0
    let eguna: string | number = gaur.getDate();

    if (eguna < 10) {
      eguna = '0' + eguna;
    }
    if (hilabetea < 10) {
      hilabetea = '0' + hilabetea;
    }
    return `${urtea}-${hilabetea}-${eguna}`;
  }
  // ---------------------------------------------------------------------- CARGA DE DATOS --------------------------------------------------------------------------------

  // Función: cargarHitzordu
  async cargarHitzordu() {
    this.hitzorduArray = [];
    this.hitzorduak = [];

    await this.http.get(`${environment.url}hitzorduak/date/${this.dataSelec}`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      (datuak: any) => {
        this.hitzorduak = datuak.filter((hitzordu: any) => hitzordu.ezabatzeData === null);
        const eguna = formatDate(this.dataSelec, 'yyyy-MM-dd', 'en-US');
        this.hitzorduArray = this.hitzorduak.filter((hitzordu: any) => hitzordu.data.includes(eguna));
        this.hitzorduArrayFiltrado = [...this.hitzorduArray];

      },
      (error) => {
        console.error("Error al cargar citas:", error);
      },
      () => {
        this.loading = false;
      }
    );
  }

  // Función: cargar_asientos
  cargar_alumnos() {
    this.http.get(`${environment.url}ordutegiak`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      (datuak: any) => {
        this.ordutegiak = datuak.filter((ordu: any) => ordu.ezabatzeData === null);
        this.cargar_dia_seleccionado();
      },
      (error) => {
        console.log("Error al cargar los asientos:", error);
      }
    );
  }

  // Función: cargarTratamenduak
  cargarTratamenduak() {
    this.http.get(`${environment.url}zerbitzu_kategoria`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      (datuak: any) => {
        this.tratamenduArray = datuak.filter((tratamendua: any) => {
          const filteredZerbitzuak = tratamendua.zerbitzuak.filter(
            (zerbitzu: any) => zerbitzu.ezabatzeData === null
          );
          return filteredZerbitzuak.length > 0;
        }).map((tratamendua: any) => {
          return {
            ...tratamendua,
            zerbitzuak: tratamendua.zerbitzuak.filter(
              (zerbitzu: any) => zerbitzu.ezabatzeData === null
            )
          };
        });
      },
      (error) => {
        console.log("Error al cargar tratamientos:", error);
      }
    );
  }

  // ---------------------------------------------------------------------- VISTA DE DATOS --------------------------------------------------------------------------------

  // Función: getCitasAtTimeAndSeat
  getCitasAtTimeAndSeat(time: string, seatId: number) {
    const filteredCitas = this.hitzorduArray.filter(cita =>
      cita.hasieraOrdua <= time && cita.amaieraOrdua > time && cita.eserlekua === seatId
    );
    return filteredCitas;
  }

  // Función: cargar_dia_seleccionado
  cargar_dia_seleccionado() {
    const eguna = formatDate(this.dataSelec, 'yyyy-MM-dd', 'en-US');
    const egunaDate = new Date(eguna);
    let diaSemana = egunaDate.getDay();
    diaSemana = diaSemana === 0 ? 7 : diaSemana;
    // this.hitzorduArray = this.hitzorduak.filter((hitzordu: any) => 
    //   (!hitzordu.ezabatze_data || hitzordu.ezabatze_data === "0000-00-00 00:00:00") && hitzordu.data.includes(eguna)
    // );
    this.cargarHitzordu();
    const langileak = this.ordutegiak.filter((ordu: any) => {
      const hasieraDate = new Date(ordu.hasieraData);
      const amaieraDate = new Date(ordu.amaieraData);
      return (
        hasieraDate <= egunaDate && amaieraDate >= egunaDate && ordu.eguna === diaSemana
      );
    });
    if (this.langileArray.length == 0 && langileak.length > 0) {
      this.langileArray = langileak[0].taldea.langileak.filter((langile: any) => !langile.ezabatzeData);
    }
    this.asientos = langileak.length > 0 ? langileak[0].taldea.langileak.length - 1 : 0;
    this.resetSelection();
    this.citaCrear = { "data": null, "hasieraOrdua": null, "amaieraOrdua": null, "eserlekua": 0, "izena": '', "telefonoa": '', "deskribapena": '', "etxekoa": false };
    // this.limpiar_campos();
  }


  // Función: getHoursInRange
  getHoursInRange(): void {
    const startTime = new Date('2022-01-01T09:00:00');
    const endTime = new Date('2022-01-01T14:30:00');
    this.hoursArray = [];
    while (startTime <= endTime) {
      const formattedHour = startTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      this.hoursArray.push(formattedHour);
      startTime.setMinutes(startTime.getMinutes() + 30);
    }
  }

  // Función: cita_sartuta
  citaSartuta(time: string, seatId: number): boolean {
    if (time === this.hoursArray[0] && seatId === 1) {
      this.rowspanAux = [];
    }
    const filteredCitas = this.hitzorduArray.filter((cita: any) =>
      cita.hasieraOrdua <= time
      && cita.amaieraOrdua > time
      && cita.eserlekua == seatId
    );
    if (filteredCitas.length == 0) {
      return true;
    }
    const citaID = filteredCitas[0].id;
    if (this.rowspanAux.includes(citaID)) {
      return false;
    } else {
      this.rowspanAux.push(citaID);
      return true;
    }
  }

  // // Función: rowspanManagement
  rowspanManagement(time: string, seatId: number): number {
    if (time === this.hoursArray[0] && seatId === 1) {
      this.rowspanAux = [];
    }
    const filteredCitas = this.hitzorduArray.filter(cita =>
      cita.hasieraOrdua <= time && cita.amaieraOrdua > time && cita.eserlekua === seatId
    );
    if (filteredCitas.length <= 0) {
      return 1;
    }
    const citaID = filteredCitas[0].id;
    let cant = 0;
    this.rowspanAux.push(citaID);
    this.hoursArray.forEach(element => {
      if (filteredCitas[0].hasieraOrdua <= element && filteredCitas[0].amaieraOrdua > element) {
        cant++;
      }
    });
    return cant;
  }

  // -------------------------------------------------------------------- CREAR DATOS -------------------------------------------------------------------------

  // Función: createCita
  createCita() {
    const data = this.citaCrear.data;
    const hasOrdua = this.citaCrear.hasieraOrdua;
    const amaOrdua = this.citaCrear.amaieraOrdua;
    const eserlekua = this.citaCrear.eserlekua;
    const izena = this.citaCrear.izena;
    const telefonoa = this.citaCrear.telefonoa;
    const deskribapena = this.citaCrear.deskribapena;
    const etxeko = this.citaCrear.etxekoa ? "E" : "K";

    const json_data = {
      "data": data,
      "hasieraOrdua": hasOrdua,
      "amaieraOrdua": amaOrdua,
      "eserlekua": eserlekua,
      "izena": izena,
      "telefonoa": telefonoa,
      "deskribapena": deskribapena,
      "etxekoa": etxeko
    };

    this.http.post(`${environment.url}hitzorduak`, json_data, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      async () => {
        await this.cargarHitzordu(); // Asegúrate de que esta función sea adecuada para manejar la carga de citas
        this.limpiar_campos(); // Asegúrate de que esta función esté definida correctamente
      },
      (error) => {
        console.error("Error al crear la cita:", error);
        throw new Error("No se ha creado la cita.");
      }
    );
  }

  // ------------------------------------------------------------------ EDITAR DATOS ---------------------------------------------------------------

  editar_cita() {
    console.log(this.citaEditar.etxeko);
    const etxeko = this.citaEditar.etxekoa ? "E" : "K";
    const json_data = {
      "id": this.citaEditar.id,
      "data": this.citaEditar.data,
      "hasieraOrdua": this.citaEditar.hasieraOrdua,
      "amaieraOrdua": this.citaEditar.amaieraOrdua,
      "eserlekua": this.citaEditar.eserlekua,
      "izena": this.citaEditar.izena,
      "telefonoa": this.citaEditar.telefonoa,
      "deskribapena": this.citaEditar.deskribapena,
      "etxekoa": etxeko
    };

    this.http.put(`${environment.url}hitzorduak`, json_data, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      async () => {
        await this.cargarHitzordu(); // Asegúrate de que esta función sea adecuada para manejar la carga de citas
        this.limpiar_campos(); // Asegúrate de que esta función esté definida correctamente
      },
      (error) => {
        console.error("Error al editar la cita:", error);
        throw new Error("No se ha editado la cita.");
      }
    );
    // Cerrar modal después de editar
    this.modalController.dismiss({
      data: this.citaEditar,
      action: 'editada'
    });
    this.cerrarFormulario();
  }

  // ----------------------------------------------------------------- ELIMINAR DATOS -----------------------------------------------------------------

  eliminar_cita() {
    const json_data = { "id": this.citaEditar.id };

    this.http.delete(`${environment.url}hitzorduak`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(json_data)
    }).subscribe(
      async () => {
        await this.cargarHitzordu(); // Asegúrate de que esta función sea adecuada para manejar la carga de citas
        this.limpiar_campos(); // Asegúrate de que esta función esté definida correctamente
      },
      (error) => {
        console.error("Error al eliminar la cita:", error);
        throw new Error("No se ha eliminado la cita.");
      }
    );

    // Cerrar modal después de editar
    this.modalController.dismiss({
      data: this.citaEditar,
      action: 'editada'
    });
    this.cerrarFormulario();
  }

  // ------------------------------------------------------------------------------------------------------------------------------------------------------------

  changeLanguage() {
    this.translate.use(this.selectedLanguage);
    if (this.headerComponent) {
      this.headerComponent.loadTranslations();
    }
  }

  limpiar_campos() {
    this.tratamenduSelec = [];
    this.idLangile = null;
    this.citaCrear = { "data": null, "hasieraOrdua": null, "amaieraOrdua": null, "eserlekua": 0, "izena": '', "telefonoa": '', "deskribapena": '', "etxekoa": false };
    this.citaEditar = { "data": null, "hasieraOrdua": null, "amaieraOrdua": null, "eserlekua": 0, "izena": '', "telefonoa": '', "deskribapena": '', "etxekoa": false };
    this.resetSelection();
  }

  today(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  actualizarServiciosSeleccionados(servicio: any, extra: boolean, color: boolean) {
    if (servicio.selected) {
      if (!extra) {
        servicio.precio = this.citaEditar.etxekoa ? servicio.etxekoPrezioa : servicio.kanpokoPrezioa;
      }
    }
    servicio.color = color;
    const index = this.serviciosSeleccionados.findIndex(s => s.id === servicio.id);
    if (servicio.selected && index === -1) {
      this.serviciosSeleccionados.push(servicio);
    } else if (!servicio.selected && index !== -1) {
      this.serviciosSeleccionados.splice(index, 1);
    }
    console.log(this.serviciosSeleccionados)
  }

  asignar_cita() {
    const json_data = { "id": this.citaEditar.id };

    this.http.put(`${environment.url}hitzorduak/asignar/${this.idLangile}`, json_data, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      async () => {
        await this.cargarHitzordu(); // Asegúrate de que esta función sea adecuada para manejar la carga de citas
        this.limpiar_campos(); // Asegúrate de que esta función esté definida correctamente
      },
      (error) => {
        console.error("Error al asignar la cita:", error);
        throw new Error("No se ha asignado la cita.");
      }
    );
    this.cerrarFormulario();
  }

  // Función: generar_ticket
  generar_ticket() {
    const color = this.serviciosSeleccionados.some(s => s.color === true);

    const json_data = this.serviciosSeleccionados.map(servicio => ({
      "hitzordua": { "id": this.citaEditar.id },
      "zerbitzuak": { "id": servicio.id },
      "prezioa": servicio.precio
    }));

    this.http.post(`${environment.url}ticket_lerroak`, json_data, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      async (datuak: any) => {
        await this.cargarHitzordu();
        this.limpiar_campos();

        const alert = await this.alertCtrl.create({
          header: this.translate.instant('citas.modal.ticket'),
          message: this.translate.instant('citas.modal.messageDownload'),
          buttons: [
            {
              text: this.translate.instant('citas.botones.cancelar'),
              role: this.translate.instant('citas.botones.cancelar'),
            },
            {
              text: this.translate.instant('citas.botones.descargar'),
              handler: () => {
                this.descargar_ticket(datuak);
              }
            }
          ]
        });
        await alert.present();

        if (color) {
          const alert2 = await this.alertCtrl.create({
            header: this.translate.instant('citas.modal.redirect'),
            message: this.translate.instant('citas.modal.messageRedirect'),
            buttons: [
              {
                text: this.translate.instant('citas.botones.cancelar'),
                role: this.translate.instant('citas.botones.cancelar'),
              },
              {
                text: this.translate.instant('citas.botones.confirmar'),
                handler: () => {
                  this.navCtrl.navigateForward('/produktuak');
                }
              }
            ]
          });
          await alert2.present();
        }
      },
      (error) => {
        console.error("Error en generación de cita:", error);
      }
    );
    this.cerrarFormulario();
  }

  descargar_ticket(datuak: any) {
    const pdf = new jsPDF();
    const margenIzquierdo = 10;
    let posicionY = 20;
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("Ticket de Cita", margenIzquierdo, posicionY);
    posicionY += 10;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Data: ${datuak.data}`, margenIzquierdo, posicionY);
    posicionY += 7;
    pdf.text(`Hasiera Ordua: ${datuak.hasieraOrduaErreala}`, margenIzquierdo, posicionY);
    posicionY += 7;
    pdf.text(`Amaiera Ordua: ${datuak.amaieraOrduaErreala}`, margenIzquierdo, posicionY);
    posicionY += 7;
    pdf.text(`Langilea: ${datuak.langilea?.izena}`, margenIzquierdo, posicionY);
    posicionY += 10;
    const head = [
      ['Zerbitzua', 'Prezioa (€)']
    ];
    const body = datuak.lerroak.map((lerro: any) => [
      lerro.zerbitzuak.izena,
      lerro.prezioa.toFixed(2)
    ]);
    autoTable(pdf, {
      startY: posicionY,
      margin: { left: margenIzquierdo, right: margenIzquierdo },
      head: head,
      body: body,
      theme: 'grid',
      styles: { fontSize: 10, halign: 'center' },
      headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255] }
    });
    posicionY = (pdf as any).lastAutoTable.finalY + 10;
    pdf.setFont("helvetica", "bold");
    pdf.text(
      `PREZIO TOTALA: ${datuak.prezioTotala.toFixed(2)} €`,
      margenIzquierdo,
      posicionY
    );
    pdf.save(`ticket_${datuak.id}.pdf`);
  }

}
