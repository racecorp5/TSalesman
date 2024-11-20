import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TSPService {
  private apiUrl = environment.apiUrl + '/TravelingSalesman';
  
  constructor(private http: HttpClient) {}

  solveTSP(cities: any[]): Observable<any> {
    return this.http.post<any>(this.apiUrl, { cities });
  }
}
