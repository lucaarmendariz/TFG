import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { HeaderComponent } from '../components/header/header.component';
import { HttpClient } from '@angular/common/http';
import { LoginServiceService } from '../zerbitzuak/login-service.service';
import { ActivatedRoute } from '@angular/router';
import { AlertController, IonModal } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { LanguageService } from '../zerbitzuak/language.service';

// import { IonButton, IonContent, IonHeader, IonLabel, IonModal, IonTitle, IonToolbar } from '@ionic/angular/standalone';


export interface Alumno {
  nombre: string;
  grupo: string;
}

@Component({
    selector: 'app-produktuak',
    templateUrl: './produktuak.page.html',
    styleUrls: ['./produktuak.page.scss'],
    standalone: false
})
export class ProduktuakPage implements OnInit {

  @ViewChild(HeaderComponent) headerComponent!: HeaderComponent;
  selectedLanguage: string = 'es';
  modal!:string;
  produktuak!:any[];

  productosSeleccionados:any[] = [];
  isEditingProduct: boolean = false;
  editingProduct:any = null;
  isEditingKategoria: boolean = false;
  editingKategoria:any = null;

  crearKatNombre!:String;
  crearNombre!:String;
  crearDescripcion!:String;
  crearCategoria!:Number;
  crearMarca!:String;
  crearStock!:Number;
  crearStockAlerta!:Number;

  alumnos!: any[];
  selecTaldea!:number;
  selecAlumno!:number;

  modalAtera = false;
  alumne = '';
  categoriasAbiertas: { [key: string]: boolean } = {};
  filteredAlumnos!: any[];
  selectedCategoryId!: number;
  isIkasle!:boolean;
  private routeSubscription: any;

  
  filtroBusqueda: string = '';
filtroStockBajo: boolean = false;
filteredProduktuak: any[] = [];

filtrarProductos() {
  const busqueda = this.filtroBusqueda.toLowerCase();

  // Copiar datos originales
  this.filteredProduktuak = this.produktuak.map(categoria => ({
    ...categoria,
    produktuak: categoria.produktuak.map((producto: any) => ({ ...producto }))
  }));

  // Filtrar por texto (categoría o producto)
  if (busqueda !== '') {
    this.filteredProduktuak = this.filteredProduktuak
      .map(categoria => ({
        ...categoria,
        produktuak: categoria.produktuak.filter((producto: any) =>
          producto.izena.toLowerCase().includes(busqueda)
        )
      }))
      .filter(categoria =>
        categoria.izena.toLowerCase().includes(busqueda) || categoria.produktuak.length > 0
      );
  }

  // Filtrar por stock bajo
  if (this.filtroStockBajo) {
    this.filteredProduktuak = this.filteredProduktuak
      .map(categoria => ({
        ...categoria,
        produktuak: categoria.produktuak.filter((producto: any) =>
          producto.stock <= producto.stockAlerta
        )
      }))
      .filter(categoria => categoria.produktuak.length > 0);
  }
}



  ngOnDestroy() {
    // Limpiar la suscripción cuando el componente se destruya
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }


  changeLanguage() {
  this.languageService.setLanguage(this.selectedLanguage);
}

  actualizarProductosSeleccionados(producto:any, kategoria_id: number) {
    producto.kategoria_id = kategoria_id;
    producto.kantitatea = 1;
    const index = this.productosSeleccionados.findIndex(p => p.id === producto.id);
    if (producto.selected && index === -1) {
      this.productosSeleccionados.push(producto);
    } else if (!producto.selected && index !== -1) {
      this.productosSeleccionados.splice(index, 1);
    }
    console.log('Productos seleccionados:', this.productosSeleccionados);
  }

  toggleCategoria(categoria: string) {
    this.categoriasAbiertas[categoria] = !this.categoriasAbiertas[categoria];
  }

  isCategoriaAbierta(categoria: string): boolean {
    return this.categoriasAbiertas[categoria] || false;
  }

