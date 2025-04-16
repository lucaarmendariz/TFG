import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.page.html',
  styleUrls: ['./tickets.page.scss'],
})
export class TicketsPage implements OnInit {
  cliente: string = '';
  alumno: string = '';
  servicios: string = '';
  precioFinal: number | null = null;

  constructor(private router: Router) {
    // Detectar cambios de navegación y actualizar datos
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.cargarDatos();
      }
    });
  }

  ngOnInit() {
    this.cargarDatos(); // Carga inicial de datos
  }

  cargarDatos() {
    const ticketData = sessionStorage.getItem('ticketData');
    if (ticketData) {
      const data = JSON.parse(ticketData);
      this.cliente = data.cliente;
      this.alumno = data.alumno;
      this.servicios = data.servicios;
      this.precioFinal = data.precioFinal;
    }
  }

  generarPDF() {
    if (!this.cliente || !this.alumno || !this.servicios || this.precioFinal === null) {
      alert('❌ Por favor, llena todos los campos antes de generar el ticket.');
      return;
    }

    const doc = new jsPDF();
    const img = new Image();
    img.src = 'assets/fotos/IMP_Logotipoa.png';
    img.onload = () => {
      doc.addImage(img, 'PNG', 70, 10, 60, 20);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('TICKET DE SERVICIO', 60, 40);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.line(20, 45, 190, 45);
      doc.text(`Cliente: ${this.cliente}`, 20, 55);
      doc.text(`Alumno: ${this.alumno}`, 20, 65);
      doc.text('Servicios:', 20, 75);
      let serviciosArray = doc.splitTextToSize(this.servicios, 160);
      doc.text(serviciosArray, 20, 85);
      doc.text(`Precio Final: ${this.precioFinal}€`, 20, 110);
      doc.line(20, 120, 190, 120);
      doc.text('Gracias por su compra.', 70, 130);
      doc.save(`ticket_${this.cliente}.pdf`);
    };
  }
}
