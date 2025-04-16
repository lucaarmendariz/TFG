import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/internal/Observable';
import { HeaderComponent } from '../components/header/header.component';
import { LoginServiceService } from '../zerbitzuak/login-service.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

export interface Alumno {
  nombre: string;
  grupo: string;
}

@Component({
  selector: 'app-materialak',
  templateUrl: './materialak.page.html',
  styleUrls: ['./materialak.page.scss'],
})
export class MaterialakPage implements OnInit {
  @ViewChild(HeaderComponent) headerComponent!: HeaderComponent;

  selectedLanguage: string = 'es';
  modal!:string;

  materialesSeleccionados:any[]=[];
  materialesSeleccionadosDevolver:any[]=[];
  filteredMaterialak: any[] = []; 

  materialak!:any[];
  materialaDevolver!:any;

  crearKatNombre:String| null = null;
  crearNombre:String| null = null;
  crearEtiqueta:String| null = null;
  crearCategoria:Number| null = null;

  editarKatNombre!:String;
  editarNombre!:String;
  editarEtiqueta!:String;
  editarCategoria!:Number;
  matDevolverId!:Number;

  seleccionarId!:Number;

  selectedCategoryId!:number;

  alumnos!: any[];
  selecTaldea!:number;
  selecAlumno!:number;

  mostrarFiltros: boolean = false;
  private routeSubscription: any;

  @ViewChild('modaleditarcat', { static: true })
  modaleditarcat!: IonModal;
  @ViewChild('modalEditar', { static: true })
  modalEditar!: IonModal;
  selectedCategory: any = {};
  selectedMateriala: any = {};

  modalAtera = false;
  alumne = '';
  categoriasAbiertas: { [key: string]: boolean } = {};
  filteredAlumnos!: any[];

  filtroCategoria: string = '';
  filtroMaterial: string = '';

  checkboxHabilitado = false;
  mostrarCheckbox: boolean = false;
  isIkasle!:boolean;

  changeLanguage() {
    this.translate.use(this.selectedLanguage);
    if (this.headerComponent) {
      this.headerComponent.loadTranslations();
    }
  }

  actualizarMaterialesSeleccionados(material:any) {
    const index = this.materialesSeleccionados.findIndex(p => p.id === material.id);
    if (material.selected && index === -1) {
      this.materialesSeleccionados.push(material);
    } else if (!material.selected && index !== -1) {
      this.materialesSeleccionados.splice(index, 1);
    }
    console.log('Materiales seleccionados:', this.materialesSeleccionados);
  }

  actualizarMaterialesSeleccionadosDevolver(material: any, isChecked: boolean) {
    const index = this.materialesSeleccionadosDevolver.findIndex(p => p.id === material.id);
  
    if (isChecked && index === -1) {
      this.materialesSeleccionadosDevolver.push(material);
    } else if (!isChecked && index !== -1) {
      this.materialesSeleccionadosDevolver.splice(index, 1);
    }
    material.selected = isChecked;
    console.log('Materiales seleccionados:', this.materialesSeleccionadosDevolver);
  }
  
  toggleMostrarCheckbox() {
    this.mostrarCheckbox = !this.mostrarCheckbox;
    if(this.mostrarCheckbox){
      this.filteredMaterialak = this.filteredMaterialak.map(material => {
        return {
            ...material,
            materialak: material.materialak.filter((m:any) => 
                !this.materialaDevolver.some((devolver:any) => devolver.materiala.etiketa === m.etiketa)
            )
        };
    }).filter(material => material.materialak.length > 0);
    
    }else{
      this.filteredMaterialak = this.materialak;
    }
    console.log(this.filteredMaterialak)
    console.log(this.materialaDevolver)
  }

  toggleCategoria(categoria: string) {
    this.categoriasAbiertas[categoria] = !this.categoriasAbiertas[categoria];
  }

  isCategoriaAbierta(categoria: string): boolean {
    return this.categoriasAbiertas[categoria] || false;
  }

  async materialaSortu(){
    let data = {
      "etiketa": this.crearEtiqueta,
      "izena": this.crearNombre,
      "materialKategoria": {
          "id": this.crearCategoria
      }
  }
    let observableRest: Observable<any> = this.restServer.post<any>(`${environment.url}materialak`, data);
    await observableRest.subscribe(datuak => {
      console.log(datuak);
      this.materialakLortu();
      this.vaciarDatos();
    });
  }

