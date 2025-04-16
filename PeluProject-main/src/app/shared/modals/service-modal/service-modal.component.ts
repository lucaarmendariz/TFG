import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { KategoriaModalComponent } from '../kategoria-modal/kategoria-modal.component';

@Component({
  selector: 'app-service-modal',
  templateUrl: './service-modal.component.html',
  styleUrls: ['./service-modal.component.scss']
})
export class ServiceModalComponent implements OnInit {
  @Input() item: any = {};
  @Input() isEditing: boolean = false;

  categorias: any[] = [];
  private API_URL = 'http://localhost:8080/zerbitzuak';

  constructor(private modalCtrl: ModalController, private http: HttpClient) {}

  ngOnInit() {
    console.log("🛠️ Modal abierto, editando:", this.isEditing, "Datos iniciales:", this.item);
    this.loadCategorias();
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  loadCategorias() {
    this.http.get<any[]>('http://localhost:8080/kategoriak').subscribe({
      next: (data) => {
        console.log("✅ Categorías cargadas:", data);
        this.categorias = data;
      },
      error: (err) => console.error("❌ Error al cargar categorías:", err)
    });
  }

  
  async openKategoriaModal() {
    const modal = await this.modalCtrl.create({
      component: KategoriaModalComponent // Cambié el componente a KategoriaModalComponent
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.categorias.push(result.data); // Cambié "grupos" a "kategorias"
      }
    });
  
    return modal.present();
  }
 
  saveItem() {
    console.log("🚀 Intentando guardar servicio...", this.item);
  
    if (!this.item.nombre || !this.item.categoria || !this.item.etxekoPrezioa || !this.item.kanpokoPrezioa) {
      console.error("⚠️ Faltan datos en el formulario");
      return;
    }
  
    const servicio = {
      izena: this.item.nombre,
      kategoriak: { id: this.item.categoria },
      etxekoPrezioa: this.item.etxekoPrezioa,
      kanpokoPrezioa: this.item.kanpokoPrezioa
    };
  
    if (this.isEditing && this.item.id) {
      this.http.patch(`http://localhost:8080/zerbitzuak/${this.item.id}`, servicio).subscribe({
        next: (updatedService) => {
          console.log("✅ Servicio actualizado con éxito:", updatedService);
          this.modalCtrl.dismiss(updatedService);
        },
        error: (err) => {
          alert("Error al actualizar el servicio. Revisa la consola.");
        }
      });
    } else {
      this.http.post(`http://localhost:8080/zerbitzuak`, servicio).subscribe({
        next: (newService) => {
          console.log("✅ Servicio añadido con éxito:", newService);
          this.modalCtrl.dismiss(newService);
        },
        error: (err) => {
          console.error("❌ Error en POST:", err);
          alert("Error al crear el servicio. Revisa la consola.");
        }
      });
    }
  }
}  