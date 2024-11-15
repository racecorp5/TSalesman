import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TSPService {
  private apiUrl = 'http://localhost:7071/TravelingSalesman';

  constructor(private http: HttpClient) {}

  solveTSP(cities: any[]): Observable<any> {
    return this.http.post<any>(this.apiUrl, { cities });
  }
}
