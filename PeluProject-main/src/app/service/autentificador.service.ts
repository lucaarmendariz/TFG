import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Erabiltzaile {
  username: string;
  rola: string;
  pasahitza: string;
}

@Injectable({
  providedIn: 'root'
})
export class AutentificadorService {
  private apiUrl = 'http://localhost:8080/api/erabiltzaileak';
  private erabiltzaileak: Erabiltzaile[] = [];
  
  // Inicializamos el BehaviorSubject con el valor de localStorage si existe
  private adminSubject = new BehaviorSubject<boolean>(JSON.parse(localStorage.getItem('admin') || 'false'));
  public admin$ = this.adminSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  obtenerUsuarios(): Observable<Erabiltzaile[]> {
    return this.http.get<Erabiltzaile[]>(this.apiUrl);
  }

  login(username: string, password: string): boolean {
    const usuario = this.erabiltzaileak.find(u => u.username === username && u.pasahitza === password);

    if (usuario) {
      if (usuario.rola === 'IR') {
        console.log('Usuario es admin');
        this.adminSubject.next(true);  // 🔹 Actualiza el BehaviorSubject a true
        localStorage.setItem('admin', 'true');  // Guardamos el estado en localStorage
      } else {
        console.log('Usuario NO es admin');
        this.adminSubject.next(false);
        localStorage.setItem('admin', 'false');  // Guardamos el estado en localStorage
      }
      this.router.navigate(['/home']);
      return true;
    } else {
      return false;
    }
  }

  cargarUsuarios() {
    this.obtenerUsuarios().subscribe(usuarios => {
      this.erabiltzaileak = usuarios;
      console.log('Usuarios recibidos desde la API:', this.erabiltzaileak); // 🔹 Aquí los imprimes
    });
  }

  logout() {
    // Puedes agregar una lógica para cerrar sesión y limpiar el estado
    this.adminSubject.next(false);
    localStorage.removeItem('admin');  // Eliminamos el estado del rol admin al hacer logout
  }
}
