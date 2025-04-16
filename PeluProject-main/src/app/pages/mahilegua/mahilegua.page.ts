import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ProductComponent } from 'src/app/shared/modals/product/product.component';
import { BorrowModalComponent } from 'src/app/shared/modals/borrow-modal/borrow-modal.component';
import { HttpClient } from '@angular/common/http';
import { AutentificadorService } from 'src/app/service/autentificador.service';

@Component({
  selector: 'app-productos',
  templateUrl: './mahilegua.page.html',
  styleUrls: ['./mahilegua.page.scss'],
})
export class MahileguaPage implements OnInit {
  selectedTab: string = 'productos';
  productos: any[] = [];
  materiales: any[] = [];
  filteredProductos: any[] = [];
  filteredMateriales: any[] = [];
  searchTerm: string = ''; 
  public admin: boolean = false;

  constructor(private modalCtrl: ModalController, private http: HttpClient, private autSer: AutentificadorService) {}

  ngOnInit() {
    this.loadProductos();
    this.loadMateriales();
    this.autSer.admin$.subscribe(isAdmin => this.admin = isAdmin);
  }

  loadProductos() {
    this.http.get<any[]>('http://localhost:8080/produktuak').subscribe(data => {
      this.productos = data.map(p => ({
        ...p,
        prestadoA: p.prestadoA || null 
      }));
      this.filteredProductos = [...this.productos];
    });
  }

  loadMateriales() {
    this.http.get<any[]>('http://localhost:8080/materialak').subscribe(data => {
      this.materiales = data.map(m => ({
        ...m,
        prestadoA: m.prestadoA || null
      }));
      this.filteredMateriales = [...this.materiales];
    });
  }

  async openModal(tipo: string, item?: any) {
    console.log(`🔄 Abriendo modal para: ${tipo}`);
    const modal = await this.modalCtrl.create({
      component: ProductComponent,
      componentProps: { 
        item: item ? { ...item } : {}, 
        isEditing: !!item,
        tipo: tipo
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        if (tipo === 'producto') {
          if (item) {
            const index = this.productos.findIndex(p => p.id === item.id);
            if (index !== -1) {
              this.productos[index] = { ...this.productos[index], ...result.data };
            }
          } else {
            this.productos.push(result.data);
          }
        } else {
          if (item) {
            const index = this.materiales.findIndex(m => m.id === item.id);
            if (index !== -1) {
              this.materiales[index] = { ...this.materiales[index], ...result.data };
            }
          } else {
            this.materiales.push(result.data);
          }
        }
      }
    });

    return modal.present();
  }

  async cogerPrestado(tipo: string, item: any) {
    const modal = await this.modalCtrl.create({
      component: BorrowModalComponent,
      componentProps: { item }
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data) {
        item.prestadoA = result.data.studentName;  // ✅ Usa studentName en vez de alumno
        this.http.put(`http://localhost:8080/${tipo}/${item.id}/prestar`, { alumno: result.data.studentName }).subscribe();
      }
    });
  
    return modal.present();
  }
  
  devolverItem(tipo: string, item: any) {
    item.prestadoA = null;
    this.http.put(`http://localhost:8080/${tipo}/${item.id}/devolver`, {}).subscribe();
  }

  deleteItem(tipo: string, id: number) {
    const url = tipo === 'producto' ? 'http://localhost:8080/produktuak' : 'http://localhost:8080/materialak';
  
    this.http.delete(`${url}/${id}`).subscribe(() => {
      if (tipo === 'producto') {
        this.productos = this.productos.filter(p => p.id !== id);
        this.filteredProductos = [...this.productos]; // Asegurar que se actualiza la lista filtrada
      } else {
        this.materiales = this.materiales.filter(m => m.id !== id);
        this.filteredMateriales = [...this.materiales];
      }
    });
  }
  

  filterItems() {
    const searchTermLower = this.searchTerm.toLowerCase();
    if (this.selectedTab === 'productos') {
      this.filteredProductos = this.productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTermLower)
      );
    } else {
      this.filteredMateriales = this.materiales.filter(material =>
        material.nombre.toLowerCase().includes(searchTermLower)
      );
    }
  }
}