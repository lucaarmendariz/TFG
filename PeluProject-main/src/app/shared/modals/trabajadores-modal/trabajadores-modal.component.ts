import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { GrupoModalComponent } from 'src/app/shared/modals/grupo-modal/grupo-modal.component';

@Component({
  selector: 'app-trabajador-modal',
  templateUrl: './trabajadores-modal.component.html',
  styleUrls: ['./trabajadores-modal.component.scss']
})
export class TrabajadorModalComponent implements OnInit {
  @Input() trabajador: any = {};
  @Input() isEditing: boolean = false;

  grupos: any[] = [];

  constructor(private modalCtrl: ModalController, private http: HttpClient) {}

  ngOnInit() {
    this.loadGrupos();
  }

  closeModal() {
    this.modalCtrl.dismiss();
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

  async openGrupoModal() {
    const modal = await this.modalCtrl.create({
      component: GrupoModalComponent
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.grupos.push(result.data);
        this.trabajador.taldeak = result.data;
      }
    });

    return modal.present();
  }

  saveTrabajador() {
    if (!this.trabajador.izena || !this.trabajador.abizenak || !this.trabajador.taldeak) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    const trabajadorData = {
      izena: this.trabajador.izena,
      abizenak: this.trabajador.abizenak,
      taldeak: { kodea: this.trabajador.taldeak.kodea }
    };

    if (this.isEditing) {
      this.http.put(`http://localhost:8080/langileak/${this.trabajador.id}`, trabajadorData).subscribe({
        next: (updatedTrabajador) => this.modalCtrl.dismiss(updatedTrabajador),
        error: (err) => console.error("❌ Error en la actualización:", err)
      });
    } else {
      this.http.post('http://localhost:8080/langileak', trabajadorData).subscribe({
        next: (newTrabajador) => this.modalCtrl.dismiss(newTrabajador),
        error: (err) => console.error("❌ Error en la creación:", err)
      });
    }
  }
}
