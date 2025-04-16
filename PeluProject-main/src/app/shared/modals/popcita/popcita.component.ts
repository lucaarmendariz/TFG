import { Component, EventEmitter, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-popcita',
  templateUrl: './popcita.component.html',
  styleUrls: ['./popcita.component.scss'],
})
export class PopcitaComponent {
  @Output() citaAñadida = new EventEmitter<any>();

  servicios: any[] = []; // Aquí se almacenarán los servicios obtenidos desde la API

  currentDate: string = new Date().toISOString();
  availableHours: string[] = [
    '10:00', '10:30',
    '11:00', '11:30',
    '12:00', '12:30',
    '13:00', '13:30',
    '14:00'
  ];

  // Cita con valores predeterminados para evitar errores en el backend
  cita = {
    izena: '',
    telefonoa: '',
    etxekoa: 'E', // Valor por defecto
    data: '',
    hasieraOrdua: '',
    amaieraOrdua: null, // Permitimos null como valor predeterminado
    deskribapena: '',
    eserlekua: 0, // Valor por defecto
    prezioTotala: 0.0, // Valor por defecto
    sortzeData: new Date().toISOString(),
    hasieraOrduaErreala: null,
    amaieraOrduaErreala: null
  };

  constructor(private modalCtrl: ModalController ,private http: HttpClient) {}

  ngOnInit() {
    this.loadServicios(); // Cargar servicios al iniciar
  }
  cambiarFecha(event: any) {
    this.cita.data = event.detail.value.split('T')[0]; // Formato YYYY-MM-DD
  }

  cambioHoraInicio(event: any) {
    this.cita.hasieraOrdua = event.detail.value;
  }

  cambioHoraFinal(event: any) {
    this.cita.amaieraOrdua = event.detail.value || null;
  }

  toggleEtxekoa(isChecked: boolean) {
    this.cita.etxekoa = isChecked ? 'E' : 'K';
  }

  // Cargar los servicios desde la API
  loadServicios() {
    this.http.get<any[]>('http://localhost:8080/zerbitzuak').subscribe({
      next: (data) => {
        console.log("✅ Servicios cargados desde la API:", data);
        this.servicios = data.map(s => s.izena); // Asumimos que `izena` es el nombre del servicio
      },
      error: (err) => {
        console.error("❌ Error al cargar servicios:", err);
      }
    });
  }

  toggleService(service: string, isChecked: boolean) {
    if (isChecked) {
      if (!this.cita.deskribapena.includes(service)) {
        this.cita.deskribapena = this.cita.deskribapena
          ? `${this.cita.deskribapena}, ${service}`
          : service;
      }
    } else {
      const servicios = this.cita.deskribapena.split(', ').filter(s => s !== service);
      this.cita.deskribapena = servicios.join(', ');
    }
  }


  anadirCita() {
    if (!this.cita.izena || !this.cita.telefonoa || !this.cita.data || !this.cita.hasieraOrdua) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
  
    // Validación del teléfono (número de 9 dígitos)
    if (this.cita.telefonoa.length !== 9 || isNaN(Number(this.cita.telefonoa))) {
      alert('Ingrese un número de teléfono válido de 9 dígitos.');
      return;
    }
  
    // Formateamos los datos para asegurarnos de que no haya valores nulos inesperados
    const citaFormateada = {
      izena: this.cita.izena.trim(),
      telefonoa: this.cita.telefonoa.trim(),
      etxekoa: this.cita.etxekoa || 'E',
      data: this.cita.data,
      hasieraOrdua: this.cita.hasieraOrdua,
      amaieraOrdua: this.cita.amaieraOrdua || null,
      deskribapena: this.cita.deskribapena ? this.cita.deskribapena.trim() : '',
      eserlekua: this.cita.eserlekua || 0,
      prezioTotala: this.cita.prezioTotala || 0.0,
      sortzeData: new Date().toISOString(),
      hasieraOrduaErreala: null,
      amaieraOrduaErreala: null
    };
  
    console.log('📤 Enviando cita al backend:', citaFormateada);
  
    // Enviar la cita al backend
    this.http.post('http://localhost:8080/api/hitzorduak', citaFormateada).subscribe({
      next: (response) => {
        console.log('✅ Cita creada correctamente:', response);
        alert('Cita añadida correctamente.');
        this.citaAñadida.emit(response); // Emitimos la cita para actualizar la agenda
        this.modalCtrl.dismiss(response); // Cerramos el modal y enviamos la cita
      },
      error: (error) => {
        console.error('❌ Error al añadir la cita:', error);
        alert('Hubo un problema al guardar la cita.');
      }
    });
  }
  

  cerrarModal() {
    this.modalCtrl.dismiss(); // Cerrar el modal sin enviar datos
  }

  resetForm() {
    this.cita = {
      izena: '',
      telefonoa: '',
      etxekoa: 'E',
      data: '',
      hasieraOrdua: '',
      amaieraOrdua: null,
      deskribapena: '',
      eserlekua: 0,
      prezioTotala: 0.0,
      sortzeData: new Date().toISOString(),
      hasieraOrduaErreala: null,
      amaieraOrduaErreala: null
    };
  }
}
