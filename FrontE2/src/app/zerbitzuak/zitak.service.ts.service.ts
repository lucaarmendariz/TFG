import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private cita: any = {
    data: null,
    hasieraOrdua: null,
    amaieraOrdua: null,
    eserlekua: 0,
    izena: '',
    deskribapena: ''
  };

  setCita(data: string, hasiera: string, amaiera: string, seat: number) {
    this.cita = {
      data,
      hasieraOrdua: hasiera,
      amaieraOrdua: amaiera,
      eserlekua: seat,
    };
  }

  setCitaIzenaDesc(izena: string, deskribapena: string){
    this.cita.izena = izena,
    this.cita.deskribapena = deskribapena
  }

  getCita() {
    return this.cita; // Devuelve toda la info, incluyendo nombre y descripción
  }

  clearCita() {
    this.cita = {
      data: null,
      hasieraOrdua: null,
      amaieraOrdua: null,
      eserlekua: 0,
      izena: '',
      deskribapena: ''
    };
  }
}
