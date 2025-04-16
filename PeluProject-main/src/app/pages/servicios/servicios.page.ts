import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ServiceModalComponent } from 'src/app/shared/modals/service-modal/service-modal.component';
import { AutentificadorService } from 'src/app/service/autentificador.service';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.page.html',
  styleUrls: ['./servicios.page.scss'],
})
export class ServiciosPage implements OnInit {
  servicios: any[] = [];
  public admin: boolean = false;
  private API_URL = 'http://localhost:8080/zerbitzuak';

  constructor(private modalCtrl: ModalController, private http: HttpClient, private autSer: AutentificadorService) {}

  ngOnInit() {
    this.loadServicios();
    this.autSer.admin$.subscribe(isAdmin => {
      console.log('Valor de admin cambiado:', isAdmin);
      this.admin = isAdmin;
    });
  }

  loadServicios() {
    this.http.get<any[]>(this.API_URL).subscribe({
      next: (data) => {
        console.log("✅ Servicios recibidos:", data);
        this.servicios = data.map(s => ({
          id: s.id,
          nombre: s.izena,
          categoria: s.kategoriak?.izena ?? "Sin categoría",
          etxekoPrezioa: s.etxekoPrezioa,
          kanpokoPrezioa: s.kanpokoPrezioa
        }));
      },
      error: (err) => {
        console.error("❌ Error al cargar servicios:", err);
      }
    });
  }

  // Abrir modal para Crear / Editar servicio
  async openModal(servicio?: any) {
    const modal = await this.modalCtrl.create({
      component: ServiceModalComponent,
      componentProps: { item: servicio ? { ...servicio } : {}, isEditing: !!servicio }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        if (servicio) {
          this.updateServicio(result.data, servicio.id, true); 
        } else {
          this.createServicio(result.data);
        }
      }
    });

    return modal.present();
  }

  // Crear un nuevo servicio (POST)
  createServicio(servicio: any) {
    this.http.post(this.API_URL, servicio).subscribe({
      next: (response: any) => {
        console.log("✅ Servicio creado:", response);
        this.servicios.push(response); 
      },
      error: (err) => {
        console.error("❌ Error al crear servicio:", err);
      }
    });
  }

  // Actualizar un servicio completo (PUT) o parcialmente (PATCH)
  updateServicio(servicio: any, id: number, isPartialUpdate: boolean = false) {
    const url = `${this.API_URL}/${id}`;
    const method = isPartialUpdate ? 'patch' : 'put'; 

    this.http.request(method, url, { body: servicio }).subscribe({
      next: (updatedService: any) => {
        const index = this.servicios.findIndex(s => s.id === id);
        if (index !== -1) {
          this.servicios[index] = updatedService; // Actualiza en la lista local
        }
      },
      error: (err) => {
        console.error(`❌ Error al ${isPartialUpdate ? 'parcialmente' : 'completamente'} actualizar servicio:`, err);
      }
    });
  }

  // Eliminar un servicio (DELETE)
  deleteServicio(id: number) {
    this.http.delete(`${this.API_URL}/${id}`).subscribe(() => {
      this.servicios = this.servicios.filter(s => s.id !== id);
    });
  }
}
