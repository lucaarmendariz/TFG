import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BezeroService {

  private bezeroakSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public bezeroak$ = this.bezeroakSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Cargar clientes
  cargarClientes() {
    this.http.get(`${environment.url}bezero_fitxak`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }).subscribe(
      (datuak: any) => {
        // Filtrar los clientes activos (sin `ezabatzeData`)
        const clientesActivos = datuak.filter((bezero: any) => bezero.ezabatzeData === null);
        this.bezeroakSubject.next(clientesActivos); // Actualizamos el BehaviorSubject con los nuevos datos
      },
      (error) => {
        console.error("Error al cargar clientes:", error);
      }
    );
  }

  // Crear nuevo cliente
  crearBezero(izena: string, abizena: string, telefonoa: string, piel: boolean) {
    const json_data = {
      "izena": izena,
      "abizena": abizena,
      "telefonoa": telefonoa,
      "azalSentikorra": piel ? "B" : "E",
    };

    return this.http.post(`${environment.url}bezero_fitxak`, json_data, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
