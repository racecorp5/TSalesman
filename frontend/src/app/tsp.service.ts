import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TSPService {
  private apiUrl = environment.apiUrl + '/TravelingSalesman';
  private apiCode = `?code=${environment.apiCode}`;

  constructor(private http: HttpClient) {}

  solveTSP(cities: any[]): Observable<any> {
    //Testing
    const url = this.apiUrl + this.apiCode;
    return this.http.post<any>(url, { cities });
  }
}
