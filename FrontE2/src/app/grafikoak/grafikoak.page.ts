import { LanguageService } from 'src/app/zerbitzuak/language.service';
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
  standalone: false
})
export class GrafikoakPage implements OnInit {
  @ViewChild(HeaderComponent) headerComponent!: HeaderComponent;
  langileak: any[] = [];
  chart: any;
  categoriasAbiertas: { [key: string]: boolean } = {};
  langileService: any[] = [];
  isGraphOpen: boolean = false;
  selectedLanguage: string = 'es';
  isIkasle!: boolean;
  langileSelec!: any;
  private routeSubscription: any;
  searchTerm: string = '';
  langileakOriginal: any[] = []; // Copia sin filtrar


  ngOnDestroy() {
    // Limpiar la suscripción cuando el componente se destruya
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  constructor(
  private translate: TranslateService,
  private http: HttpClient,
  private loginService: LoginServiceService,
  private router: Router,
  private route: ActivatedRoute,
  private languageService: LanguageService
) {
  this.selectedLanguage = this.languageService.getCurrentLanguage();
}


  descargarGrafico() {
  const canvasElement = document.getElementById('myChart') as HTMLCanvasElement;

  if (!canvasElement) {
    console.error(this.translate.instant('graficos.canvasNoEncontrado'));
    return;
  }

  const imgData = canvasElement.toDataURL('image/png');
  const pdf = new jsPDF();

  const trabajador = this.langileSelec;
  const trabajadorNombre = trabajador ? trabajador.izena : this.translate.instant('graficos.desconocido');
  const trabajadorApellido = trabajador ? trabajador.abizenak : "";
  const grupoCodigo = trabajador ? trabajador.taldeKodea : this.translate.instant('graficos.sinCodigo');

  const logoUrl = 'assets/IMP_Logotipoa.png';
  pdf.addImage(logoUrl, 'PNG', 10, 5, 40, 25);

  pdf.setFontSize(16);
  pdf.text(this.translate.instant('graficos.tituloAnalisis'), 60, 20);

  pdf.setFontSize(12);
  pdf.text(`${this.translate.instant('graficos.nombre')}: ${trabajadorNombre} ${trabajadorApellido}`, 10, 40);
  pdf.text(`${this.translate.instant('graficos.grupo')}: ${grupoCodigo}`, 10, 50);

  pdf.addImage(imgData, 'PNG', 15, 60, 180, 100);
  pdf.save(`grafico_${trabajadorNombre}.pdf`);
}




  openGraphModal(langile: any) {
    this.isGraphOpen = true;
    this.langileSelec = langile;
    setTimeout(() => {
      this.mostrarDatos(langile.id); // Esperamos un poco antes de crear el gráfico
    }, 300);
  }


  closeGraphModal() {
    this.isGraphOpen = false;
  }

  changeLanguage() {
  this.languageService.setLanguage(this.selectedLanguage);
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
      console.error(this.translate.instant('graficos.canvasNoEncontrado'));
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    const trabajador = this.langileService.find(t => t.id == trabajadorId);
    let servicios = { [this.translate.instant('graficos.sinServicios')]: 0 };
    let trabajadorNombre = trabajador ? trabajador.nombre : this.translate.instant('graficos.desconocido');

    if (trabajador) {
      servicios = trabajador.servicios;
      console.log(servicios)
    }

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(servicios),
        datasets: [{
          label: `${trabajadorNombre} - ${this.translate.instant('graficos.servicios')}`,
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
        this.langileakOriginal = datuak
          .filter((taldea: any) => taldea.ezabatzeData === null)
          .map((taldea: any) => ({
            ...taldea,
            langileak: taldea.langileak.filter((langile: any) => langile.ezabatzeData === null)
          }));

        this.langileak = [...this.langileakOriginal]; // Inicialmente igual
      },
      (error) => {
        console.error("Errorea langileak kargatzerakoan:", error);
      }
    );
  }

  filtrarLangileak() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.langileak = [...this.langileakOriginal];
      return;
    }

    this.langileak = this.langileakOriginal
      .map(taldea => {
        const filteredLangileak = taldea.langileak.filter((langile: any) =>
          langile.izena.toLowerCase().includes(term) ||
          langile.abizenak.toLowerCase().includes(term) ||
          taldea.izena.toLowerCase().includes(term) ||
          taldea.kodea.toLowerCase().includes(term) // <- Nuevo criterio
        );

        return { ...taldea, langileak: filteredLangileak };
      })
      .filter(taldea => taldea.langileak.length > 0);
  }


}


