import { Component, OnInit } from '@angular/core';
import { AutentificadorService } from 'src/app/service/autentificador.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent implements OnInit {
  public admin: boolean = false;

  constructor(private autSer: AutentificadorService) {}

  ngOnInit() {
    // Suscribirse a los cambios en admin
    this.autSer.admin$.subscribe(isAdmin => {
      console.log('Valor de admin cambiado:', isAdmin);
      this.admin = isAdmin;
    });
  }
}
