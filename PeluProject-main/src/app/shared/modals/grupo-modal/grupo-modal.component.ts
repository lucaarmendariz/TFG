import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-grupo-modal',
  templateUrl: './grupo-modal.component.html',
  styleUrls: ['./grupo-modal.component.scss']
})
export class GrupoModalComponent implements OnInit {
  grupo = { kodea: '', izena: '' };

  constructor(private modalCtrl: ModalController, private http: HttpClient) {}

  ngOnInit() {}

  closeModal() {
    this.modalCtrl.dismiss();
  }

  saveGrupo() {
    if (!this.grupo.kodea || !this.grupo.izena) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    this.http.post('http://localhost:8080/taldeak', this.grupo).subscribe({
      next: (newGrupo) => this.modalCtrl.dismiss(newGrupo),
      error: (err) => console.error("❌ Error al crear grupo:", err)
    });
  }
}
