import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cita {
  id?: number;
  izena: string;
  telefonoa: string;
  etxekoa: string;
  data: string;
  hasieraOrdua: string;
  amaieraOrdua?: string;
  deskribapena?: string;
  eserlekua?: number;
  prezioTotala?: number;
  sortzeData?: string;
}

@Injectable({
  providedIn: 'root',
})
export class HitzorduakService {
  private apiUrl = 'http://localhost:8080/api/hitzorduak';  

  constructor(private http: HttpClient) {}

  getHitzorduak(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.apiUrl);
  }

  addHitzordua(cita: Partial<Cita>): Observable<Cita> {
    return this.http.post<Cita>(this.apiUrl, cita);
  }
  

  updateHoraReal(id: number, hasieraOrduaErreala: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/actualizar-hora-real`, {
      hasieraOrduaErreala: hasieraOrduaErreala,
    });
  }
  getHitzorduakByFecha(fecha: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/fecha/${fecha}`);
  }

  updateHoraFinalReal(id: number, amaieraOrduaErreala: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/actualizar-hora-final`, {
      amaieraOrduaErreala: amaieraOrduaErreala,
    });
  }
}
