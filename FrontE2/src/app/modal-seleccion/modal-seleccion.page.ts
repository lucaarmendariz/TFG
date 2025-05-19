import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ClienteCreationModalPage } from '../cliente-creation-modal/cliente-creation-modal.page';
import { BezeroService } from '../zerbitzuak/bezero.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../zerbitzuak/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-seleccion',
  templateUrl: './modal-seleccion.page.html',
  styleUrls: ['./modal-seleccion.page.scss'],
  standalone: false
})
export class ModalSeleccionPage implements OnInit {
  @Input() clientes: any[] = [];

  searchTerm: string = '';
  filteredClientes: any[] = [];
  clienteId: string = '';

  constructor(private modalController: ModalController, private bezeroService: BezeroService,
      private translate: TranslateService,
      private languageService: LanguageService) {}
selectedLanguage: string = 'es';
  private langSubscription!: Subscription;
  ngOnInit() {
    this.selectedLanguage = this.languageService.getCurrentLanguage();
    this.translate.use(this.selectedLanguage);
    this.langSubscription = this.languageService.currentLang$.subscribe(lang => {
      this.selectedLanguage = lang;
      this.translate.use(lang);
    });
    this.filteredClientes = this.clientes;
  }

  filterClientes() {
    const term = this.searchTerm.toLowerCase();
    this.filteredClientes = this.clientes.filter(c =>
      c.izena.toLowerCase().includes(term) ||
      c.abizena.toLowerCase().includes(term) ||
      c.telefonoa.toLowerCase().includes(term)
    );
  }

  seleccionarCliente(cliente: any) {
    this.clienteId = cliente.id;
  }

  asignarCliente(cliente: any) {
    this.modalController.dismiss(cliente);
  }

  dismiss() {
    this.modalController.dismiss(null, 'cancel');
  }
  hover: number | null = null;

  async crearNuevoCliente() {
    const modal = await this.modalController.create({
      component: ClienteCreationModalPage
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        const nuevoCliente = result.data;
        console.log('Nuevo cliente creado:', nuevoCliente);

        this.bezeroService.cargarClientes();

        this.clientes.push(nuevoCliente);
        this.filterClientes();

        this.clienteId = nuevoCliente.id;
        this.modalController.dismiss(nuevoCliente);
      }
    });

    await modal.present();
  }
}