  async kategoriaSortu(){
    let data = {
      "izena": this.crearKatNombre,
    } 
    let observableRest: Observable<any> = this.restServer.post<any>(`${environment.url}material_kategoria`, data);
    await observableRest.subscribe(datuak => {
      console.log(datuak);
      this.materialakLortu();
      this.vaciarDatos();
    });
  }

  materialaEditatu(id:number){
    let data = {
      "etiketa": this.editarEtiqueta,
      "izena": this.editarNombre,
      "materialKategoria": {
          "id": this.editarCategoria
      },
    }

    let observableRest: Observable<any> = this.restServer.put<any>(`${environment.url}materialak/id/${id}`, data);
    observableRest.subscribe(datuak => {
      console.log(datuak);
      this.materialakLortu();
      this.vaciarDatos();
	  });
  }


  vaciarDatos(){
    this.crearEtiqueta = null;
    this.crearNombre = null;
    this.crearCategoria = null;
    this.crearKatNombre = null;
    this.materialesSeleccionados = [];
  }

  materialaEzabatu(id:number){
    let observableRest: Observable<any> = this.restServer.delete<any>(`${environment.url}materialak/id/${id}`);
    observableRest.subscribe(datuak => {
      console.log(datuak);
      this.materialakLortu();
      this.vaciarDatos();
    });
  }  

  kategoriaEzabatu(id:number){
    let observableRest: Observable<any> = this.restServer.delete<any>(`${environment.url}material_kategoria/id/${id}`);
    observableRest.subscribe(datuak => {
      console.log(datuak);
      this.materialakLortu();
      this.vaciarDatos();
    });
  }  

  kategoriaEditatu(id: number){
    let data = {
      "izena": this.editarKatNombre
    }
    let observableRest: Observable<any> = this.restServer.put<any>(`${environment.url}material_kategoria/id/${id}`, data);
    observableRest.subscribe(datuak => {
      console.log(datuak);
      this.materialakLortu();
      this.vaciarDatos();
    });
  }

  toggleMaterialakLortu(){
    this.mostrarFiltros
  }

  materialakLortu(){
    let observableRest: Observable<any> = this.restServer.get<any>(`${environment.url}material_kategoria`);
    observableRest.subscribe(datuak => {
      console.log(datuak);

    this.materialak = datuak
    .filter((categoria:any) => categoria.ezabatzeData === null)
    .map((categoria:any) => ({
      ...categoria,
      materialak: categoria.materialak
        .filter((material:any) => material.ezabatzeData === null)
    }));
    this.filteredMaterialak = this.materialak;
    });
  }

  materialakLortuAtera() {
    let observableRest: Observable<any> = this.restServer.get<any>(`${environment.url}material_kategoria`);
    observableRest.subscribe(datuak => {
      console.log(datuak);
      const materialaDevolverIds = this.materialaDevolver.map((material: any) => material.id);

      this.materialak = datuak
        .filter((categoria: any) => categoria.ezabatzeData === null)
        .map((categoria: any) => ({
          ...categoria,
          materialak: categoria.materialak
            .filter((material: any) => 
              material.ezabatzeData === null &&
              !materialaDevolverIds.includes(material.id)
            )
        }));

      this.filteredMaterialak = this.materialak;
    });
  }

  materialakLortuDevolver() {
    let observableRest: Observable<any> = this.restServer.get<any>(`${environment.url}material_mailegua`);

    observableRest.subscribe(datuak => {
        this.materialaDevolver = datuak.filter((mailegu:any) => 
            mailegu.hasieraData && !mailegu.amaieraData
        );
        console.log(this.materialaDevolver);
    });
  }

  materialakAtera(){
    let data = this.materialesSeleccionados.map(materiala => ({
      "materiala": {
        "id": materiala.id
    },
      "langilea": {
        "id": this.selecAlumno
    }
  }));

    let observableRest: Observable<any> = this.restServer.post<any>(`${environment.url}material_mailegua`,data);
    observableRest.subscribe(datuak => {
      console.log(datuak);
      this.vaciarDatos();
      this.materialakLortu();
      this.materialakLortuDevolver();
    });
  }

