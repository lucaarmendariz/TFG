import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonModal, ModalController, ToastController } from '@ionic/angular';
import {IkasleZerbitzuakService, Ikaslea, Taldea, Horario,} from './../zerbitzuak/ikasle-zerbitzuak.service';
import { TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from '../components/header/header.component';
import { LoginServiceService } from '../zerbitzuak/login-service.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-ikasleak',
  templateUrl: './ikasleak.page.html',
  styleUrls: ['./ikasleak.page.scss'],
})


export class IkasleakPage implements OnInit {
  @ViewChild(HeaderComponent) headerComponent!: HeaderComponent;
  selectedLanguage: string = 'es';
  searchQuery: string = '';
  ikasleak: Ikaslea[] = [];
  ikasleArray: any[] = [];
  filteredAlumnos: any[] = [];
  selectedAlumno: any = null;
  selectedIkasleak: Set<number> = new Set();
  nuevoAlumno: any = {izena: '', abizenak: '', taldea: { kodea: '' },};
  isEditModalOpen: boolean = false;
  nuevoGrupo: any = { kodea: '', izena: '' };
  selectedTalde: any = null;
  ordutegiArray: any[] = [];
  ordutegiArrayFiltered: any[] = [];
  isEditTaldeModalOpen: boolean = false;
  fecha: string = '';
  horaInicio: any = null;
  horaFin: any = null;
  fechaInicioFilter: any = null;
  fechaFinFilter: any = null;
  fechaInicio: any = null;
  fechaFin: any = null;
  idHorario: any = null;
  grupoSeleccionado: Taldea = { kodea: '', izena: '' };
  diaSeleccionado: number = 0;
  ordutegia: Horario = {taldea: {kodea: '',},eguna: 0,hasieraData: '',amaieraData: '',hasieraOrdua: '',amaieraOrdua: '',};
  selectedHorario: Horario = {id: 0,hasieraData: '',hasieraOrdua: '',amaieraData: '',amaieraOrdua: '',eguna: 0,taldea: { kodea: '' },};
  filteredGroups: any[] = [];
  isIkasle!:boolean;
  private routeSubscription: any;


  constructor(
    private translate: TranslateService,
    private modalController: ModalController,
    private ikasleService: IkasleZerbitzuakService,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router,
    private loginService: LoginServiceService,
    private route: ActivatedRoute
  ) {
    this.translate.setDefaultLang('es');
    this.translate.use(this.selectedLanguage);
  }

  lortuData(): string {
    const gaur = new Date();
    const urtea = gaur.getFullYear();
    let hilabetea: string | number = gaur.getMonth() + 1; // Los meses comienzan en 0
    let eguna: string | number = gaur.getDate();
  
    if (eguna < 10) {
      eguna = '0' + eguna;
    }
    if (hilabetea < 10) {
      hilabetea = '0' + hilabetea;
    }
    return `${urtea}-${hilabetea}-${eguna}`;
  }

  ngOnInit() {
    // Suscribirse a los cambios de ruta
    this.routeSubscription = this.route.params.subscribe((params) => {
      console.log('Ruta cambiada:', params); // Puedes ver los parámetros aquí, si es necesario.

      // Comprobar si el usuario es 'Ikasle' cada vez que se carga la página
      this.isIkasle = this.loginService.isAlumno();
      
      // Si es Ikasle, redirigir a '/home'
      if (this.isIkasle) {
        this.router.navigate(['/home']);
      }

      // Llamar a las funciones necesarias
      this.fechaInicioFilter = this.lortuData();
      this.fechaFinFilter = this.lortuData();
      this.getGrupos();
      this.getAlumnos();
      this.getHorarios();
    });
  }

