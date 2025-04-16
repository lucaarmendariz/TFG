import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, BarController, BarElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import { ModalController } from '@ionic/angular';

// Registrar todos los elementos necesarios para el gráfico
Chart.register(BarController, BarElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

@Component({
  selector: 'app-product-graph',
  templateUrl: './product-graph.component.html',
  styleUrls: ['./product-graph.component.scss'],
})
export class ProductGraphComponent implements AfterViewInit {
  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;

  productos: any[] = [];
  chart: Chart | undefined;

  constructor(private modalCtrl: ModalController) {}

  ngAfterViewInit() {
    // Usamos setTimeout para asegurar que el canvas esté disponible
    setTimeout(() => {
      console.log('Datos de productos en ngAfterViewInit:', this.productos); // Log para verificar los datos
      const ctx = this.canvas.nativeElement.getContext('2d');
      if (ctx) {
        // Crear el gráfico cuando el contexto esté disponible
        this.createChart(ctx);
      } else {
        console.error('No se pudo obtener el contexto del canvas');
      }
    }, 0);
  }

  // Método para crear el gráfico
  createChart(ctx: CanvasRenderingContext2D) {
    // Verificamos si ya existe un gráfico y lo destruimos
    if (this.chart) {
      this.chart.destroy(); // Destruir el gráfico anterior para evitar superposiciones
    }

    // Crear un nuevo gráfico
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.productos.map(producto => producto.nombre),
        datasets: [{
          label: 'Stock de productos',
          data: this.productos.map(producto => producto.stock),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Método para cerrar el modal
  dismissModal() {
    this.modalCtrl.dismiss(); // Esto cierra el modal
  }
}
