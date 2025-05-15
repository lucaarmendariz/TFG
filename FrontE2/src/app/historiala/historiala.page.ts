import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { environment } from 'src/environments/environment';
import { HeaderComponent } from '../components/header/header.component';
import { HttpClient } from '@angular/common/http';
import { GaleriaComponent } from '../components/galeria/galeria.component';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
import { Observable } from 'rxjs';
import { LanguageService } from '../zerbitzuak/language.service';
register();


interface KoloreHistoriala {
  id: number;
  id_produktua: number;
  data: string;
  kantitatea: number;
  bolumena: string;
  oharrak: string;
  img_url: string;
}

@Component({
  selector: 'app-historiala',
  templateUrl: './historiala.page.html',
  styleUrls: ['./historiala.page.scss'],
  standalone: false
})

export class HistorialaPage implements OnInit {
  @ViewChild(HeaderComponent) headerComponent!: HeaderComponent;
  selectedLanguage: string = 'es';
  produktuMugimendu: any[] = [];
  produktuMugimenduFiltered: any[] = [];
  materialMugimendu: any[] = [];
  materialMugimenduFiltered: any[] = [];
  tickets: any[] = [];
  ticketsFiltered: any[] = [];
  bezeroak: any[] = [];
  bezeroakFiltered: any[] = [];
  produktuak: any[] = [];
  crearNombre!: String;
  crearApellido!: String;
  crearTelefono!: String;
  crearPiel!: boolean;
  historialaVisible: any[] = [];

  isEditingBezero: boolean = false; // Controla si se muestra el modal de edición
  editingBezero: any = null;        // Objeto del cliente que se está editando
  viewingBezero: any = null;        // Cliente cuyos detalles se están viendo
  isViewingHistorial: boolean = false; // Controla si se muestra el historial
  bezeroForm: FormGroup;
  fechaInicioFilterProd: any = null;
  fechaFinFilterProd: any = null;
  fechaInicioFilterMat: any = null;
  fechaFinFilterMat: any = null;
  fechaInicioFilterTicket: any = null;
  fechaFinFilterTicket: any = null;
  filtroIzena!: string;

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private http: HttpClient,
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController,
    private languageService: LanguageService
  ) {
    
    this.selectedLanguage = this.languageService.getCurrentLanguage();

    this.bezeroForm = this.fb.group({
      izena: ['', Validators.required],
      abizena: ['', Validators.required],
      telefonoa: ['', Validators.required],
      azalSentikorra: ['', Validators.required]
    });
  }

  async abrirGaleria() {
    const imagenes = this.editingBezero.historiala
      .filter((h: any) => h.img_url && h.img_url.trim() !== '')
      .map((h: any) => h.img_url);

    if (imagenes.length === 0) {
      // Puedes mostrar un toast si no hay imágenes
      this.translate.get('productos.toast.img').subscribe((texto) => {
        this.mostrarToast(texto, 2000, 'warning');
      });
      return;
    }

    this.modalController.create({
      component: GaleriaComponent,
      componentProps: { imagenes },
      cssClass: 'galeria-modal' // importante
    }).then((modal: any) => modal.present());
  }

  async mostrarToast(mensaje: string, duracion: number = 2000, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color
    });
    toast.present();
  }

  filterProduktos() {
    this.produktuMugimenduFiltered = this.produktuMugimendu.map(prod => ({
      ...prod,
      // cualquier otra transformación que necesites
    }));

    this.produktuMugimenduFiltered = this.produktuMugimenduFiltered.filter(prod => {
      const horarioFecha = this.convertToDate(prod.data); // Convertir a objeto Date
      const inicio = this.fechaInicioFilterProd ? this.convertToDate(this.fechaInicioFilterProd) : null;
      const fin = this.fechaFinFilterProd ? this.convertToDate(this.fechaFinFilterProd) : null;

      return (
        (!inicio || horarioFecha >= inicio) &&
        (!fin || horarioFecha <= fin)
      );
    });
  }

  filterMateriales() {
    this.materialMugimenduFiltered = this.materialMugimendu.map(mat => ({
      ...mat,
    }));

    this.materialMugimenduFiltered = this.materialMugimenduFiltered.filter(mat => {
      const horarioFecha = this.convertToDate(mat.hasieraData); // Convertir a objeto Date
      const inicio = this.fechaInicioFilterMat ? this.convertToDate(this.fechaInicioFilterMat) : null;
      const fin = this.fechaFinFilterMat ? this.convertToDate(this.fechaFinFilterMat) : null;

      return (
        (!inicio || horarioFecha >= inicio) &&
        (!fin || horarioFecha <= fin)
      );
    });
  }

  filterTickets() {
    this.ticketsFiltered = this.tickets.map(ticket => ({
      ...ticket,
    }));

    this.ticketsFiltered = this.ticketsFiltered.filter(ticket => {
      const horarioFecha = this.convertToDate(ticket.data); // Convertir a objeto Date
      const inicio = this.fechaInicioFilterTicket ? this.convertToDate(this.fechaInicioFilterTicket) : null;
      const fin = this.fechaFinFilterTicket ? this.convertToDate(this.fechaFinFilterTicket) : null;

      return (
        (!inicio || horarioFecha >= inicio) &&
        (!fin || horarioFecha <= fin)
      );
    });
  }

