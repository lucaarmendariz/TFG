import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-kategoria-modal',
  templateUrl: './kategoria-modal.component.html',
  styleUrls: ['./kategoria-modal.component.scss']
})
export class KategoriaModalComponent implements OnInit {
  kategoria = { izena: '' }; // Solo necesitamos "izena"

  constructor(private modalCtrl: ModalController, private http: HttpClient) {}

  ngOnInit() {}

  closeModal() {
    this.modalCtrl.dismiss();
  }

  saveKategoria() {
    console.log("Botón Guardar clickeado");  // Asegúrate de que este log aparezca
    if (!this.kategoria.izena) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }
  
    console.log("Enviando categoría:", this.kategoria);
    this.http.post('http://localhost:8080/kategoriak', this.kategoria).subscribe({
      next: (newKategoria) => {
        console.log("Categoría guardada correctamente:", newKategoria);
        this.modalCtrl.dismiss(newKategoria);
      },
      error: (err) => {
        console.error("❌ Error al crear kategoria:", err);
        alert("Error al guardar la categoría.");
      }
    });
  }
  
}
