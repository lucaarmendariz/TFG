import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoginServiceService } from '../zerbitzuak/login-service.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { HeaderComponent } from '../components/header/header.component';
import { LanguageService } from '../zerbitzuak/language.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {
  @ViewChild(HeaderComponent) headerComponent!: HeaderComponent;

  ikasle!: boolean;
  selectedLanguage: string = 'es';
  produktuak: any[] = [];
  filteredProduktuak: any[] = [];
  constructor(
    private loginService: LoginServiceService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private languageService: LanguageService
  ) {
    this.selectedLanguage = this.languageService.getCurrentLanguage();
  }

  ngOnInit() {
    this.ikasle = this.loginService.isAlumno();
    this.translate.setDefaultLang(this.selectedLanguage);

    // Escucha los cambios en la ruta
    this.route.params.subscribe(params => {
      // Puedes realizar una acción aquí cada vez que se cambie la ruta
      this.ikasle = this.loginService.isAlumno();
    });
    this.produktuakLortu();
    this.getProductosBajoStock();
  }

  logout() {
    this.loginService.logout();
  }

  changeLanguage() {
    this.languageService.setLanguage(this.selectedLanguage);
  }

  produktuakLortu() {
    this.http.get(`${environment.url}produktu_kategoria`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    }).subscribe(
      (datuak: any) => {
        // Filtramos las categorías y productos activos (sin `ezabatzeData`)
        this.produktuak = datuak
          .filter((categoria: any) => categoria.ezabatzeData === null)
          .map((categoria: any) => ({
            ...categoria,
            produktuak: categoria.produktuak
              .filter((producto: any) => producto.ezabatzeData === null)
          }));
        this.filteredProduktuak = this.produktuak;
      },
      (error) => {
        console.error("Errorea produktuak kargatzerakoan:", error);
      }
    );
  }


  getProductosBajoStock(): any[] {

    const productosBajoStock: any[] = [];

    this.produktuak.forEach((material: any) => {
      if (material.produktuak && Array.isArray(material.produktuak)) {
        const bajoStock = material.produktuak.filter((prod: any) => prod.stock <= prod.stockAlerta);
        productosBajoStock.push(...bajoStock);
      }
    });
    return productosBajoStock;
  }

}
