import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Ikaslea {
  id?: number;
  izena: string;
  abizenak: string;
  taldea: Taldea;
  taldeIzena?:String;
  taldeKodea?:String;
  sortzeData?: string;
  eguneratzeData?: string;
  ezabatzeData?: null;
  selected?: boolean;  // Nueva propiedad para controlar la selección
}

export interface Taldea {
  kodea: string;
  izena?: string;
  langileak?: Ikaslea[];
  sortzeData?: string;
  eguneratzeData?: string;
  ezabatzeData?: null;
}

export interface Horario {
  id?:number;
  taldea: {
    kodea: string;
  };
  eguna: number;  // Esto debe ser un número
  hasieraData: string;
  amaieraData: string;
  hasieraOrdua: string;
  amaieraOrdua: string;
  sortzeData?: string;
  eguneratzeData?: string;
  ezabatzeData?: string | null;
}


@Injectable({
  providedIn: 'root',
})
export class IkasleZerbitzuakService {

  // Constructor con HttpClient
  constructor(private http: HttpClient) {}

  // Obtener todos los alumnos
  getAlumnos(): Observable<Ikaslea[]> {
    return this.http.get<Ikaslea[]>(`${environment.url}langileak`);
  }

  // Obtener todos los grupos
  getGrupos(): Observable<Taldea[]> {
    return this.http.get<Taldea[]>(`${environment.url}taldeak`);
  }

  // Crear un nuevo alumno
  agregarAlumno(nuevoAlumno: Ikaslea): Observable<Ikaslea> {
    console.log(nuevoAlumno);
     return this.http.post<Ikaslea>(`${environment.url}langileak`, nuevoAlumno);
  }

  // Crear un nuevo grupo
  agregarGrupo(nuevoGrupo: Taldea): Observable<Taldea> {
    return this.http.post<Taldea>(`${environment.url}taldeak`, nuevoGrupo);
  }

  // Actualizar un alumno
  updateAlumno(updatedAlumno: any): Observable<Ikaslea> {
    return this.http.put<Ikaslea>(`${environment.url}langileak/` + updatedAlumno.id, updatedAlumno);
  }

  // Eliminar un alumno
  eliminarAlumno(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.url}langileak/`+id);
  }

  eliminarGrupo(kodea: string): Observable<any> {
    return this.http.delete(`${environment.url}taldeak/kodea/`+kodea);
  }

  updateGrupo(updatedGrupo: Taldea): Observable<Taldea> {
    return this.http.put<Taldea>(`${environment.url}taldeak/` + updatedGrupo.kodea, updatedGrupo);
  }

  getHorarios(): Observable<Horario[]> {
    return this.http.get<Horario[]>(`${environment.url}ordutegiak`);
  }

  getHorariosFilter(fechaInicio:any, fechaFin:any): Observable<Horario[]> {
    return this.http.get<Horario[]>(`${environment.url}ordutegiak/${fechaInicio}/${fechaFin}`);
  }
  // Guardar un nuevo horario
  guardarHorario(nuevoHorario: Horario): Observable<Horario> {
    return this.http.post<Horario>(`${environment.url}ordutegiak`, nuevoHorario);
  }
  // Actualizar un horario existente
  actualizarHorario(updatedHorario: Horario): Observable<Horario> {
    return this.http.put<Horario>(`${environment.url}ordutegiak/id/` + updatedHorario.id, updatedHorario);
  }

  // Eliminar un horario
  eliminarHorario(id: number): Observable<string> {
    return this.http.delete(`${environment.url}ordutegiak/id/` + id, { responseType: 'text' });
  }
  
}

