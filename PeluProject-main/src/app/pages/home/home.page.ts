import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { InfoCitaComponent } from 'src/app/shared/Agenda/info-cita/info-cita.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  hours: string[] = [];
  citasPorHora: Map<string, any[]> = new Map();
  alturaPorMediaHora = 50;
  anchoColumna = 180;
  columnasMaximas = 7; // Ahora hay 7 filas para los 7 asientos
  citas: any[] = [];
  colores: string[] = ['#3c7fc7', '#ff9800', '#8bc34a', '#e91e63', '#795548', '#9c27b0', '#607d8b'];

  constructor(private modalController: ModalController) {
    this.generateHours();
  }

  ngOnInit() {}

  actualizarCitas(citasRecibidas: any[]) {
    this.citasPorHora.clear();
    this.citas = citasRecibidas;

    citasRecibidas.forEach((cita, index) => {
      if (!cita.hasieraOrdua || !cita.eserlekua) return;

      let horaInicio = this.formatHourFromBackend(cita.hasieraOrdua);
      let horaFin = this.formatHourFromBackend(cita.amaieraOrdua);

      let duracion = this.calcularDuracion(horaInicio, horaFin);
      cita.duracion = duracion;

      if (!this.citasPorHora.has(horaInicio)) {
        this.citasPorHora.set(horaInicio, []);
      }
      this.citasPorHora.get(horaInicio)?.push(cita);
      
      // Asignar color único por cita
      cita.color = this.colores[index % this.colores.length];
      
      // Asignar la fila en base al asiento (1-7)
      let asientoIndex = parseInt(cita.eserlekua) - 1;
      cita.fila = asientoIndex >= 0 && asientoIndex < this.columnasMaximas ? asientoIndex : 0;
    });
  }

  calcularAltura(duracion: number): string {
    return `${(duracion / 30) * this.alturaPorMediaHora}px`;
  }

  calcularPosicion(horaInicio: string): string {
    let minutosDesdeInicio = this.convertirHoraAMinutos(horaInicio) - this.convertirHoraAMinutos("10:00");
    return `${(minutosDesdeInicio / 30) * this.alturaPorMediaHora}px`;
  }

  calcularFila(cita: any): string {
    return `${cita.fila * this.anchoColumna}px`;
  }

  async abrirInfoCita(citaSeleccionada: any) {
    const modal = await this.modalController.create({
      component: InfoCitaComponent,
      cssClass: "custom-modal-class",
      componentProps: { cita: citaSeleccionada },
    });
    return await modal.present();
  }

  formatHourFromBackend(hour: string): string {
    if (!hour) return "";
    let parts = hour.split(":");
    return parts.length >= 2 ? `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}` : "";
  }

  calcularDuracion(horaInicio: string, horaFin: string): number {
    let minutosInicio = this.convertirHoraAMinutos(horaInicio);
    let minutosFin = this.convertirHoraAMinutos(horaFin);
    return Math.max(minutosFin - minutosInicio, 30);
  }

  convertirHoraAMinutos(hora: string): number {
    let [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
  }

  generateHours() {
    let startHour = 10;
    let startMinute = 0;
    while (startHour < 15) {
      this.hours.push(this.formatHour(startHour, startMinute));
      startMinute += 30;
      if (startMinute === 60) {
        startMinute = 0;
        startHour++;
      }
    }
  }

  formatHour(hour: number, minute: number): string {
    return `${hour < 10 ? '0' + hour : hour}:${minute === 0 ? '00' : minute}`;
  }
}
