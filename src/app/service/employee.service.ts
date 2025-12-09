import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee.model';
import { environment } from '../../enviroment/environment';
@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private baseUrl = `${environment.apiUrl}/Employees`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.baseUrl);
  }

  getById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/${id}`);
  }

  add(employee: Omit<Employee, 'id'>): Observable<any> {
    return this.http.post(this.baseUrl, employee);
  }

  update(id: number, employee: Employee): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, employee);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