// Transformar URL de Drive a miniatura
transformarURL(url: string): string {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? `https://drive.google.com/thumbnail?id=${match[1]}` : url;
}

  filterBezero() {
    this.bezeroakFiltered = this.bezeroak.map(bezero => ({
      ...bezero,
    }));

    if (this.filtroIzena !== '') {
      this.bezeroakFiltered = this.bezeroakFiltered.filter(bezero =>
      (this.filtroIzena === '' ||
        bezero.izena.toLowerCase().includes(this.filtroIzena.toLowerCase()) ||
        bezero.abizena.toLowerCase().includes(this.filtroIzena.toLowerCase()))
      );
    }
  }


  // Función para convertir la fecha a un objeto Date sin hora
  convertToDate(date: any): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0); // Asegúrate de que las horas, minutos, segundos y milisegundos sean 0
    return d;
  }

  resetProduktos() {
  const hoy = new Date().toISOString().split('T')[0];
  this.fechaInicioFilterProd = hoy;
  this.fechaFinFilterProd = hoy;
  this.busquedaTexto = '';
  this.cargarMovimientoProductos();
}


resetMateriales() {
  const hoy = new Date().toISOString().split('T')[0];
  this.fechaInicioFilterMat = hoy;
  this.fechaFinFilterMat = hoy;
  this.busquedaMaterial = '';
  this.cargarMovimientoMateriales();
}


resetTickets() {
  const hoy = new Date().toISOString().split('T')[0];
  this.fechaInicioFilterTicket = hoy;
  this.fechaFinFilterTicket = hoy;
  this.busquedaTicket = '';
  this.cargarTickets();
}


  // Función: cargarHitzordu
  cargarMovimientoProductos() {
    this.produktuMugimendu = [];
    this.http.get(`${environment.url}produktu_mugimenduak/${this.fechaInicioFilterProd}/${this.fechaFinFilterProd}`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      (datuak: any) => {
        // Filtramos los productos activos (sin `ezabatzeData`)
        this.produktuMugimendu = datuak.filter((prod: any) => prod.ezabatzeData === null);
        this.produktuMugimenduFiltered = this.produktuMugimendu;
      },
      (error) => {
        console.error("Error al cargar productos:", error);
      }
    );
  }

