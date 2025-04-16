import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { environment } from 'src/environments/environment';
import { HeaderComponent } from '../components/header/header.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-historiala',
  templateUrl: './historiala.page.html',
  styleUrls: ['./historiala.page.scss'],
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
  crearNombre!:String;
  crearApellido!:String;
  crearTelefono!:String;
  crearPiel!:boolean;
  historialaVisible:any[] = [];

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
  filtroIzena!:string;

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.translate.setDefaultLang('es');
    this.translate.use(this.selectedLanguage);
  
    this.bezeroForm = this.fb.group({
      izena: ['', Validators.required],
      abizena: ['', Validators.required],
      telefonoa: ['', Validators.required],
      azalSentikorra: ['', Validators.required]
    });
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
    this.fechaInicioFilterProd = null;
    this.fechaFinFilterProd = null;
    this.produktuMugimenduFiltered = this.produktuMugimendu.map(prod => ({
      ...prod,
    }));  
  }

  resetMateriales() {
    this.fechaInicioFilterMat = null;
    this.fechaFinFilterMat = null;
    this.materialMugimenduFiltered = this.materialMugimendu.map(mat => ({
      ...mat,
    }));  
  }

  resetTickets() {
    this.fechaInicioFilterTicket = null;
    this.fechaFinFilterTicket = null;
    this.ticketsFiltered = this.tickets.map(ticket => ({
      ...ticket,
    }));  
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

  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      // Any calls to load data go here
      (event.target as HTMLIonRefresherElement).complete();
    }, 2000);
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
      },
      (error) => {
        console.error("Error al cargar clientes:", error);
      }
    );
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

  cerrarModal() {
    this.isEditingBezero = false; // Cierra el modal
  }

  add_historial(){
    const hist = {
      data:null,
      kantitatea:0,
      bolumena:"",
      oharrak: "",
      produktuIzena:""
    }
    this.editingBezero.historiala.push(hist);
    console.log(this.editingBezero)
  }

  remove_historial(index: number) {
    let historial = this.editingBezero.historiala[index];
    if (historial.id) {
        historial.ezabatzeData = new Date().toISOString(); // Marca como eliminado
    } else {
        this.editingBezero.historiala.splice(index, 1); // Si es nuevo, elimínalo
    }
  }
  
  guardarBezero() {
    console.log(JSON.stringify(this.editingBezero));
    this.http.put(`${environment.url}bezero_fitxak`, this.editingBezero, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      () => {
        this.cargarClientes();
        this.cerrarModal();
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
    console.log(JSON.stringify(json_data));

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

  deleteBezero(id: number) {
    const json_data = {
      "id": id
    };
    console.log(JSON.stringify(json_data));

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

  changeLanguage() {
    this.translate.use(this.selectedLanguage);
    if (this.headerComponent) {
      this.headerComponent.loadTranslations();
    }
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
