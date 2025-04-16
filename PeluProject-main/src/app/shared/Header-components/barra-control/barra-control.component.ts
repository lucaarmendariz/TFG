import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { PopcitaComponent } from '../../modals/popcita/popcita.component';
import { InfoCitaComponent } from '../../Agenda/info-cita/info-cita.component';

@Component({
  selector: 'app-barra-control',
  templateUrl: './barra-control.component.html',
  styleUrls: ['./barra-control.component.scss'],
})
export class BarraControlComponent implements OnInit {
  @Output() citasActualizadas = new EventEmitter<any[]>(); 

  grupos: any[] = [];
  trabajadores: any[] = [];
  trabajadoresFiltrados: any[] = [];
  hitzorduak: any[] = []; // Citas del día

  grupoSeleccionado: any = null;
  trabajadorSeleccionado: string = '';
  fechaActual: string = new Date().toISOString().split('T')[0]; 

  constructor(private modalCtrl: ModalController, private http: HttpClient) {}

  ngOnInit() {
    this.cargarGrupos();
    this.cargarCitas();
  }

  cargarGrupos() {
    this.http.get<any[]>('http://localhost:8080/taldeak').subscribe({
      next: (data) => {
        this.grupos = data;
        this.asignarGrupoPorDia(); // 🔥 Asignar grupo según el día de la semana
      },
      error: (err) => console.error("❌ Error al cargar los grupos:", err)
    });
  }

  asignarGrupoPorDia() {
    const fecha = new Date(this.fechaActual);
    const diaSemana = fecha.getDay(); // Domingo=0, Lunes=1, ..., Sábado=6

    if (diaSemana === 0 || diaSemana === 6) {
      this.grupoSeleccionado = null; // No hay grupo el fin de semana
    } else {
      const indiceGrupo = diaSemana - 1; // Lunes es el primer grupo
      if (this.grupos.length > indiceGrupo) {
        this.grupoSeleccionado = this.grupos[indiceGrupo];
        this.cargarTrabajadores(); // 🔥 Cargar trabajadores del grupo asignado
      }
    }
  }

  cargarTrabajadores() {
    this.http.get<any[]>('http://localhost:8080/langileak').subscribe({
      next: (data) => {
        this.trabajadores = data;
        this.filtrarTrabajadores();
      },
      error: (err) => console.error("❌ Error al cargar los trabajadores:", err)
    });
  }

  filtrarTrabajadores() {
    if (this.grupoSeleccionado) {
      this.trabajadoresFiltrados = this.trabajadores.filter(trabajador => 
        trabajador.taldeak?.kodea === this.grupoSeleccionado.kodea
      );
    } else {
      this.trabajadoresFiltrados = [];
    }
  }

  cargarCitas() {
    this.http.get<any[]>(`http://localhost:8080/api/hitzorduak/fecha/${this.fechaActual}`).subscribe({
      next: (data) => {
        this.hitzorduak = data;
        this.citasActualizadas.emit(this.hitzorduak); // 🔥 Enviar citas a `HomePage`
      },
      error: (err) => console.error("❌ Error al cargar las citas:", err)
    });
  }

  actualizarFecha(event: any) {
    this.fechaActual = event.detail.value; // Cambiar fecha seleccionada
    this.cargarGrupos();
    this.cargarCitas(); // Recargar citas para la nueva fecha
  }

  retrocederFecha() {
    const fecha = new Date(this.fechaActual);
    fecha.setDate(fecha.getDate() - 1);
    this.fechaActual = fecha.toISOString().split('T')[0];
    this.cargarGrupos();
    this.cargarCitas();
  }

  avanzarFecha() {
    const fecha = new Date(this.fechaActual);
    fecha.setDate(fecha.getDate() + 1);
    this.fechaActual = fecha.toISOString().split('T')[0];
    this.cargarGrupos();
    this.cargarCitas();
  }

  async abrirPopup() {
    const modal = await this.modalCtrl.create({
      component: PopcitaComponent,
      cssClass: 'custom-modal',
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.hitzorduak.push(result.data);
        this.citasActualizadas.emit(this.hitzorduak); // 🔥 Emitir citas actualizadas
        this.cargarCitas(); // Refrescar citas después de añadir
      }
    });

    await modal.present();
  }
}
