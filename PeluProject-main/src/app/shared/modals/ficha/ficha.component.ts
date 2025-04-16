import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-ficha',
  templateUrl: './ficha.component.html',
  styleUrls: ['./ficha.component.scss']
})
export class FichaComponent implements OnInit {
  @Input() ficha: any = {};  // Esta será la ficha del cliente
  @Input() isEditing: boolean = false;
  categorias: any[] = []; // Array para almacenar las categorías

  constructor(private modalCtrl: ModalController, private http: HttpClient) {}

  ngOnInit() {
    console.log("📌 Modo de edición:", this.isEditing);
    this.cargarCategorias();
    
    // Si la ficha ya tiene valor para 'azalSentikorra', lo convertimos a booleano
    if (this.ficha.azalSentikorra === 'S') {
      this.ficha.azalSentikorra = true;
    } else if (this.ficha.azalSentikorra === 'N') {
      this.ficha.azalSentikorra = false;
    }
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  cargarCategorias() {
    this.http.get<any[]>('http://localhost:8080/categorias').subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (err) => {
        console.error("❌ Error al cargar categorías:", err);
      }
    });
  }

  saveFicha() {
    let data = {
      izena: this.ficha.izena,               // Nombre del cliente
      abizena: this.ficha.abizena,           // Apellido
      telefonoa: this.ficha.telefonoa,       // Teléfono
      azalSentikorra: this.ficha.azalSentikorra ? 'S' : 'N', // Convertir booleano a 'S' o 'N'
      sortzeData: this.ficha.sortzeData || new Date().toISOString(),
      eguneratzeData: new Date().toISOString()
    };

    const url = 'http://localhost:8080/bezeroak';

    if (this.isEditing && this.ficha.id) {
      this.http.put(`${url}/${this.ficha.id}`, data).subscribe({
        next: (updatedFicha) => {
          console.log("✅ Ficha cliente actualizada correctamente.", updatedFicha);
          this.modalCtrl.dismiss(updatedFicha);
        },
        error: (err) => {
          console.error("❌ Error al actualizar ficha cliente:", err);
        }
      });
    } else {
      this.http.post(url, data).subscribe({
        next: (newFicha) => {
          console.log("✅ Ficha cliente añadida correctamente.", newFicha);
          this.modalCtrl.dismiss(newFicha);
        },
        error: (err) => {
          console.error("❌ Error al añadir ficha cliente:", err);
        }
      });
    }
  }
}
