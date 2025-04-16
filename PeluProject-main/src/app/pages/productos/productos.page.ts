import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ProductComponent } from 'src/app/shared/modals/product/product.component';
import { ProductGraphComponent } from 'src/app/product-graph/product-graph.component';
import { HttpClient } from '@angular/common/http';
import { AutentificadorService } from 'src/app/service/autentificador.service';
import { Chart, registerables } from 'chart.js'; 

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage implements OnInit {
  selectedTab: string = 'productos';
  productos: any[] = [];
  materiales: any[] = [];
  categorias: any[] = [];
  searchTerm: string = ''; 
  filteredProductos: any[] = [];
  filteredMateriales: any[] = [];
  public admin: boolean = false;

  constructor(private modalCtrl: ModalController, private http: HttpClient, private autSer: AutentificadorService) {}

  ngOnInit() {
    this.loadProductos();
    this.loadMateriales();
    this.loadCategorias();
    this.autSer.admin$.subscribe(isAdmin => {
      console.log('Valor de admin cambiado:', isAdmin);
      this.admin = isAdmin;
    });
  }

  loadProductos() {
    this.http.get<any[]>('http://localhost:8080/produktuak').subscribe({
      next: (data) => {
        console.log("✅ Datos recibidos del backend:", data);
        this.productos = data.map(p => ({
          id: p.id,
          nombre: p.izena,
          descripcion: p.deskribapena,
          categoria: p.kategoriak?.izena ?? "Sin categoría",
          marca: p.marka,
          stock: p.stock,
          stockAlerta: p.stockAlerta
        }));
        this.filteredProductos = [...this.productos]; // Inicializar filtrado
        console.log("✅ Productos asignados:", this.productos);
      },
      error: (err) => {
        console.error("❌ Error en la petición:", err);
      }
    });
  }

  loadMateriales() {
    this.http.get<any[]>('http://localhost:8080/materialak').subscribe({
      next: (data) => {
        console.log("✅ Datos de materiales recibidos:", data);
        this.materiales = data.map(m => ({
          id: m.id,
          etiketa: m.etiketa,
          nombre: m.izena,  
          categoria: m.kategoriak?.izena ?? "Sin categoría",
          sortzeData: m.sortzeData,
          eguneratzeData: m.eguneratzeData,
          ezabatzeData: m.ezabatzeData
        }));
        this.filteredMateriales = [...this.materiales]; // Aplicar filtro inicial
      },
      error: (err) => {
        console.error("❌ Error al cargar materiales:", err);
      }
    });
  }

  loadCategorias() {
    this.http.get<any[]>('http://localhost:8080/kategoriak').subscribe(data => {
      this.categorias = data;
    });
  }

  async openGraphModal() {
    console.log('Productos en el modal:', this.filteredProductos);  // Verifica que los datos sean correctos
    const modal = await this.modalCtrl.create({
      component: ProductGraphComponent,
      componentProps: { productos: this.filteredProductos }
    });
    return modal.present();
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

  deleteItem(tipo: string, id: number) {
    const url = tipo === 'producto' ? 'http://localhost:8080/produktuak' : 'http://localhost:8080/materialak';
    this.http.delete(`${url}/${id}`).subscribe(() => {
      if (tipo === 'producto') {
        this.productos = this.productos.filter(p => p.id !== id);
        this.filterItems();
      } else {
        this.materiales = this.materiales.filter(m => m.id !== id);
        this.filterItems();
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
