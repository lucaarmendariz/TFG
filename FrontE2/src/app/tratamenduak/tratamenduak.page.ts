import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { HeaderComponent } from '../components/header/header.component';
import { HttpClient } from '@angular/common/http';
import { LoginServiceService } from '../zerbitzuak/login-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonModal, LoadingController, ModalController } from '@ionic/angular';
import { LanguageService } from '../zerbitzuak/language.service';

interface Servicio {
  id: number;
  izena: string;
  etxekoPrezioa: number;
  kanpokoPrezioa: number;
  sortzeData: string;
  eguneratzeData: string;
  ezabatzeData: string;
}

@Component({
    selector: 'app-tratamenduak',
    templateUrl: './tratamenduak.page.html',
    styleUrls: ['./tratamenduak.page.scss'],
    standalone: false
})





export class TratamenduakPage implements OnInit {
  @ViewChild('modalServiceCrear', { static: true }) modalServiceCrear!: IonModal;

  @ViewChild(HeaderComponent) headerComponent!: HeaderComponent;
  selectedLanguage: string = 'es';
  zerbitzuak: any[] = [];
  filteredZerbitzuak: any[] = [];
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
  }; 
  editarCategoria: any;
  editarServicio: any;
  serviciosSeleccionados: any[] = [];
  isEditingService: boolean = false;
  isEditingCategoria: boolean = false;

  imagenesServidor: string[] = [];

  filtroGeneral: string = '';
  isIkasle!: boolean;
  private routeSubscription: any;

  constructor(private translate: TranslateService,  private languageService: LanguageService,  private modalController: ModalController,
    private alertController: AlertController, private http: HttpClient, private loadingController: LoadingController, private loginService: LoginServiceService, private router: Router, private route: ActivatedRoute) {
    this.selectedLanguage = this.languageService.getCurrentLanguage();
  }

  ngOnInit() {
    // Suscribirse a los cambios de ruta
    this.routeSubscription = this.route.params.subscribe((params) => {

      // Comprobar si el usuario es 'Ikasle' cada vez que se carga la página
      this.isIkasle = this.loginService.isAlumno();

      // Si es Ikasle, redirigir a '/home'
      if (this.isIkasle) {
        this.router.navigate(['/home']);
      }

      // Llamar a las funciones necesarias
      this.zerbiztuakLortu();
    });
    this.cargarImagenesDelServidor();
  }

  ngOnDestroy() {
    // Limpiar la suscripción cuando el componente se destruya
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  imagenPreview: string | null = null;

onImageSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.crearCategoria.imagen = file;
    this.crearCategoria.imagenUrl = null; // Priorizar imagen local

    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
    
  }
}

cargarImagenesDelServidor() {
  this.http.get<string[]>(`${environment.url}uploads/kategoriak/list`).subscribe(
    (imagenes) => {
      this.imagenesServidor = imagenes.map(nombre =>
        `${environment.url}uploads/kategoriak/${nombre}`
      );
    },
    error => console.error('Error al cargar imágenes del servidor', error)
  );
}

seleccionarImagenExistente(url: string) {
  this.crearCategoria.imagen = null; // deseleccionar cualquier archivo local
  this.crearCategoria.imagenUrl = url;
  this.imagenPreview = url;
}

imagenSeleccionadaEditar: File | null = null;

seleccionarImagenExistenteEditar(url: string) {
  this.imagenSeleccionadaEditar = null;

  // Extraer solo el nombre del archivo de la URL
  const fileName = url.substring(url.lastIndexOf('/') + 1);
  this.editarCategoria.irudia = fileName;

  this.imagenPreview = url;
}