  ngOnDestroy() {
    // Limpiar la suscripción cuando el componente se destruya
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  changeLanguage() {
    this.translate.use(this.selectedLanguage);
    if (this.headerComponent) {
      this.headerComponent.loadTranslations();
    }
  }

  getHorarios(): void {
    this.ikasleService.getHorariosFilter(this.fechaInicioFilter, this.fechaFinFilter).subscribe(
      (horarios) => {
        console.log(horarios)
        // Filtrar los horarios que no tienen datos en 'ezabatze_data' (null, undefined o vacío)
        this.ordutegiArray = horarios;
        this.ordutegiArrayFiltered = this.ordutegiArray;
      },
      (error) => {
        console.error('Error al obtener los horarios:', error);
      }
    );
  }

  filterHorarios()
  {
    this.ordutegiArrayFiltered = this.ordutegiArray.map(ordutegi => ({
      ...ordutegi,
      // zerbitzuak: categoria.zerbitzuak.map((zerbitzua: any) => ({ ...zerbitzua }))
    }));

    this.ordutegiArrayFiltered = this.ordutegiArrayFiltered.filter(ordutegi => {
      const horarioFecha = new Date(ordutegi.hasieraData); // Convertir a objeto Date
      const inicio = this.fechaInicioFilter ? new Date(this.fechaInicioFilter) : null;
      const fin = this.fechaFinFilter ? new Date(this.fechaFinFilter) : null;
  
      return (
        (!inicio || horarioFecha >= inicio) &&
        (!fin || horarioFecha <= fin)
      );
    });
  }

  resetFilters() {
    this.fechaInicioFilter = null;
    this.fechaFinFilter = null;
    this.ordutegiArrayFiltered = this.ordutegiArray.map(ordutegi => ({
      ...ordutegi,
      // zerbitzuak: categoria.zerbitzuak.map((zerbitzua: any) => ({ ...zerbitzua }))
    }));  
  }
  

  filterGroups() {
  
    if (this.searchQuery.trim() === '') {
      this.filteredGroups = [...this.grupoArray];
    } else {
      this.filteredGroups = this.grupoArray.filter(grupo =>
        (grupo.izena && grupo.izena.toLowerCase().includes(this.searchQuery.toLowerCase())) || 
        (grupo.kodea && grupo.kodea.toLowerCase().includes(this.searchQuery.toLowerCase()))
      );      
    }
  }
  



  resetFilterGroup() {
    this.searchQuery = '';
    this.filteredGroups = this.grupoArray;
  }


  getDayName(k: number): string {
    if (k === 1) {
      return this.translate.instant('ikaslePage.Astelehena'); // Lunes
    } else if (k === 2) {
      return this.translate.instant('ikaslePage.Asteartea'); // Martes
    } else if (k === 3) {
      return this.translate.instant('ikaslePage.Asteazkena'); // Miércoles
    } else if (k === 4) {
      return this.translate.instant('ikaslePage.Osteguna'); // Jueves
    } else if (k === 5) {
      return this.translate.instant('ikaslePage.Ostirala'); // Viernes
    } else {
      return ''; // Si no es un valor válido de 1 a 7
    }
  }

  // Método para obtener los alumnos de la API
  getAlumnos() {
    this.ikasleService.getAlumnos().subscribe((data: Ikaslea[]) => {
      this.ikasleArray = data; // Guarda todos los alumnos
      this.filteredAlumnos = this.ikasleArray.filter(
        (ikaslea) => !ikaslea.ezabatzeData
      );
    });    
}

grupoArray: Taldea[] = [];

  getGrupos() {
    this.ikasleService.getGrupos().subscribe((data: any[]) => {
      this.grupoArray = data
        .filter((grupo: any) => grupo.ezabatzeData === null)
        .map((grupo: any) => ({
          ...grupo,
          langileak: grupo.langileak.filter((ikaslea: any) => !ikaslea.ezabatzeData) // 🔥 Filtrar alumnos eliminados
        }));
  
      this.filteredGroups = [...this.grupoArray]; 
    });
  }
  

  openEditModal(ikaslea: any) {
    this.selectedAlumno = ikaslea;
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
  }

  filterAlumnos() {
    const query = this.searchQuery.trim().toLowerCase();
    if(this.searchQuery !== ''){
      this.filteredAlumnos = query
      ? this.filteredAlumnos.filter((ikaslea) =>
          `${ikaslea.izena} ${ikaslea.abizenak} ${ikaslea.taldeKodea} ${ikaslea.taldeIzena}`
            .toLowerCase()
            .includes(query)
        )
      : [...this.filteredAlumnos];
    }else{
      this.getAlumnos();
    }
    
  }

  

  eliminarAlumnos() {
    this.selectedIkasleak.forEach((id) => {
      this.ikasleService.eliminarAlumno(id).subscribe(() => {
        // Eliminar el alumno de la lista
        this.getAlumnos();
        this.getGrupos();
        this.closeModal();
        this.mostrarToast(this.translate.instant('ikaslePage.EliminarAlumnos'), 'danger');
      });
    });
    this.selectedIkasleak.clear(); // Limpiar la selección después de eliminar
  }

  // Abre el modal para editar un talde
  openEditTaldeModal(talde: any) {
    this.selectedTalde = talde; // Clonar el objeto seleccionado
    this.isEditTaldeModalOpen = true;
  }

  // Cierra el modal de edición
  closeEditTaldeModal() {
    this.isEditTaldeModalOpen = false;
  }

 

  
  eliminarGrupo(grupoKodea: string) {
    // Llamamos al servicio que gestiona la eliminación de grupos
    this.ikasleService.eliminarGrupo(grupoKodea).subscribe(
      (response) => {
        this.getGrupos();
        this.getAlumnos();
        this.getHorarios();
      },
      (error) => {
        console.error(error);
      }
    );
  }

  onAlumnoSelected(alumnoId: number | undefined) {
    if (alumnoId !== undefined) {
      if (this.selectedIkasleak.has(alumnoId)) {
        this.selectedIkasleak.delete(alumnoId);
      } else {
        this.selectedIkasleak.add(alumnoId);
      }
    }
  }
  

  // Función para formatear la fecha a 'yyyy-MM-dd'
  formatDate(date: string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Mostrar alerta en caso de éxito o error
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  // Función para cerrar el modal
  closeModal() {
    this.modalController.dismiss();
  }

  openModal(horario: any, modal: IonModal) {
    // Asignar los valores del horario seleccionado al formulario
    this.selectedHorario = horario;
    this.idHorario = horario.id;
    this.grupoSeleccionado = horario.taldea;
    this.diaSeleccionado = horario.eguna;
    this.fechaInicio = horario.hasieraData;
    this.fechaFin = horario.amaieraData;
    this.horaInicio = horario.hasieraOrdua;
    this.horaFin = horario.amaieraOrdua;
    // Abrir el modal manualmente
    modal.present();
  }

  horarioSeleccionado: any; // Asegúrate de tener un horario seleccionado
  // Otras propiedades del componente
  seleccionarHorario(horario: any) {
    this.horarioSeleccionado = horario;
    // Aquí puedes agregar lógica adicional si es necesario
  }

  async mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
    });
    toast.present();
  }
  
  deleteHorario(horario: any): void {
    // Crear la alerta de confirmación
    this.alertController
      .create({
        header: this.translate.instant('ikaslePage.ConfirmarEliminacion'),
        message: this.translate.instant('ikaslePage.MensajeEliminarHorario') + horario.taldea.kodea + "?",
        buttons: [
          {
            text: this.translate.instant('ikaslePage.Cancelar'),
            role: 'cancel',
          },
          {
            text: this.translate.instant('ikaslePage.Aceptar'),
            handler: () => {
              this.ikasleService
                .eliminarHorario(horario.id)
                .subscribe((response) => {
                  this.getHorarios();
                  this.mostrarToast(this.translate.instant('ikaslePage.HorarioEliminado'), 'danger');
                });
            },
          },
        ],
      })
      .then((alert) => alert.present());
  }
  
  async confirmarEliminacionAlumno(alumnoId: number) {
    const alert = await this.alertController.create({
      header: this.translate.instant('ikaslePage.ConfirmarEliminacion'),
      message: this.translate.instant('ikaslePage.MensajeEliminarAlumno'),
      buttons: [
        {
          text: this.translate.instant('ikaslePage.Cancelar'),
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: this.translate.instant('ikaslePage.Aceptar'),
          handler: async () => {
            this.mostrarToast(this.translate.instant('ikaslePage.AlumnoEliminado'), 'danger');
            await this.ikasleService.eliminarAlumno(alumnoId);
          },
        },
      ],
    });
  
    await alert.present();
  }
  
  async confirmarEliminacionGrupo(grupoKodea: string) {
    const alert = await this.alertController.create({
      header: this.translate.instant('ikaslePage.ConfirmarEliminacion'),
      message: this.translate.instant('ikaslePage.MensajeEliminarGrupo'),
      buttons: [
        {
          text: this.translate.instant('ikaslePage.Cancelar'),
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: this.translate.instant('ikaslePage.Aceptar'),
          handler: async () => {
            await this.eliminarGrupo(grupoKodea);
            this.mostrarToast(this.translate.instant('ikaslePage.GrupoEliminado'), 'danger');
          },
        },
      ],
    });
  
    await alert.present();
  }
  
  async agregarAlumno() {
    let data = {
      izena: this.nuevoAlumno.izena,
      abizenak: this.nuevoAlumno.abizenak,
      taldea: {
        kodea: this.nuevoAlumno.taldea.kodea,
      },
    };
  
    this.ikasleService.agregarAlumno(data).subscribe(() => {
      this.getAlumnos();
      this.getGrupos();
      this.modalController.dismiss();
      this.mostrarToast(this.translate.instant('ikaslePage.AlumnoAgregado'), 'success');
    });
  
    this.nuevoAlumno = {
      izena: '',
      abizenak: '',
      taldea: { kodea: '', izena: '' },
    };
  }
  
  async agregarGrupo() {
    let data = {
      kodea: this.nuevoGrupo.kodea,
      izena: this.nuevoGrupo.izena,
    };
  
    this.ikasleService.agregarGrupo(data).subscribe(() => {
      this.getGrupos();
      this.getAlumnos();
      this.modalController.dismiss();
      this.mostrarToast(this.translate.instant('ikaslePage.GrupoAgregado'), 'success');
    });
  
    this.nuevoGrupo = { kodea: '', izena: '' };
  }
  
  updateAlumno() {
    const updatedAlumno = {
      id: this.selectedAlumno.id,
      izena: this.selectedAlumno.izena,
      abizenak: this.selectedAlumno.abizenak,
      taldea: { 
        kodea: this.selectedAlumno.taldeKodea
      },
    };
  
    this.ikasleService.updateAlumno(updatedAlumno).subscribe(() => {
      this.getGrupos();
      this.getAlumnos();
      this.closeEditModal();
      this.mostrarToast(this.translate.instant('ikaslePage.AlumnoActualizado'), 'success');
    });
  }
  
  updateTalde() {
    const updatedTalde = {
      kodea: this.selectedTalde.kodea,
      izena: this.selectedTalde.izena,
    };
  
    this.ikasleService.updateGrupo(updatedTalde).subscribe(() => {
      this.getAlumnos();
      this.getGrupos();
      this.closeEditTaldeModal();
      this.mostrarToast(this.translate.instant('ikaslePage.GrupoActualizado'), 'success');
    });
  }
  
  guardarHorario() {
    const formattedFechaInicio = this.formatDate(this.fechaInicio);
    const formattedFechaFin = this.formatDate(this.fechaFin);
    const formattedHoraInicio = this.horaInicio + ':00';
    const formattedHoraFin = this.horaFin + ':00';
  
    this.ordutegia = {
      taldea: {
        kodea: this.grupoSeleccionado.kodea,
      },
      eguna: this.diaSeleccionado,
      hasieraData: formattedFechaInicio,
      amaieraData: formattedFechaFin,
      hasieraOrdua: formattedHoraInicio,
      amaieraOrdua: formattedHoraFin,
    };
  
    this.ikasleService.guardarHorario(this.ordutegia).subscribe(
      (data) => {
        this.getHorarios();
        this.ordutegia = {
          taldea: { kodea: '' },
          eguna: 0,
          hasieraData: '',
          amaieraData: '',
          hasieraOrdua: '',
          amaieraOrdua: '',
        };
        this.grupoSeleccionado.kodea = '';
        this.diaSeleccionado = 0;
        this.fechaInicio = '';
        this.fechaFin = '';
        this.horaInicio = null;
        this.horaFin = null;
  
        if (data && data.id) {
          this.mostrarToast(this.translate.instant('ikaslePage.HorarioGuardado'), 'success');
        } else {
          this.mostrarToast(this.translate.instant('ikaslePage.ErrorGuardarHorario'), 'danger');
        }
      },
      (error) => {
        console.error('Error al guardar el horario:', error);
        this.mostrarToast(this.translate.instant('ikaslePage.ErrorConexion'), 'danger');
      }
    );
  
    this.closeModal();
  }
  
  actualizarHorario() {
    if (this.selectedHorario) {
      const horarioActualizado = {
        ...this.selectedHorario,
        taldea: this.grupoSeleccionado,
        eguna: this.diaSeleccionado,
        hasieraData: this.fechaInicio,
        amaieraData: this.fechaFin,
        hasieraOrdua: this.horaInicio,
        amaieraOrdua: this.horaFin,
        eguneratzeData: new Date().toISOString(),
      };
  
      if (horarioActualizado.id) {
        this.ikasleService.actualizarHorario(horarioActualizado).subscribe(() => {
          this.getHorarios();
          this.selectedHorario = {
            id: 0,
            hasieraData: '',
            hasieraOrdua: '',
            amaieraData: '',
            amaieraOrdua: '',
            eguna: 0,
            taldea: { kodea: '' },
          };
          this.closeModal();
          this.mostrarToast(this.translate.instant('ikaslePage.HorarioGuardado'), 'success');
        });
      } else {
        this.mostrarToast(this.translate.instant('ikaslePage.ErrorActualizarHorario'), 'danger');
      }
    }
  }
  
  
}