busquedaTexto: string = '';

  filtrarProductos() {
  const texto = this.busquedaTexto.toLowerCase().trim();

  this.produktuMugimenduFiltered = this.produktuMugimendu.filter(prod => {
    const nombreAlumno = `${prod.langile.izena} ${prod.langile.abizenak}`.toLowerCase();
    const grupoCodigo = prod.langile.taldeKodea.toLowerCase();
    const nombreProducto = prod.produktu.izena.toLowerCase();

    return (
      nombreAlumno.includes(texto) ||
      grupoCodigo.includes(texto) ||
      nombreProducto.includes(texto)
    );
  });
}


  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      // Any calls to load data go here
      (event.target as HTMLIonRefresherElement).complete();
    }, 2000);
  }

  busquedaMaterial: string = '';

  filtrarMateriales() {
  const texto = this.busquedaMaterial.toLowerCase().trim();

  this.materialMugimenduFiltered = this.materialMugimendu.filter(mov => {
    const nombreTrabajador = `${mov.langilea.izena} ${mov.langilea.abizenak}`.toLowerCase();
    const grupoCodigo = mov.langilea.taldeKodea.toLowerCase();
    const nombreMaterial = mov.materiala.izena.toLowerCase();

    return (
      nombreTrabajador.includes(texto) ||
      grupoCodigo.includes(texto) ||
      nombreMaterial.includes(texto)
    );
  });
}


  cargarMovimientoMateriales() {
    this.materialMugimendu = [];
    this.http.get(`${environment.url}material_mailegua/${this.fechaInicioFilterMat}/${this.fechaFinFilterMat}`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      (datuak: any) => {
        // Filtramos los materiales activos (sin `ezabatzeData`)
        this.materialMugimendu = datuak.filter((mat: any) => mat.ezabatzeData === null);
        this.materialMugimenduFiltered = this.materialMugimendu;
      },
      (error) => {
        console.error("Error al cargar materiales:", error);
      }
    );
  }
  busquedaTicket: string = '';