  @ViewChild('modalSortu') modalSortu: IonModal | undefined;  // Referencia a la modal de creación

crearProducto() {
  const json_data = {
    "izena": this.crearNombre,
    "produktuKategoria": {
      "id": this.crearCategoria
    },
    "deskribapena": this.crearDescripcion,
    "marka": this.crearMarca,
    "stock": this.crearStock,
    "stockAlerta": this.crearStockAlerta
  };

  console.log(json_data);

  this.http.post(`${environment.url}produktuak`, json_data, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  }).subscribe(
    async (response) => {
      // Vaciar los campos del formulario después de crear el producto
      this.crearNombre = '';
      this.crearDescripcion = '';
      this.crearCategoria = 0;  // Cambiado a null ya que espera un número
      this.crearMarca = '';
      this.crearStock = 0;  // Cambiado a 0 ya que espera un número
      this.crearStockAlerta = 0;  // Cambiado a 0 ya que espera un número

      // Resetear el formulario para limpiar cualquier validación o estado
      if (this.modalSortu) {
        this.modalSortu.dismiss(); // Cerrar la modal
      }

      // Actualizar la lista de productos si es necesario
      await this.produktuakLortu();
    },
    (error) => {
      console.error("Error al crear el producto:", error);
    }
  );
}



  @ViewChild('catprodsormodal') catprodsormodal: IonModal | undefined;  // Referencia a la modal

