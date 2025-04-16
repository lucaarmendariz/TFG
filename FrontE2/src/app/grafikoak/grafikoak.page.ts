import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { HeaderComponent } from '../components/header/header.component';
import { HttpClient } from '@angular/common/http';
import { LoginServiceService } from '../zerbitzuak/login-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';

declare var Chart: any; 
declare var html2canvas: any; // Declaramos que `html2canvas` existe globalmente

@Component({
  selector: 'app-grafikoak',
  templateUrl: './grafikoak.page.html',
  styleUrls: ['./grafikoak.page.scss'],
})
export class GrafikoakPage implements OnInit {
  @ViewChild(HeaderComponent) headerComponent!: HeaderComponent;
  langileak:any[] = [];
  chart: any;
  categoriasAbiertas: { [key: string]: boolean } = {};
  langileService:any[]=[];
  isGraphOpen:boolean = false;
  selectedLanguage: string = 'es';
  isIkasle!:boolean;
  langileSelec!:any;
  private routeSubscription: any;

  ngOnDestroy() {
    // Limpiar la suscripción cuando el componente se destruya
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  constructor(private translate: TranslateService, private http: HttpClient, private loginService: LoginServiceService, private router: Router, private route: ActivatedRoute) {
    this.translate.setDefaultLang('es');
    this.translate.use(this.selectedLanguage);
  }

  descargarGrafico() {
    const canvasElement = document.getElementById('myChart') as HTMLCanvasElement;
  
    if (!canvasElement) {
      console.error('No se encontró el canvas para generar la imagen');
      return;
    }
  
    // Convertir el canvas a una imagen en formato PNG
    const imgData = canvasElement.toDataURL('image/png');
  
    // Crear un documento PDF con jsPDF
    const pdf = new jsPDF();
  
    // Obtener el trabajador seleccionado
    const trabajador = this.langileSelec;
    const trabajadorNombre = trabajador ? trabajador.izena : "Desconocido";
    const trabajadorApellido = trabajador ? trabajador.abizenak : "";
    const grupoCodigo = trabajador ? trabajador.taldeKodea : "Sin código";
  
    // Añadir logo en la parte superior (ajusta la URL o base64 según tu logo)
    const logoUrl = 'assets/IMP_Logotipoa.png'; // Ruta del logo en tu proyecto
    pdf.addImage(logoUrl, 'PNG', 10, 5, 40, 25);
  
    // Agregar información del trabajador al PDF
    pdf.setFontSize(16);
    pdf.text(`Análisis de Servicios`, 60, 20);
    
    pdf.setFontSize(12);
    pdf.text(`Nombre: ${trabajadorNombre} ${trabajadorApellido}`, 10, 40);
    pdf.text(`Grupo: ${grupoCodigo}`, 10, 50);
  
    // Insertar la imagen del gráfico en el PDF
    pdf.addImage(imgData, 'PNG', 15, 60, 180, 100);
  
    // Descargar el archivo con el nombre del trabajador
    pdf.save(`grafico_${trabajadorNombre}.pdf`);
  }
  
  

  openGraphModal(langile: any) {
    this.isGraphOpen = true;
    this.langileSelec = langile;
    setTimeout(() => {
      this.mostrarDatos(langile.id); // Esperamos un poco antes de crear el gráfico
    }, 300); 
  }
  
  
  closeGraphModal(){
    this.isGraphOpen = false;
  }

  changeLanguage() {
    this.translate.use(this.selectedLanguage);
    if (this.headerComponent) {
      this.headerComponent.loadTranslations();
    }
  }

  ngOnInit() {
    // Suscribirse a los cambios de ruta
    this.routeSubscription = this.route.params.subscribe((params) => {
      console.log('Ruta cambiada:', params); // Aquí puedes ver los cambios de parámetros

      // Comprobar si el usuario es 'Ikasle' cada vez que se carga la página
      this.isIkasle = this.loginService.isAlumno();
      
      // Si es Ikasle, redirigir a '/home'
      if (this.isIkasle) {
        this.router.navigate(['/home']);
      }

      // Llamar a las funciones necesarias
      this.langileakLortu();
      this.langile_serviceLortu();
    });
  }

  toggleCategoria(categoria: string) {
    this.categoriasAbiertas[categoria] = !this.categoriasAbiertas[categoria];
  }

  isCategoriaAbierta(categoria: string): boolean {
    return this.categoriasAbiertas[categoria] || false;
  }

  mostrarDatos(trabajadorId: string) {
    setTimeout(() => {
      const ctx = document.getElementById('myChart') as HTMLCanvasElement;
      if (!ctx) {
        console.error('No se encontró el canvas');
        return;
      }
  
      if (this.chart) {
        this.chart.destroy(); // Destruir gráfico anterior si existe
      }
  
      const trabajador = this.langileService.find(t => t.id == trabajadorId);
      let servicios = { corte: 0, tinte: 0 };
      let trabajadorNombre = trabajador ? trabajador.nombre : "Desconocido";
  
      if (trabajador) {
        servicios = trabajador.servicios;
      }
  
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(servicios),
          datasets: [{
            label: `${trabajadorNombre} - Servicios`,
            data: Object.values(servicios),
            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }, 500);
  }
  
  
  

  langile_serviceLortu() {
    this.http.get(`${environment.url}hitzorduak/langileZerbitzuak`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      (datuak: any) => {
        // Transformamos los datos de la API en un formato más usable
        this.langileService = Object.entries(datuak).map(([key, value]: [string, any]) => ({
          id: key,
          nombre: value.nombre,
          servicios: value.servicios
        }));

        console.log('Langile Zerbitzuak kargatu:', this.langileService);
      },
      (error) => {
        console.error("Errorea langile zerbitzuak kargatzerakoan:", error);
      }
    );
  }

  langileakLortu() {
    this.http.get(`${environment.url}taldeak`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      (datuak: any) => {
        // Filtramos las categorías y productos activos (sin `ezabatzeData`)
        this.langileak = datuak
          .filter((taldea: any) => taldea.ezabatzeData === null)
          .map((taldea: any) => ({
            ...taldea,
            langileak: taldea.langileak.filter((langile: any) => langile.ezabatzeData === null)
          }));

        console.log('Langileak kargatu:', this.langileak);
      },
      (error) => {
        console.error("Errorea langileak kargatzerakoan:", error);
      }
    );
  }
}


