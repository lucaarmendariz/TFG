import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { KategoriaModalComponent } from '../kategoria-modal/kategoria-modal.component';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  @Input() item: any = {}; 
  @Input() isEditing: boolean = false;
  @Input() tipo: string = 'producto';  

  categorias: any[] = [];  

  constructor(private modalCtrl: ModalController, private http: HttpClient) {}

  ngOnInit() {
    this.loadCategorias();
    console.log(`📌 Tipo recibido en modal: ${this.tipo}`); // Para depuración
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  loadCategorias() {
    this.http.get<any[]>('http://localhost:8080/kategoriak').subscribe({
      next: (data) => {
        this.categorias = data;
        console.log("✅ Categorías cargadas:", this.categorias);
      },
      error: (err) => {
        console.error("❌ Error al cargar categorías:", err);
      }
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
    let data: any = {};

    if (this.tipo === 'producto') {
      data = {
        izena: this.item.nombre,
        deskribapena: this.item.descripcion || '',
        kategoriak: this.item.kategoria ? { id: this.item.kategoria } : null,
        marka: this.item.marka,
        stock: this.item.stock ?? 0,
        stockAlerta: this.item.stockAlerta ?? 0
      };
    } else if (this.tipo === 'material') {
      data = {
        etiketa: this.item.etiketa,
        izena: this.item.izena,
        kategoriak: this.item.kategoria ? { id: this.item.kategoria } : null
      };
    }

    const url = this.tipo === 'producto' ? 'http://localhost:8080/produktuak' : 'http://localhost:8080/materialak';

    if (this.isEditing) {
      this.http.patch(`${url}/${this.item.id}`, data).subscribe({
        next: (updatedItem) => {
          console.log(`✅ ${this.tipo} actualizado correctamente.`, updatedItem);
          this.modalCtrl.dismiss(updatedItem);
        },
        error: (err) => {
          console.error(`❌ Error al actualizar ${this.tipo}:`, err);
        }
      });
    } else {
      this.http.post(url, data).subscribe({
        next: (newItem) => {
          console.log(`✅ ${this.tipo} añadido correctamente.`, newItem);
          this.modalCtrl.dismiss(newItem);
        },
        error: (err) => {
          console.error(`❌ Error al añadir ${this.tipo}:`, err);
        }
      });
    }
  }
}
