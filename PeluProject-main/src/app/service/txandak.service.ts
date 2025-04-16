import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TxandakService {
  private apiUrl = 'http://localhost:8080/txandak'; // Endpoint de turnos
  private empleadosUrl = 'http://localhost:8080/langileak'; // Endpoint de empleados

  constructor(private http: HttpClient) {}

  getTurnosPorFecha(fecha: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/fecha/${fecha}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getEmpleados(): Observable<any[]> {
    return this.http.get<any[]>(this.empleadosUrl);
  }

  createTxanda(txanda: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, txanda);
  }
}
