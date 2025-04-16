import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { FichaComponent } from 'src/app/shared/modals/ficha/ficha.component';

interface Bezeroa {
  id: number;
  izena: string;
  abizena: string;
  telefonoa: string;
  azalSentikorra: boolean;
  sortzeData: string;
  eguneratzeData: string;
  ezabatzeData: string | null;
}

@Component({
  selector: 'app-cliente-ficha',
  templateUrl: './ficha.page.html',
  styleUrls: ['./ficha.page.scss']
})
export class FichaPage implements OnInit {
  bezeroak: Bezeroa[] = [];  // ✅ Lista de clientes (antes faltaba)
  searchTerm: string = '';
  private apiUrl = 'http://localhost:8080/bezeroak';

  constructor(
    private http: HttpClient,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarClientes();
  }

  async cargarClientes() {
    const loading = await this.loadingCtrl.create({ message: 'Cargando clientes...' });
    await loading.present();
  
    this.http.get<Bezeroa[]>(this.apiUrl).subscribe(
      async (data) => {
        console.log("✅ Clientes recibidos:", data);
        this.bezeroak = data || [];  // ✅ Asigna correctamente la lista
        this.cd.detectChanges();
        await loading.dismiss();
      },
      async (error) => {
        console.error("❌ Error al obtener clientes:", error);
        await loading.dismiss();
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudieron cargar los clientes.',
          buttons: ['OK']
        });
        await alert.present();
      }
    );
  }

  async openModal(cliente?: Bezeroa) {  // ✅ Ahora acepta un cliente opcional
    console.log(`🔄 Abriendo modal para: ${cliente ? 'Editar' : 'Añadir'} Ficha`);

    const modal = await this.modalCtrl.create({
      component: FichaComponent,
      componentProps: { 
        ficha: cliente ? { ...cliente } : {}, 
        isEditing: !!cliente
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.cargarClientes(); // ✅ Recargar lista tras cerrar modal
      }
    });

    return modal.present();
  }

  filterItems() {
    const searchTermLower = this.searchTerm.toLowerCase();
    
    if (!searchTermLower) {
      this.cargarClientes(); // Si el input está vacío, recarga la lista original
      return;
    }
  
    this.bezeroak = this.bezeroak.filter(cliente =>
      cliente.abizena.toLowerCase().includes(searchTermLower)
    );
  }
}
