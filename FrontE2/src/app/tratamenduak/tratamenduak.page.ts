import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { HeaderComponent } from '../components/header/header.component';
import { HttpClient } from '@angular/common/http';
import { LoginServiceService } from '../zerbitzuak/login-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-tratamenduak',
  templateUrl: './tratamenduak.page.html',
  styleUrls: ['./tratamenduak.page.scss'],
})
export class TratamenduakPage implements OnInit {

  @ViewChild(HeaderComponent) headerComponent!: HeaderComponent;
  selectedLanguage: string = 'es';
  zerbitzuak: any[] = [];
  filteredZerbitzuak: any[] = [];
  modalAtera = false;
  alumne = '';
  categoriasAbiertas: { [key: string]: boolean } = {};
  filteredAlumnos!: any[];
  selectedCategoryId!: number;
  crearServicio: any = { izena: '', idKategoria: null, kanpokoPrezioa: '', etxekoPrezioa: '' };
  crearCategoria: any = {
    izena: '',
    kolorea: false,
    extra: false,
    imagen: null // Aquí se guardará la imagen seleccionada
  }; editarCategoria: any;
  editarServicio: any;
  serviciosSeleccionados: any[] = [];
  isEditingService: boolean = false;
  isEditingCategoria: boolean = false;

  filtroCategoria: string = '';
  filtroZerbitzua: string = '';
  isIkasle!: boolean;
  private routeSubscription: any;

  constructor(private translate: TranslateService, private http: HttpClient, private loadingController: LoadingController, private loginService: LoginServiceService, private router: Router, private route: ActivatedRoute) {
    this.translate.setDefaultLang('es');
    this.translate.use(this.selectedLanguage);
  }

  ngOnInit() {
    // Suscribirse a los cambios de ruta
    this.routeSubscription = this.route.params.subscribe((params) => {
      console.log('Ruta cambiada:', params); // Si necesitas los parámetros de la ruta

      // Comprobar si el usuario es 'Ikasle' cada vez que se carga la página
      this.isIkasle = this.loginService.isAlumno();

      // Si es Ikasle, redirigir a '/home'
      if (this.isIkasle) {
        this.router.navigate(['/home']);
      }

      // Llamar a las funciones necesarias
      this.zerbiztuakLortu();
    });
  }