filtrarTickets() {
  const texto = this.busquedaTicket.toLowerCase().trim();

  this.ticketsFiltered = this.tickets.filter(ticket => {
    const nombre = ticket.izena?.toLowerCase() || '';
    const id = ticket.id?.toString() || '';
    const precio = ticket.prezioTotala?.toString() || '';

    return (
      nombre.includes(texto) ||
      id.includes(texto) ||
      precio.includes(texto)
    );
  });
}

  cargarTickets() {
    this.tickets = [];
    this.http.get(`${environment.url}hitzorduak/ticket/${this.fechaInicioFilterTicket}/${this.fechaFinFilterTicket}`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      (datuak: any) => {
        // Filtramos los tickets activos (sin `ezabatzeData`)
        this.tickets = datuak.filter((citas: any) => citas.ezabatzeData === null);
        this.ticketsFiltered = this.tickets;

      },
      (error) => {
        console.error("Error al cargar tickets:", error);
      }
    );
  }

  cargarCita(id: number) {
    this.http.get(`${environment.url}hitzorduak/id/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      (datuak: any) => {
        this.descargar_ticket(datuak);
      },
      (error) => {
        console.error("Error al cargar cita:", error);
      }
    );
  }

  descargar_ticket(datuak: any) {
    const pdf = new jsPDF();
    const margenIzquierdo = 10;
    let posicionY = 20;
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("Ticket de Cita", margenIzquierdo, posicionY);
    posicionY += 10;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Data: ${datuak.data}`, margenIzquierdo, posicionY);
    posicionY += 7;
    pdf.text(`Hasiera Ordua: ${datuak.hasieraOrduaErreala}`, margenIzquierdo, posicionY);
    posicionY += 7;
    pdf.text(`Amaiera Ordua: ${datuak.amaieraOrduaErreala}`, margenIzquierdo, posicionY);
    posicionY += 7;
    pdf.text(`Langilea: ${datuak.langilea?.izena}`, margenIzquierdo, posicionY);
    posicionY += 10;
    const head = [
      ['Zerbitzua', 'Prezioa (€)']
    ];
    const body = datuak.lerroak.map((lerro: any) => [
      lerro.zerbitzuak.izena,
      lerro.prezioa.toFixed(2)
    ]);
    autoTable(pdf, {
      startY: posicionY,
      margin: { left: margenIzquierdo, right: margenIzquierdo },
      head: head,
      body: body,
      theme: 'grid',
      styles: { fontSize: 10, halign: 'center' },
      headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255] }
    });
    posicionY = (pdf as any).lastAutoTable.finalY + 10;
    pdf.setFont("helvetica", "bold");
    pdf.text(
      `PREZIO TOTALA: ${datuak.prezioTotala.toFixed(2)} €`,
      margenIzquierdo,
      posicionY
    );
    pdf.save(`ticket_${datuak.id}.pdf`);
  }

  bezeroId: number = 1; // Este ID puede venir dinámicamente
  historial: KoloreHistoriala[] = [];

 // Obtener historial por ID de cliente
  getHistorialPorCliente(id: number): Observable<KoloreHistoriala[]> {
    return this.http.get<KoloreHistoriala[]>(`${this.apiUrl}/cliente/${id}`);
  }

  loadHistorial() {
    this.getHistorialPorCliente(this.bezeroId).subscribe((data) => {
      this.historial = data;
      console.log('Historial del cliente:', this.historial);
    });
  }

  cargarClientes() {
    this.bezeroak = [];
    this.http.get(`${environment.url}bezero_fitxak`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      (datuak: any) => {
        // Filtramos los clientes activos (sin `ezabatzeData`)
        this.bezeroak = datuak.filter((bezero: any) => bezero.ezabatzeData === null);
        this.bezeroakFiltered = this.bezeroak;
        this.loadBezeroak(); // Método para cargar los clientes filtrados (esto depende de tu lógica)

        this.bezeroakFiltered.forEach(bezero => {
    });
      },
      (error) => {
        console.error("Error al cargar clientes:", error);
      }
    );
  }

  loadBezeroak() {
    // Aquí debes cargar tus clientes filtrados de alguna manera.
    // Suponiendo que ya tienes el array `bezeroakFiltered` con los clientes filtrados.

    this.bezeroakFiltered.forEach((bezero) => {
      this.loadHistorialPorCliente(bezero.id);
    });
  }
  
  historialPorCliente: { [id: number]: KoloreHistoriala[] } = {}; // Un objeto para almacenar los historiales por cliente

  loadHistorialPorCliente(id: number) {
    this.getHistorialPorCliente(id).subscribe((data) => {
      this.historialPorCliente[id] = data; // Guardamos el historial del cliente por su ID
    });
  }

  cargarProductos() {
    this.produktuak = [];
    this.http.get(`${environment.url}produktuak`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      (datuak: any) => {
        // Filtramos los productos activos (sin `ezabatzeData`)
        this.produktuak = datuak.filter((prod: any) => prod.ezabatzeData === null);
      },
      (error) => {
        console.error("Error al cargar productos:", error);
      }
    );
  }

  openBezero(bezero: any) {
    this.isEditingBezero = true;
    this.editingBezero = bezero;
    console.log(this.editingBezero)
  }

  isEditingBezeroHistoriala = false;

  openBezeroHistoriala(bezero: any) {
    this.isEditingBezeroHistoriala = true;
    this.editingBezero = bezero;
    console.log(this.editingBezero.historiala)
  }

  cerrarModalHistoriala() {
    this.isEditingBezeroHistoriala = false;
  }

  cerrarModal() {
    this.isEditingBezero = false;
  }

  add_historial() {
    const hist = {
      data: null,
      kantitatea: 0,
      bolumena: "",
      oharrak: "",
      produktuIzena: "",
      img_url: ""
    }
    this.editingBezero.historiala.push(hist);
  }

  editar_historial(historial: any) {
    if (!historial.id) {
      console.warn('Historial sin ID, no se puede editar');
      return;
    }
    console.log(historial)

    historial.eguneratzeData = new Date(); // O puedes dejar que el backend lo genere

    this.http.put(`${environment.url}kolore_historiala/${historial.id}`, historial, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (res) => {
        console.log('Historial editado con éxito', res);
      },
      error: (err) => {
        console.error('Error al editar historial:', err);
      }
    });

  }
  private apiUrl = `${environment.url}kolore_historiala`; // URL base para los historiales

  // Actualizar historial de colores (PUT)
  update(id: number, historial: any) {
    return this.http.put(`${this.apiUrl}/${id}`, historial, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Eliminar historial de colores (DELETE)
  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  async eliminar_historial(historial: any) {
    // Si ya tiene ID, confirmamos la eliminación
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este historial?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.delete(historial.id).subscribe({
              next: () => {
                console.log('Historial eliminado:', historial.id);
                // Filtrar el historial eliminando el objeto con ese id
                this.editingBezero.historiala = this.editingBezero.historiala.filter(
                  (h: { id: number }) => h.id !== historial.id
                );
              },
              error: (err) => {
                console.error('Error al eliminar historial:', err);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }


  guardarBezero() {
    console.log(this.editingBezero.id);
    const json_data = {
      "id": this.editingBezero.id,  // Ensure the ID is included
      "izena": this.editingBezero.izena,
      "abizena": this.editingBezero.abizena,
      "telefonoa": this.editingBezero.telefonoa,
      "azalSentikorra": this.editingBezero.azalSentikorra ? "B" : "E",
    };

    this.http.put(`${environment.url}bezero_fitxak/update`, json_data, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      () => {
        this.cargarClientes();
        this.cerrarModal();
        this.cerrarModalHistoriala();
      },
      (error) => {
        console.error("Error al asignar la cita:", error);
      }
    );
  }

compareWithFn = (o1: any, o2: any) => o1 == o2;

guardarBezeroHistoriala(){
  console.log(this.editingBezero)
  this.http.put(`${environment.url}bezero_fitxak`, this.editingBezero, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      () => {
        this.cargarClientes();
        this.cerrarModal();
        this.cerrarModalHistoriala();
      },
      (error) => {
        console.error("Error al asignar la cita:", error);
      }
    );
}


  crearBezero() {
    const json_data = {
      "izena": this.crearNombre,
      "abizena": this.crearApellido,
      "telefonoa": this.crearTelefono,
      "azalSentikorra": this.crearPiel ? "B" : "E",
    };

    this.http.post(`${environment.url}bezero_fitxak`, json_data, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      () => {
        this.cargarClientes();
        // Puedes limpiar los campos o mostrar un mensaje de éxito aquí si lo deseas
        // this.limpiarCampos();
      },
      (error) => {
        console.error("Error al asignar la cita:", error);
      }
    );
  }

  async deleteBezero(id: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este cliente?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Eliminar',
          handler: () => {
            const json_data = { id };
            this.http.delete(`${environment.url}bezero_fitxak`, {
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
              body: json_data
            }).subscribe(
              () => {
                this.cargarClientes();
              },
              (error) => {
                console.error("Error al eliminar el cliente:", error);
              }
            );
          }
        }
      ]
    });
    await alert.present();
  }

  changeLanguage() {
  this.languageService.setLanguage(this.selectedLanguage);
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
    this.fechaInicioFilterMat = this.lortuData();
    this.fechaInicioFilterProd = this.lortuData();
    this.fechaInicioFilterTicket = this.lortuData();
    this.fechaFinFilterMat = this.lortuData();
    this.fechaFinFilterProd = this.lortuData();
    this.fechaFinFilterTicket = this.lortuData();
    this.cargarMovimientoProductos();
    this.cargarMovimientoMateriales();
    this.cargarTickets();
    this.cargarClientes();
    this.cargarProductos();

  }

}