kategoriaSortu(categoriaForm: NgForm) {
  const json_data = {
    "izena": this.crearKatNombre
  };

  console.log(json_data);

  this.http.post(`${environment.url}produktu_kategoria`, json_data, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  }).subscribe(
    async (response) => {
      // Vaciar el campo del nombre de la categoría
      this.crearKatNombre = '';  // Limpiar el campo
      categoriaForm.resetForm();  // Resetear el formulario para limpiar cualquier validación o estado

      // Comprobar que la referencia a la modal no es undefined
      if (this.catprodsormodal) {
        this.catprodsormodal.dismiss(); // Cerrar la modal
      }

      // Actualizar la lista de categorías si es necesario
      await this.produktuakLortu();
    },
    (error) => {
      console.error("Error al crear la categoría:", error);
    }
  );
}




  openProdModal(product:any, idKat:number){
    this.isEditingProduct = true;
    this.editingProduct = product;
    this.editingProduct.idKategoria = idKat;
    console.log(this.editingProduct);
  }
  
  closeProdModal(){
    this.isEditingProduct = false;
  }

  openKatModal(kategoria:any){
    this.isEditingKategoria = true;
    this.editingKategoria = kategoria;
    console.log(this.editingKategoria);
  }
  
  closeKatModal(){
    this.isEditingKategoria = false;
  }

  editarProducto() {
    const json_data = {
      "id": this.editingProduct.id,
      "izena": this.editingProduct.izena,
      "produktuKategoria": {
        "id": this.editingProduct.idKategoria
      },
      "deskribapena": this.editingProduct.deskribapena,
      "marka": this.editingProduct.marka,
      "stock": this.editingProduct.stock,
      "stockAlerta": this.editingProduct.stockAlerta
    };

    console.log(json_data);

    this.http.put(`${environment.url}produktuak`, json_data, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      async (response) => {
        await this.produktuakLortu();
        this.closeProdModal();
      },
      (error) => {
        console.error("Error al editar el producto:", error);
      }
    );
  }

  

  async eliminarProducto(id: number) {
  const alert = await this.alertController.create({
    header: 'Confirmación',
    message: '¿Estás seguro de que quieres eliminar este producto?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
        handler: () => {
          console.log('Operación cancelada por el usuario.');
        }
      },
      {
        text: 'Eliminar',
        handler: () => {
          const json_data = { "id": id };
          console.log(json_data);

          this.http.delete(`${environment.url}produktuak`, {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(json_data)
          }).subscribe(
            async (response) => {
              await this.produktuakLortu();
            },
            (error) => {
              console.error("Error al eliminar el producto:", error);
            }
          );
        }
      }
    ]
  });

  await alert.present();
}


  async eliminarKategoriaProducto(id: number) {
  const alert = await this.alertController.create({
    header: 'Confirmación',
    message: '¿Estás seguro de que quieres eliminar esta categoría?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
        handler: () => {
          console.log('Operación cancelada por el usuario.');
        }
      },
      {
        text: 'Eliminar',
        handler: () => {
          const json_data = { "id": id };
          console.log(json_data);

          this.http.delete(`${environment.url}produktu_kategoria`, {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(json_data)
          }).subscribe(
            async (response) => {
              await this.produktuakLortu();
            },
            (error) => {
              console.error("Error al eliminar la categoría del producto:", error);
            }
          );
        }
      }
    ]
  });

  await alert.present();
}


  editarKategoriaProducto() {
    const json_data = { izena: this.editingKategoria.izena };

    console.log(json_data);

    this.http.put(`${environment.url}produktu_kategoria/id/${this.editingKategoria.id}`, json_data, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      async (response) => {
        console.log('Categoría actualizada correctamente');
        await this.produktuakLortu();
        this.closeKatModal();
      },
      (error) => {
        console.error('Error al editar la categoría del producto:', error);
      }
    );
  }

  sacarProductos() {
    const movimientos = this.productosSeleccionados.map(producto => ({
      "produktu": {
        "id": producto.id // El ID del producto dentro de un objeto
      },
      "langile": {
        "id": this.selecAlumno // El ID del alumno dentro de un objeto
      },
      "data": new Date().toISOString(), // Fecha en formato ISO
      "kopurua": producto.kantitatea // La cantidad del producto
    }));

    // Asegúrate de que el JSON sea un array válido antes de enviarlo.
    console.log(JSON.stringify(movimientos));

    this.http.post(`${environment.url}produktu_mugimenduak`, movimientos, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    }).subscribe(
      async () => {
        await this.produktuakLortu();
      },
      (error) => {
        console.error('Error al registrar los movimientos', error);
      }
    );
  }
  

  produktuakLortu() {
    this.http.get(`${environment.url}produktu_kategoria`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    }).subscribe(
      (datuak: any) => {
        // Filtramos las categorías y productos activos (sin `ezabatzeData`)
        this.produktuak = datuak
          .filter((categoria: any) => categoria.ezabatzeData === null)
          .map((categoria: any) => ({
            ...categoria,
            produktuak: categoria.produktuak
              .filter((producto: any) => producto.ezabatzeData === null)
          }));
          this.filteredProduktuak = this.produktuak;
        console.log('Produktuak kargatu:', this.produktuak);
      },
      (error) => {
        console.error("Errorea produktuak kargatzerakoan:", error);
      }
    );
  }

  langileakLortu() {
    this.http.get(`${environment.url}taldeak`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    }).subscribe(
      (datuak: any) => {
        this.alumnos = datuak
          .filter((kategoria: any) => kategoria.ezabatzeData === null)
          .map((kategoria: any) => ({
            kodea: kategoria.kodea,
            izena: kategoria.izena,
            sortzeData: kategoria.sortzeData,
            langileak: kategoria.langileak
              .filter((langilea: any) => langilea.ezabatzeData === null)
              .map((langilea: any) => ({
                id: langilea.id,
                izena: langilea.izena,
                abizenak: langilea.abizenak,
                sortzeData: langilea.sortzeData,
                eguneratzeData: langilea.eguneratzeData,
              }))
          }));

        console.log('Kategoriak eta langileak:', this.alumnos);
      },
      (error) => {
        console.error('Errorea langileak kargatzerakoan:', error);
      }
    );
  }

  onGrupoChange() {
    if (!this.alumnos || this.alumnos.length === 0) {
      console.error('No hay datos en alumnos');
      this.filteredAlumnos = [];
      return;
    }
    const grupoSeleccionado = this.alumnos.find(taldea => taldea.kodea === this.selecTaldea);
    this.filteredAlumnos = grupoSeleccionado ? grupoSeleccionado.langileak : [];
  }


  constructor(private translate: TranslateService, private languageService: LanguageService, private alertController: AlertController,private http: HttpClient, private loginService: LoginServiceService, private route: ActivatedRoute) {
      this.selectedLanguage = this.languageService.getCurrentLanguage();
  }
  
  ngOnInit() {
    // Suscribirse a los cambios de ruta
    this.routeSubscription = this.route.params.subscribe((params) => {
      console.log('Ruta cambiada:', params); // Si necesitas los parámetros de la ruta

      // Comprobar si el usuario es 'Ikasle' cada vez que se carga la página
      this.isIkasle = this.loginService.isAlumno();

      // Llamar a las funciones necesarias
      this.produktuakLortu();
      this.langileakLortu();
    });
  }

}
