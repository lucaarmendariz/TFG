import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {

  user:any = null;

  constructor(private router: Router, private http: HttpClient) {
  }

  init() {}

  login(username: string, password: string): Observable<boolean> {
    const json_data = { "username": username, "pasahitza": password };
    
    return this.http.post<any>(`${environment.url}erabiltzaileak/login`, json_data, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      map(response => {
        if (response && response.status === true) {
          this.user = response;
          
          localStorage.setItem('username', response.username);
          localStorage.setItem('role', response.rola);
          
          return true;
        }
        return false;
      }),
      catchError(error => {
        console.error("Error en la petición de login:", error);
        return of(false);
      })
    );
  }
  
  logout() {
    console.log(localStorage.getItem('role'))
    // Eliminar los datos de login del localStorage
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    this.router.navigate(['/login']); // Redirigir al login
  }
  
  isAlumno(): boolean {
    const role = localStorage.getItem('role'); // Obtén el rol desde el localStorage
    console.log(role);
    return role === 'ik'; // Devuelve true si el rol es 'ik' (alumno), false en caso contrario
  }
  
}
