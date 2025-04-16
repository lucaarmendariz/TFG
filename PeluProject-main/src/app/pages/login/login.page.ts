import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AutentificadorService } from 'src/app/service/autentificador.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
})
export class LoginPage implements OnInit {
  username: string = '';
  password: string = '';
  loginError: boolean = false;  // Para mostrar un mensaje de error si no coincide el login

  constructor(
    private autSer: AutentificadorService,
    private router: Router
  ) {}

  ngOnInit() {
    this.autSer.cargarUsuarios();  // Cargar usuarios al iniciar el componente
  }

  onLogin(): void {
    const success = this.autSer.login(this.username, this.password);
  
    if (!success) {
      this.loginError = true;
    } else {
      // Suscribirse para obtener el valor de admin
      this.autSer.admin$.subscribe(isAdmin => {
        if (isAdmin) {
          console.log("El usuario tiene permisos de administrador.");
        }
      });
    }
  }
}