onImageSelectedEditar(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.imagenSeleccionadaEditar = file;
    this.editarCategoria.imagenUrl = null;
    this.editarCategoria.irudia = file;  

    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}



  changeLanguage() {
  this.languageService.setLanguage(this.selectedLanguage);
}


  filtrarZerbitzuak() {
    const filtro = this.filtroGeneral.trim().toLowerCase();
  
    if (filtro === '') {
      this.filteredZerbitzuak = [...this.zerbitzuak];
      return;
    }
  
    this.filteredZerbitzuak = this.zerbitzuak
      .map(categoria => {
        const coincideCategoria = categoria.izena.toLowerCase().includes(filtro);
        const serviciosFiltrados = categoria.zerbitzuak.filter((servicio: any) =>
          servicio.izena.toLowerCase().includes(filtro)
        );
  
        if (coincideCategoria || serviciosFiltrados.length > 0) {
          return {
            ...categoria,
            zerbitzuak: coincideCategoria ? [...categoria.zerbitzuak] : serviciosFiltrados
          };
        }
  
        return null;
      })
      .filter(categoria => categoria !== null);
  }
  
  cerrarModalServicio() {
    this.modalServiceCrear.dismiss();
  }
  
  

  openServiceModal(service: any, idKat: number) {
    this.isEditingService = true;
    this.editarServicio = service;
    this.editarServicio.idKategoria = idKat;
  }

  closeServiceModal() {
    this.isEditingService = false;
    this.zerbiztuakLortu();
  }

  openKatModal(kategoria: any) {
    this.isEditingCategoria = true;
    this.editarCategoria = kategoria;
    this.cargarImagenesDelServidor();
  }

  closeKatModal() {
    // Cerrar la modal
    this.isEditingCategoria = false; // Si usas una variable para el estado de la edición
    
    // Limpiar los datos del formulario de creación
    this.crearCategoria = {
      id: null,
      izena: '',
      kolorea: false,
      extra: false,
      imagenUrl: null
    };
  
    // Limpiar los datos del formulario de edición
    this.editarCategoria = {
      id: null,
      izena: '',
      kolorea: false,
      extra: false,
      imagenUrl: null
    };
  
    // Limpiar el archivo de imagen
    this.imagenSeleccionadaEditar = null;
    this.imagenPreview = null; // Limpiar vista previa de la imagen
  
    this.zerbiztuakLortu();
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
            zerbitzuak: categoria.zerbitzuak
              .filter((zerbitzua: any) => zerbitzua.ezabatzeData === null)
          }));
  
        this.filteredZerbitzuak = this.zerbitzuak;
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
    this.cerrarModalServicio();
    this.zerbiztuakLortu();
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
    this.closeServiceModal();
    this.zerbiztuakLortu();
  }

  async eliminarServicio(id: number) {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: '¿Estás seguro de que deseas eliminar este servicio?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Eliminación del servicio cancelada');
          }
        },
        {
          text: 'Eliminar',
          handler: () => {
            // Proceder con la eliminación del servicio si el usuario confirma
            const url = `${environment.url}zerbitzuak/${id}`;
    
            this.http.delete(url, {
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            }).subscribe(
              (response) => {
                console.log('Servicio eliminado correctamente');
                this.zerbiztuakLortu();  
              },
              (error) => {
                console.error('Error al eliminar el servicio:', error);
              }
            );
          }
        }
      ]
    });
  
    await alert.present();
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
  
        // Paso 2: Si hay una imagen URL seleccionada, asignarla
        if (this.crearCategoria.imagenUrl) {
          this.http.post(`${environment.url}zerbitzu_kategoria/${id}/assign-image-url`, this.crearCategoria.imagenUrl)
            .subscribe(
              (response: any) => {
                if (response.message) {
                  this.zerbiztuakLortu();
                } else if (response.error) {
                  console.error(response.error); // Maneja el error
                }
              },
              (error) => {
                console.error('Error al asignar la URL de la imagen:', error);
              }
            );
        } else if (this.crearCategoria.imagen) {
          // Si hay una imagen local, sube la imagen
          const formData = new FormData();
          formData.append('imagen', this.crearCategoria.imagen, this.crearCategoria.imagen.name);
  
          this.http.post(`${environment.url}zerbitzu_kategoria/${id}/upload-irudia`, formData, {
            responseType: 'text' // 👈 Indicamos que esperamos texto plano
          }).subscribe(
            () => {
              console.log('Imagen subida correctamente');
              this.zerbiztuakLortu();
            },
            error => {
              console.error('Error al subir la imagen:', error);
            }
          );
        } else {
          // No hay imagen, solo crear la categoría
          this.zerbiztuakLortu();
        }
      },
      error => console.error('Error al crear la categoría:', error)
    );
  }
  
  
  


  getCategoriaImageUrl(fileName: string): string {
    const ruta = `${environment.url}uploads/kategoriak/${fileName}`;
    return ruta;
  }

  editarKategoria() {
    const formData = new FormData();
  
    formData.append('id', this.editarCategoria.id.toString());
    formData.append('izena', this.editarCategoria.izena);
    formData.append('kolorea', this.editarCategoria.kolorea.toString());
    formData.append('extra', this.editarCategoria.extra.toString());
  
    // Si es nueva imagen (tipo File)
    if (this.imagenSeleccionadaEditar instanceof File) {
      formData.append('imagen', this.imagenSeleccionadaEditar, this.imagenSeleccionadaEditar.name);
      formData.append('irudia', ''); // Por si es obligatorio en el servidor
    } else if (typeof this.editarCategoria.irudia === 'string') {
      // Si es imagen existente, enviar el nombre del archivo
      formData.append('irudia', this.editarCategoria.irudia);
    }
  
    this.http.put(`${environment.url}zerbitzu_kategoria/edit-with-image`, formData).subscribe(
      (response: any) => {
        console.log('Categoría editada correctamente:', response);
        this.zerbiztuakLortu();
        this.closeKatModal();
      },
      error => {
        console.error('Error al editar la categoría:', error);
      }
    );
  }
  
  
  
  

  async eliminarKategoria(id: number) {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: '¿Estás seguro de que deseas eliminar esta categoría?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: 'Eliminar',
          handler: () => {
            // Proceder con la eliminación si el usuario confirma
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
                console.error('Error al eliminar la categoría:', error);
              }
            );
          }
        }
      ]
    });
  
    await alert.present();
  }
  

}
