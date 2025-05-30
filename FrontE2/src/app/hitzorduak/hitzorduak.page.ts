import { CitaService } from './../zerbitzuak/zitak.service.ts.service';
import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { environment } from 'src/environments/environment';
import { HeaderComponent } from '../components/header/header.component';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { BezeroService } from '../zerbitzuak/bezero.service';
import { NuevaCitaModalPage } from '../nueva-cita-modal/nueva-cita-modal.page';
import { LanguageService } from '../zerbitzuak/language.service';


@Component({
  selector: 'app-hitzorduak',
  templateUrl: './hitzorduak.page.html',
  styleUrls: ['./hitzorduak.page.scss'],
  standalone: false
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
  citaEditar: any = { "data": null, "hasieraOrdua": null, "amaieraOrdua": null, "eserlekua": 0, "izena": '', "telefonoa": '', "deskribapena": '', "etxekoa": false };

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

  segmentoActivo: string = 'editatu';

  // Método para filtrar las citas
  filtrarCitas() {
    const texto = this.filtroBusqueda?.toLowerCase() || '';

    if (!texto.trim()) {
      // Si no hay texto, mostrar todas las citas
      this.hitzorduArrayFiltrado = [...this.hitzorduArray];
      return;
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
  }

  isGenerarTicketDisabled(): boolean {
    // Verificar si el alumno está seleccionado, al menos un servicio está seleccionado, y el dinero recibido es mayor que 0
    return !(this.citaEditar.langilea &&
      this.tratamenduArray.some(katTrat => katTrat.zerbitzuak.some((trat: any) => trat.selected)) &&
      this.dineroCliente > 0);
  }


  cambiarCliente(telefonoSeleccionado: string) {
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
    this.cargarHitzordu();
    this.citaEditar = { ...cita }; // Clonamos para no alterar directamente
    this.citaEditar.etxekoa = this.citaEditar.etxekoa === 'E';
    this.mostrarFormulario = true;
  }


  async cerrarFormulario() {
    this.mostrarFormulario = false;
    this.citaEditar = {};
    await this.cargarHitzordu(); // Recargar citas después de la actualización
    this.limpiar_campos(); // Limpiar campos si es necesario
    this.limpiarCamposTicket();
  }


  servicioSeleccionado(): boolean {
    return this.tratamenduArray.some(katTrat =>
      katTrat.zerbitzuak.some((trat: any) => trat.selected)
    );
  }

  esAlumnoOcupado(idLangile: number): boolean {
    return this.hitzorduArray.some(cita =>

      cita.id !== this.citaEditar.id && // ignorar la cita que estás editando
      cita.data === this.citaEditar.data &&
      cita.hasieraOrdua === this.citaEditar.hasieraOrdua &&
      cita.langilea?.id === idLangile
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

  resetSelectionToFirst() {
    this.firstCell = this.secondCell;
    this.updateHighlightedCells();
  }

  async reservar_cita(eserlekua: number, time: string) {

    if (this.citaEditar.eserlekua === 0) {
      if (this.citaCrear.data) {
        this.secondCell = { time, seat: eserlekua };

        // Validar que los asientos coincidan
        if (this.firstCell?.seat !== this.secondCell.seat) {
          // Resetear los campos si el asiento ha cambiado
          this.limpiar_campos();

          // Actualizar las celdas resaltadas inmediatamente con el nuevo asiento
          this.firstCell = { time, seat: eserlekua };
          this.highlightedCells = [{ time, seat: eserlekua }];

          // Llamar a updateHighlightedCells para reflejar los cambios
          this.updateHighlightedCells();
          this.resetSelectionToFirst();
          return;
        }

        // Ordenar las horas sin importar el orden de selección
        const index1 = this.hoursArray.indexOf(this.firstCell.time);
        const index2 = this.hoursArray.indexOf(this.secondCell.time);
        const inicioIndex = Math.min(index1, index2);
        const finIndex = Math.max(index1, index2);

        // Verificar si ya existe una cita entre el rango de tiempo
        const citasEnRango = await this.verificarCitasExistentes(inicioIndex, finIndex, eserlekua);

        if (citasEnRango.length > 0) {
          // Si ya hay citas en el rango, mostrar alerta
          this.mostrarAlertaSuperposicion();
          return;
        }

        // Si no hay citas, continuar con la creación de la cita
        this.citaCrear.hasieraOrdua = this.hoursArray[inicioIndex];
        this.citaCrear.amaieraOrdua = this.hoursArray[finIndex + 1] || this.hoursArray[finIndex];
        this.citaCrear.eserlekua = eserlekua;

        this.citaService.setCita(this.citaCrear.data, this.citaCrear.hasieraOrdua, this.citaCrear.amaieraOrdua, this.citaCrear.eserlekua);
        await this.abrirNuevaCitaModal();

        this.limpiar_campos();
        this.updateHighlightedCells();
        this.resetSelection();
        return;
      } else {
        // Primera selección
        this.citaCrear.data = this.dataSelec;
        this.citaCrear.hasieraOrdua = time;
        this.citaCrear.amaieraOrdua = this.hoursArray[this.hoursArray.indexOf(time) + 1];
        this.citaCrear.eserlekua = eserlekua;
        this.firstCell = { time, seat: eserlekua };
        this.highlightedCells = [{ time, seat: eserlekua }];
      }
    }
  }

  // Método para verificar si hay citas existentes entre dos horas
  async verificarCitasExistentes(inicioIndex: number, finIndex: number, eserlekua: number) {
    // Recorremos todas las citas para verificar si se solapan con el rango de tiempo seleccionado
    return this.hitzorduArray.filter((cita: any) => {
      const citaInicioIndex = this.hoursArray.indexOf(cita.hasieraOrdua);
      const citaFinIndex = this.hoursArray.indexOf(cita.amaieraOrdua);

      // Verificamos si la cita se solapa con el rango de la selección
      const solapa = (cita.eserlekua === eserlekua) &&
        ((citaInicioIndex < finIndex && citaFinIndex > inicioIndex));
      return solapa;
    });
  }

  bloqueoHoraInicio: Date | null = null;
  bloqueoHoraFin: Date | null = null;


  ajustarHora(campo: 'hasieraOrdua' | 'amaieraOrdua', incremento: number): void {
    const fecha = this.citaEditar.data;
    const horaActual = this.citaEditar[campo];

    if (!fecha || !horaActual) {
      console.warn("Fecha u hora inválida al ajustar");
      return;
    }

    const horaNueva = new Date(`${fecha}T${horaActual}`);

    // Comprobar bloqueos
    if (campo === 'hasieraOrdua' && this.bloqueoHoraInicio) {
      if ((incremento > 0 && horaNueva >= this.bloqueoHoraInicio) || (incremento < 0 && horaNueva <= this.bloqueoHoraInicio)) {
        console.log('Ajuste bloqueado para hora de inicio');
        return;
      }
    }
    if (campo === 'amaieraOrdua' && this.bloqueoHoraFin) {
      if ((incremento > 0 && horaNueva >= this.bloqueoHoraFin) || (incremento < 0 && horaNueva <= this.bloqueoHoraFin)) {
        console.log('Ajuste bloqueado para hora de fin');
        return;
      }
    }

    horaNueva.setMinutes(horaNueva.getMinutes() + incremento);

    const horaFormateada = horaNueva.toTimeString().substring(0, 5) + ':00';
    const citaTemp = { ...this.citaEditar, [campo]: horaFormateada };

    // Validaciones de hora
    const horaMin = campo === 'hasieraOrdua' ? '09:00:00' : '09:00:00';
    const horaMax = campo === 'amaieraOrdua' ? '14:30:00' : '14:00:00';

    if (horaFormateada < horaMin || horaFormateada > horaMax) {
      console.log('Hora fuera de límites permitidos');
      return;
    }

    // Prevenir que la hora de inicio sea igual o posterior a la de fin
    if (campo === 'hasieraOrdua' && horaFormateada >= this.citaEditar.amaieraOrdua) return;
    if (campo === 'amaieraOrdua' && horaFormateada <= this.citaEditar.hasieraOrdua) return;

    // Comprobar solapamiento
    const haySuperposicion = this.checkSuperposicion(citaTemp);

    if (haySuperposicion) {
      // Bloquear ajustes en esta dirección
      if (campo === 'hasieraOrdua') this.bloqueoHoraInicio = horaNueva;
      if (campo === 'amaieraOrdua') this.bloqueoHoraFin = horaNueva;

      this.mostrarAlertaSuperposicion();
      return;
    }

    // Si no hay superposición, aplicar hora nueva y limpiar bloqueo
    this.citaEditar[campo] = horaFormateada;
    if (campo === 'hasieraOrdua') this.bloqueoHoraInicio = null;
    if (campo === 'amaieraOrdua') this.bloqueoHoraFin = null;
  }


  checkSuperposicion(cita: any): boolean {
    if (!cita || !cita.data || !cita.hasieraOrdua || !cita.amaieraOrdua || cita.eserlekua == null) {
      return false;
    }

    const inicioNueva = new Date(`${cita.data}T${cita.hasieraOrdua}`);
    const finNueva = new Date(`${cita.data}T${cita.amaieraOrdua}`);

    return this.hitzorduak.some((otraCita: any) => {
      if (
        otraCita.id === cita.id || // no compararse consigo misma
        otraCita.data !== cita.data ||
        otraCita.eserlekua !== cita.eserlekua
      ) {
        return false;
      }

      const inicioOtra = new Date(`${otraCita.data}T${otraCita.hasieraOrdua}`);
      const finOtra = new Date(`${otraCita.data}T${otraCita.amaieraOrdua}`);

      // Verificar solapamiento
      return (
        (inicioNueva < finOtra) && (finNueva > inicioOtra)
      );
    });
  }


  async mostrarAlertaHorasIguales() {
    const alert = await this.alertController.create({
      header: 'Horas inválidas',
      message: 'La hora de inicio y la de fin no pueden ser iguales.',
      buttons: ['Entendido']
    });

    await alert.present();
  }

  async mostrarAlertaRangoHorario(tipo: 'inicio' | 'fin') {
    const mensaje = tipo === 'inicio'
      ? 'La hora de inicio no puede ser antes de las 09:00.'
      : 'La hora de fin no puede ser después de las 14:30.';

    const alert = await this.alertController.create({
      header: 'Horario no permitido',
      message: mensaje,
      buttons: ['Aceptar']
    });

    await alert.present();
  }




  async mostrarAlertaAsientosDiferentes() {
    const alert = await this.alertController.create({
      header: 'Aviso',
      message: 'No se puede asignar una cita para un cliente en dos asientos diferentes.',
      buttons: ['Aceptar']
    });

    await alert.present();
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


  constructor(private changeDetector: ChangeDetectorRef, private translate: TranslateService, private alertCtrl: AlertController, private navCtrl: NavController,
    private http: HttpClient, private modalController: ModalController, private alertController: AlertController,
    private bezeroService: BezeroService, private citaService: CitaService, private languageService: LanguageService
  ) {
    this.selectedLanguage = this.languageService.getCurrentLanguage();
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
    this.hitzorduArray.forEach(cita => {
      if (cita.langilea && !cita.prezioTotala) {
        this.startTimer(cita);
      }
    });

    this.tratamenduArray.forEach(servicio => {
      if (!servicio.selected) {
        servicio.precio = this.citaEditar.etxekoa ? servicio.etxekoPrezioa : servicio.kanpokoPrezioa;
      }
    });

  }

  timeElapsedMap: { [key: string]: string } = {};
  private intervals: { [key: string]: any } = {};

  ngOnDestroy() {
    // Limpiar todos los intervalos al destruir el componente
    Object.values(this.intervals).forEach(interval => clearInterval(interval));
  }

  startCronometros(citas: any[]) {
  citas.forEach((cita: any) => {
    if (cita.hasieraOrduaErreala) {
      const startTimeReal = new Date(`${cita.data}T${cita.hasieraOrduaErreala}`).getTime();
      this.startTimer(cita, startTimeReal);
    }
  });
}


  // Método para calcular el tiempo transcurrido en minutos y segundos
  calculateElapsedTime(cita: any): string {
    if (cita.hasieraOrduaErreala && cita.amaieraOrduaErreala) {
      const startTime = new Date(`${cita.data}T${cita.hasieraOrduaErreala}`).getTime();
      const endTime = new Date(`${cita.data}T${cita.amaieraOrduaErreala}`).getTime();
      const elapsedTime = endTime - startTime; // Tiempo en milisegundos

      // Convertir el tiempo transcurrido a minutos y segundos
      const minutes = Math.floor(elapsedTime / 60000);
      const seconds = Math.floor((elapsedTime % 60000) / 1000);

      return `${this.pad(minutes)}:${this.pad(seconds)}`; // Devuelve el tiempo formateado
    }
    return '';
  }

  startTimer(cita: any, startTime?: number) {
  if (this.intervals[cita.id]) return;

  const timerStartTime = startTime || Date.now();
  this.intervals[cita.id] = setInterval(() => {
    const now = Date.now();
    const diff = now - timerStartTime; // ❌ elimina `+ elapsedTime`
    this.timeElapsedMap[cita.id] = this.formatTime(diff);
  }, 1000);
}


  divideTimeByTwo(time: string): string {
  // Convertir el tiempo de formato 'HH:MM:SS' o 'MM:SS' a horas, minutos y segundos
  const parts = time.split(':').map(num => parseInt(num, 10));
  let hours = 0, minutes = 0, seconds = 0;

  if (parts.length === 3) {
    [hours, minutes, seconds] = parts;
  } else if (parts.length === 2) {
    [minutes, seconds] = parts;
  }

  // Calcular el total de segundos
  const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;

  // Dividir entre 2
  const dividedSeconds = Math.floor(totalSeconds / 2);

  // Obtener horas, minutos y segundos del resultado
  const newHours = Math.floor(dividedSeconds / 3600);
  const newMinutes = Math.floor((dividedSeconds % 3600) / 60);
  const newSecs = dividedSeconds % 60;

  return `${this.pad(newHours)}:${this.pad(newMinutes)}:${this.pad(newSecs)}`;
}


  // Método para detener el cronómetro
  stopTimer(cita: any) {
    const intervalId = this.intervals[cita.id];
    if (intervalId) {
      clearInterval(intervalId);
      delete this.intervals[cita.id];
    }
  }

  // Método para formatear el tiempo (minutos:segundos)
  formatTime(diff: number) {
  const hours = Math.floor(diff / 3600000); // 1 hora = 3.6 millones de ms
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
}


  // Método para rellenar con ceros en caso de que los minutos o segundos sean menores a 10
  pad(num: number) {
    return num < 10 ? `0${num}` : `${num}`;
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
        this.startCronometros(this.hitzorduArrayFiltrado);
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
        this.inicializarPreciosServicios();
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

  cargar_dia_seleccionado() {
  const eguna = formatDate(this.dataSelec, 'yyyy-MM-dd', 'en-US');
  const egunaDate = new Date(eguna);
  let diaSemana = egunaDate.getDay();
  diaSemana = diaSemana === 0 ? 7 : diaSemana;

  this.cargarHitzordu();

  const langileak = this.ordutegiak.filter((ordu: any) => {
    const hasieraDate = new Date(ordu.hasieraData);
    const amaieraDate = new Date(ordu.amaieraData);
    return (
      hasieraDate <= egunaDate && amaieraDate >= egunaDate && ordu.eguna === diaSemana
    );
  });

  if (langileak.length > 0) {
    const langileVivos = langileak[0].taldea.langileak.filter((l: any) => !l.ezabatzeData);
    this.langileArray = langileVivos;
    this.asientos = langileVivos.length;
  } else {
    this.asientos = 0;
  }

  this.resetSelection();
  this.citaCrear = {
    data: null,
    hasieraOrdua: null,
    amaieraOrdua: null,
    eserlekua: 0,
    izena: '',
    telefonoa: '',
    deskribapena: '',
    etxekoa: false
  };
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
    this.languageService.setLanguage(this.selectedLanguage);
  }

  limpiar_campos() {
    this.tratamenduSelec = [];
    this.idLangile = null;
    this.citaCrear = { "data": null, "hasieraOrdua": null, "amaieraOrdua": null, "eserlekua": 0, "izena": '', "telefonoa": '', "deskribapena": '', "etxekoa": false };
    this.citaEditar = { "data": null, "hasieraOrdua": null, "amaieraOrdua": null, "eserlekua": 0, "izena": '', "telefonoa": '', "deskribapena": '', "etxekoa": false };
    this.resetSelection();
    this.firstCell = null;
  }

  today(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  precioTotal: number = 0;
  dineroCliente: number = 0;
  cambio: number = 0;

  actualizarServiciosSeleccionados(trat: any, extraFlag: boolean, color: string) {
  console.log(trat);
  const index = this.serviciosSeleccionados.findIndex(s => s.id === trat.id);

  if (trat.selected) {
    // ✅ Usamos las claves correctas: etxekoPrezioa y kanpokoPrezioa
    const precioBase = this.citaEditar.etxekoa ? trat.etxekoPrezioa : trat.kanpokoPrezioa;

    if (index === -1) {
      this.serviciosSeleccionados.push({
        ...trat,
        precioBase: precioBase ?? 0,
        extraPrecio: trat.extraPrecio ?? 0,
        color: color
      });
    } else {
      this.serviciosSeleccionados[index].precioBase = precioBase ?? 0;
      this.serviciosSeleccionados[index].extraPrecio = trat.extraPrecio ?? 0;
    }
  } else {
    if (index !== -1) {
      this.serviciosSeleccionados.splice(index, 1);
    }
  }

  this.calcularPrecioTotal();
  this.actualizarCambio();
}







  limpiarCamposTicket() {
    // Desmarcar todos los servicios en cada categoría
    this.tratamenduArray.forEach((katTrat: any) => {
      katTrat.zerbitzuak.forEach((servicio: any) => {
        servicio.selected = false;
        servicio.color = false;
      });
    });

    // Vaciar servicios seleccionados
    this.serviciosSeleccionados = [];

    // Reiniciar totales
    this.precioTotal = 0;
    this.dineroCliente = 0;
    this.cambio = 0;
  }

  // Función para calcular el cambio
  calcularCambio() {
    if (this.dineroCliente >= this.precioTotal) {
      this.cambio = this.dineroCliente - this.precioTotal;
    } else {
      this.cambio = 0; // Si el cliente no ha dado suficiente dinero
    }
  }


  calcularPrecioTotal() {
  this.precioTotal = this.serviciosSeleccionados.reduce((acc, servicio) => {
    const base = servicio.precioBase ?? 0;     // Usamos el precio correcto (etxeko o kanpoko)
    const extra = servicio.extraPrecio ?? 0;   // Sumamos el extra si aplica
    return acc + base + extra;
  }, 0);
}

  actualizarDineroCliente(event: any) {
  this.dineroCliente = Number(event.target.value) || 0;
  this.actualizarCambio();
}
actualizarCambio() {
  this.cambio = this.dineroCliente - this.precioTotal;
  if (this.cambio < 0) this.cambio = 0;
}

  asignar_cita() {
    const json_data = { "id": this.citaEditar.id };
    this.startTimer(this.citaEditar);

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

  generar_ticket() {
  const color = this.serviciosSeleccionados.some(s => s.color === true);

  this.stopTimer(this.citaEditar);

  // Preparamos los datos para el PDF (usando precioBase)
  const lineasPDF = this.serviciosSeleccionados.map(servicio => ({
    izena: servicio.izena,
    precioBase: servicio.precioBase ?? 0,
    extra: servicio.extraPrecio ?? 0,
    precioTotal: (servicio.precioBase ?? 0) + (servicio.extraPrecio ?? 0)
  }));

  // Datos a enviar al backend (precio total por servicio)
  const json_data = this.serviciosSeleccionados.map(servicio => ({
    "hitzordua": { "id": this.citaEditar.id },
    "zerbitzuak": { "id": servicio.id },
    "prezioa": (servicio.precioBase ?? 0) + (servicio.extraPrecio ?? 0)
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

      // Añadimos los datos del frontend para mostrar en el PDF
      datuak.lerroak = lineasPDF.map(item => ({
        zerbitzuak: { izena: item.izena },
        prezioa: item.precioTotal,
        extra: item.extra
      }));

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
                this.navCtrl.navigateForward('/produktuak').then(() => {
                  window.location.reload();
                });
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

  this.limpiarCamposTicket();
  this.cerrarFormulario();
}




  inicializarPreciosServicios() {
    this.cargarHitzordu();
    this.tratamenduArray.forEach((katTrat: any) => {
      katTrat.zerbitzuak.forEach((servicio: any) => {
        // Inicializa el precio en base al tipo de cita
        servicio.precio = this.citaEditar.etxekoa ? servicio.etxekoPrezioa : servicio.kanpokoPrezioa;
      });
    });
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

  // Limpiar la hora para mostrar solo hasta los segundos
  const amaieraOrdua = datuak.amaieraOrduaErreala?.split('.')[0] ?? '-';
  pdf.text(`Amaiera Ordua: ${amaieraOrdua}`, margenIzquierdo, posicionY);
  posicionY += 7;

  pdf.text(`Langilea: ${datuak.langilea?.izena ?? '-'}`, margenIzquierdo, posicionY);
  posicionY += 10;

  const head = [['Zerbitzua', 'Prezioa (€)', 'Extra (€)']];

  const body = (datuak.lerroak ?? []).map((lerro: any) => [
    lerro.zerbitzuak?.izena ?? '-',
    ((lerro.prezioa ?? 0) - (lerro.extra ?? 0)).toFixed(2),
    (lerro.extra ?? 0).toFixed(2)
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

  const precioTotalCalculado = (datuak.lerroak ?? []).reduce((total: number, lerro: any) => {
    const precio = Number(lerro.prezioa ?? 0);
    return total + precio;
  }, 0);

  pdf.setFont("helvetica", "bold");
  pdf.text(`PREZIO TOTALA: ${precioTotalCalculado.toFixed(2)} €`, margenIzquierdo, posicionY);
  posicionY += 10;

  pdf.save(`ticket_${datuak.id ?? 'unknown'}.pdf`);
}



}