  materialakBueltatu(){
    let data = this.materialesSeleccionadosDevolver.map(mailegu => ({
      "id": mailegu.id
  }));

    let observableRest: Observable<any> = this.restServer.put<any>(`${environment.url}material_mailegua`, data);
    observableRest.subscribe(datuak => {
      console.log(datuak);

      this.materialaDevolver = datuak
      this.materialakLortu();
      this.materialakLortuDevolver();
      this.vaciarDatos();
    });
  }

  materialakAteraKargatu(){
    
  }

  langileakLortu(){
    let observableRest: Observable<any> = this.restServer.get<any>(`${environment.url}taldeak`);
    observableRest.subscribe(datuak => {
      console.log(datuak);
      
      this.alumnos = datuak
      .filter((kategoria: any) => kategoria.ezabatzeData === null)
      .map((kategoria: any) => ({
        ...kategoria,
        langileak: kategoria.langileak
          .filter((langilea: any) => langilea.ezabatzeData === null)
      }));
    });
  }  

  abrirEditarCategoria(categoria:any) {
    this.modaleditarcat.present();
    this.selectedCategory = {...categoria};
    this.editarKatNombre = this.selectedCategory.izena;
  }

  abrirEditarMaterial(material:any) {
    console.log(material);
    this.modalEditar.present();
    this.selectedMateriala = {...material};
    this.editarNombre = material.izena;
    this.editarEtiqueta = material.etiketa;
    this.editarCategoria = material.kategoriaId;
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

  async confirmarEliminarMaterial(id: number, izena:string) {
    const alert = await this.alertController.create({
      header: this.translate.instant('materiales.modal.confirmacion'),
      message: this.translate.instant('materiales.modal.mensajeAlertaBorrarMats') + " '" + izena + "'?",
      buttons: [
        {
          text: this.translate.instant('materiales.botones.cancelar'),
          role: 'cancel',
        },
        {
          text: this.translate.instant('materiales.botones.borrar'),
          handler: () => {
            this.materialaEzabatu(id);
          },
        },
      ],
    });

    await alert.present();
  }

  async confirmarEliminarCategoria(id: number, izena:string) {
    const alert = await this.alertController.create({
      header: this.translate.instant('materiales.modal.confirmacion'),
      message: this.translate.instant('materiales.modal.mensajeAlertaBorrarCats') + " '" + izena + "'?",
      buttons: [
        {
          text: this.translate.instant('materiales.botones.cancelar'),
          role: 'cancel',
        },
        {
          text: this.translate.instant('materiales.botones.borrar'),
          handler: () => {
            this.kategoriaEzabatu(id);
          },
        },
      ],
    });

    await alert.present();
  }

  filtrarMateriales() {
    this.filteredMaterialak = this.materialak.map(categoria => ({
      ...categoria,
      materialak: categoria.materialak.map((material: any) => ({ ...material }))
    }));

    if(this.filtroCategoria !== '')
    {
      this.filteredMaterialak = this.filteredMaterialak.filter(categoria =>
        (this.filtroCategoria === '' || categoria.izena.toLowerCase().includes(this.filtroCategoria.toLowerCase()))
      );
    }

    if (this.filtroMaterial !== '') {
      this.filteredMaterialak = this.filteredMaterialak.map(categoria => ({
        ...categoria,
        materialak: categoria.materialak.filter((materiala: any) =>
          materiala.izena.toLowerCase().includes(this.filtroMaterial.toLowerCase())
        )
      }));
    }
  }

  constructor(private translate: TranslateService, private restServer:HttpClient, private alertController: AlertController, private loginService: LoginServiceService, private route: ActivatedRoute) {
    this.translate.setDefaultLang('es');
    this.translate.use(this.selectedLanguage);
  }
  
  ngOnInit() {
    // Suscribirse a los cambios de ruta
    this.routeSubscription = this.route.params.subscribe((params) => {
      console.log('Ruta cambiada:', params); // Si necesitas los parámetros de la ruta

      // Comprobar si el usuario es 'Ikasle' cada vez que se carga la página
      this.isIkasle = this.loginService.isAlumno();

      // Llamar a las funciones necesarias
      this.materialakLortu();
      this.langileakLortu();
      this.materialakLortuDevolver();
    });
  }

  ngOnDestroy() {
    // Limpiar la suscripción cuando el componente se destruya
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
}
