import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { GrupoModalComponent } from 'src/app/shared/modals/grupo-modal/grupo-modal.component';
import { TrabajadorModalComponent } from 'src/app/shared/modals/trabajadores-modal/trabajadores-modal.component';

@Component({
  selector: 'app-trabajadores',
  templateUrl: './trabajadores.page.html',
  styleUrls: ['./trabajadores.page.scss'],
})
export class TrabajadoresPage implements OnInit {
  trabajadores: any[] = [];
  trabajadoresFiltrados: any[] = [];
  grupos: any[] = [];
  grupoSeleccionado: string = 'todos'; // Código del grupo seleccionado para filtrar

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadTrabajadores();
    this.loadGrupos();
  }

  loadTrabajadores() {
    this.http.get<any[]>('http://localhost:8080/langileak').subscribe({
      next: (data) => {
        console.log("✅ Trabajadores recibidos:", data);
        this.trabajadores = data;
        this.filtrarTrabajadores();
      },
      error: (err) => {
        console.error("❌ Error al cargar los trabajadores:", err);
      }
    });
  }

  loadGrupos() {
    this.http.get<any[]>('http://localhost:8080/taldeak').subscribe({
      next: (data) => {
        this.grupos = data;
      },
      error: (err) => {
        console.error("❌ Error al cargar los grupos:", err);
      }
    });
  }

  filtrarTrabajadores() {
    this.trabajadoresFiltrados = this.grupoSeleccionado === 'todos'
      ? this.trabajadores
      : this.trabajadores.filter(trabajador => trabajador.taldeak?.kodea === this.grupoSeleccionado);
  }

  async openGrupoModal() {
    const modal = await this.modalController.create({
      component: GrupoModalComponent
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.grupos.push(result.data);
      }
    });

    return modal.present();
  }

  async openTrabajadorModal(trabajador?: any) {
    const modal = await this.modalController.create({
      component: TrabajadorModalComponent,
      componentProps: { trabajador: trabajador ? { ...trabajador } : {}, isEditing: !!trabajador }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.loadTrabajadores();
      }
    });

    return modal.present();
  }

  async deleteTrabajador(id: number) {
    const alert = await this.alertController.create({
      header: '¿Eliminar trabajador?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.http.delete(`http://localhost:8080/langileak/${id}`).subscribe({
              next: () => {
                console.log(`✅ Trabajador con ID ${id} eliminado.`);
                this.trabajadores = this.trabajadores.filter(t => t.id !== id);
                this.filtrarTrabajadores();
              },
              error: (err) => {
                console.error("❌ Error al eliminar trabajador:", err);
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }
}
