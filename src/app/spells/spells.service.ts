import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpellsService {
  private api = 'https://www.dnd5eapi.co/api/';

  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return this.http.get<any>(this.api+'spells');
  }

  getDescription(url: string): Observable<any> {
    return this.http.get<any>('https://www.dnd5eapi.co'+ url);
  }

  getClasses() {
    return this.http.get('https://www.dnd5eapi.co/api/classes');
  }
}