  ngOnDestroy() {
    // Limpiar la suscripción cuando el componente se destruya
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.crearCategoria.imagen = file; // Guardar la imagen seleccionada
    }
  }

  changeLanguage() {
    this.translate.use(this.selectedLanguage);
    if (this.headerComponent) {
      this.headerComponent.loadTranslations();
    }
  }

  filtrarZerbitzuak() {
    this.filteredZerbitzuak = this.zerbitzuak.map(categoria => ({
      ...categoria,
      zerbitzuak: categoria.zerbitzuak.map((zerbitzua: any) => ({ ...zerbitzua }))
    }));

    if (this.filtroCategoria !== '') {
      this.filteredZerbitzuak = this.filteredZerbitzuak.filter(categoria =>
        (this.filtroCategoria === '' || categoria.izena.toLowerCase().includes(this.filtroCategoria.toLowerCase()))
      );
    }

    if (this.filtroZerbitzua !== '') {
      this.filteredZerbitzuak = this.filteredZerbitzuak.map(categoria => ({
        ...categoria,
        produktuak: categoria.produktuak.filter((producto: any) =>
          producto.izena.toLowerCase().includes(this.filtroZerbitzua.toLowerCase())
        )
      }));
    }
  }

  openServiceModal(service: any, idKat: number) {
    this.isEditingService = true;
    this.editarServicio = service;
    this.editarServicio.idKategoria = idKat;
    console.log(this.editarServicio);
  }

  closeServiceModal() {
    this.isEditingService = false;
  }

  openKatModal(kategoria: any) {
    this.isEditingCategoria = true;
    this.editarCategoria = kategoria;
    console.log(this.editarCategoria);
  }

  closeKatModal() {
    this.isEditingCategoria = false;
  }

  toggleCategoria(categoria: string) {
    this.categoriasAbiertas[categoria] = !this.categoriasAbiertas[categoria];
  }

  isCategoriaAbierta(categoria: string): boolean {
    return this.categoriasAbiertas[categoria] || false;
  }

  zerbiztuakLortu() {
    this.http.get(`${environment.url}zerbitzu_kategoria`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    }).subscribe(
      (datuak: any) => {
        this.zerbitzuak = datuak
          .filter((categoria: any) => categoria.ezabatzeData === null)
          .map((categoria: any) => ({
            ...categoria,
            // Crear la URL completa de la imagen
            irudiaUrl: this.getCategoriaImageUrl(categoria.irudia),
            zerbitzuak: categoria.zerbitzuak
              .filter((zerbitzua: any) => zerbitzua.ezabatzeData === null)
          }));
  
        this.filteredZerbitzuak = this.zerbitzuak;
        console.log('zerbitzuak kargatu:', this.zerbitzuak);
      },
      (error) => {
        console.error('Errorea zerbitzuak kargatzerakoan:', error);
      }
    );
  }
  

  sortuZerbitzua() {
    const json_data = {
      "izena": this.crearServicio.izena,
      "zerbitzuKategoria": {
        "id": this.crearServicio.idKategoria
      },
      "etxekoPrezioa": this.crearServicio.etxekoPrezioa,
      "kanpokoPrezioa": this.crearServicio.kanpokoPrezioa
    };

    console.log(json_data);

    this.http.post(`${environment.url}zerbitzuak`, json_data, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      (response) => {
        console.log('Servicio creado correctamente');
        this.zerbiztuakLortu();  // Actualizar la lista de servicios
      },
      (error) => {
        console.error('Errorea zerbitzua sortzerakoan:', error);
      }
    );
  }

  editarServicios() {
    const json_data = {
      "id": this.editarServicio.id,
      "izena": this.editarServicio.izena,
      "zerbitzuKategoria": {
        "id": this.editarServicio.idKategoria
      },
      "etxekoPrezioa": this.editarServicio.etxekoPrezioa,
      "kanpokoPrezioa": this.editarServicio.kanpokoPrezioa
    };

    console.log(json_data);

    this.http.put(`${environment.url}zerbitzuak`, json_data, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      (response) => {
        console.log('Servicio actualizado correctamente');
        this.zerbiztuakLortu();  // Actualizar la lista de servicios
      },
      (error) => {
        console.error('Errorea zerbitzua eguneratzerakoan:', error);
      }
    );
  }

  eliminarServicio(id: number) {
    const url = `${environment.url}zerbitzuak/${id}`;

    this.http.delete(url, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      (response) => {
        console.log('Servicio eliminado correctamente');
        this.zerbiztuakLortu();  // Actualizar la lista de servicios
      },
      (error) => {
        console.error('Errorea zerbitzua ezabatzerakoan:', error);
      }
    );
  }

  crearKategoria() {
    const categoriaData = {
      izena: this.crearCategoria.izena,
      kolorea: this.crearCategoria.kolorea,
      extra: this.crearCategoria.extra
    };

    // Paso 1: Crear la categoría sin imagen
    this.http.post(`${environment.url}zerbitzu_kategoria`, categoriaData).subscribe(
      (response: any) => {
        const id = response.id;

        // Paso 2: Si hay imagen, subirla
        if (this.crearCategoria.imagen) {
          const formData = new FormData();
          formData.append('imagen', this.crearCategoria.imagen, this.crearCategoria.imagen.name);

          console.log(this.crearCategoria.imagen);
          this.http.post(`${environment.url}zerbitzu_kategoria/${id}/upload-irudia`, formData, {
            responseType: 'text' // 👈 Indicamos que esperamos texto plano
          }).subscribe(
            () => {
              console.log('Imagen subida correctamente');
              this.zerbiztuakLortu();
              this.closeKatModal();
            },
            error => console.error('Error al subir la imagen:', error)
          );
        } else {
          this.zerbiztuakLortu();
          this.closeKatModal();
        }
      },
      error => console.error('Error al crear la categoría:', error)
    );
  }


  getCategoriaImageUrl(fileName: string): string {
    const ruta = `${environment.url}uploads/kategoriak/${fileName}`;
    console.log(ruta);
    return ruta;
  }
  



  editarKategoria() {
    const json_data = {
      "id": this.editarCategoria.id,
      "izena": this.editarCategoria.izena,
      "kolorea": this.editarCategoria.kolorea,
      "extra": this.editarCategoria.extra
    };
    console.log(json_data);

    this.http.put(`${environment.url}zerbitzu_kategoria`, json_data, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      (response) => {
        console.log('Categoría editada correctamente');
        this.zerbiztuakLortu(); // Actualizar la lista de servicios
        this.closeKatModal();   // Cerrar el modal
      },
      (error) => {
        console.error('Errorea zerbitzuak kargatzerakoan:', error);
      }
    );
  }

  eliminarKategoria(id: number) {
    this.http.delete(`${environment.url}zerbitzu_kategoria/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      (response) => {
        console.log('Categoría eliminada correctamente');
        this.zerbiztuakLortu(); // Actualizar la lista de servicios
      },
      (error) => {
        console.error('Errorea zerbitzuak kargatzerakoan:', error);
      }
    );
  }

}
