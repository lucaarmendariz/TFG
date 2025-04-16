import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-info-cita',
  templateUrl: './info-cita.component.html',
  styleUrls: ['./info-cita.component.scss'],
})
export class InfoCitaComponent implements OnInit {
  @Input() cita: any;
  alumnos: any[] = []; // Lista de alumnos filtrados
  timer: any;
  tiempoInicio: number = 0; // Timestamp de inicio
  tiempoFormato: string = '00:00';
  estadoGuardado: string = '';
  trabajadorSeleccionado: boolean = false;
  mostrarBotonTicket: boolean = false;

  constructor(
    private modalController: ModalController,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarAlumnos();
    this.cargarTemporizador();
  }

  cerrarModal() {
    this.modalController.dismiss();
  }

  cargarTemporizador() {
    const guardado = localStorage.getItem(`cita_${this.cita.id}_tiempo`);
    const estadoGuardado = localStorage.getItem(`cita_${this.cita.id}_estado`);

    if (guardado && estadoGuardado === 'En proceso') {
      this.tiempoInicio = parseInt(guardado, 10);
      this.cita.estado = estadoGuardado;
      this.actualizarTiempo();
      this.iniciarContador();
    }
  }

  startTimer() {
    if (this.cita.estado !== 'Pendiente') return;

    this.cita.estado = 'En proceso';
    this.tiempoInicio = Date.now();

    localStorage.setItem(`cita_${this.cita.id}_tiempo`, this.tiempoInicio.toString());
    localStorage.setItem(`cita_${this.cita.id}_estado`, this.cita.estado);

    this.iniciarContador();
  }

  iniciarContador() {
    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(() => {
      this.actualizarTiempo();
    }, 1000);
  }

  actualizarTiempo() {
    const tiempoActual = Date.now();
    const tiempoTranscurrido = Math.floor((tiempoActual - this.tiempoInicio) / 1000);

    const minutos = Math.floor(tiempoTranscurrido / 60);
    const segundos = tiempoTranscurrido % 60;

    this.tiempoFormato = `${this.pad(minutos)}:${this.pad(segundos)}`;
  }

  pad(value: number): string {
    return value < 10 ? `0${value}` : value.toString();
  }

  finalizarServicio() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.cita.estado = 'Finalizado';
    this.cita.duracionTotal = this.tiempoFormato;

    localStorage.removeItem(`cita_${this.cita.id}_tiempo`);
    localStorage.removeItem(`cita_${this.cita.id}_estado`);
    this.mostrarBotonTicket = true;
  }

  descargarTicket() {
    const ticketData = {
      cliente: this.cita?.izena || '',
      alumno: this.cita?.alumno || '',
      servicios: this.cita?.deskribapena || 'Sin descripción',
      precioFinal: this.cita?.precio || 0,
      duracionTotal: this.cita?.duracionTotal || '00:00',
    };
  
    sessionStorage.setItem('ticketData', JSON.stringify(ticketData));
  
    this.router.navigate(['/tickets']).then(() => {
      this.modalController.dismiss(); // Cierra el modal después de navegar
    });
  }
  

  cargarAlumnos() {
    if (!this.cita?.data) return;

    this.http.get<any[]>('http://localhost:8080/taldeak').subscribe((grupos) => {
      const grupoDelDia = this.obtenerGrupoPorFecha(this.cita.data, grupos);
      if (!grupoDelDia) return;

      this.http.get<any[]>('http://localhost:8080/langileak').subscribe((alumnos) => {
        this.alumnos = alumnos.filter(
          (alumno) => alumno.taldeak?.kodea === grupoDelDia.kodea
        );
      });
    });
  }

  onAlumnoSeleccionado() {
    if (this.cita.alumno) {
      this.cita.estado = 'Pendiente';
      this.trabajadorSeleccionado = true;
    }
  }

  obtenerGrupoPorFecha(fecha: string, grupos: any[]): any {
    const fechaObj = new Date(fecha);
    const diaSemana = fechaObj.getDay();

    if (diaSemana === 0 || diaSemana === 6) {
      return null;
    }

    return grupos[diaSemana - 1];
  }
}
