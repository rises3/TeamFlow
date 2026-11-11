import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from './api-config';

export abstract class CrudService<T extends { id: number }> {
  protected readonly http = inject(HttpClient);
  protected abstract readonly path: string;

  protected get url(): string {
    return `${API_BASE_URL}/${this.path}`;
  }

  list(params = new HttpParams()): Observable<T[]> {
    return this.http.get<T[]>(this.url, { params });
  }

  getById(id: number): Observable<T> {
    return this.http.get<T>(`${this.url}/${id}`);
  }

  create(data: Omit<T, 'id'>): Observable<T> {
    return this.http.post<T>(this.url, data);
  }

  update(id: number, data: Partial<Omit<T, 'id'>>): Observable<T> {
    return this.http.patch<T>(`${this.url}/${id}`, data);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<unknown>(`${this.url}/${id}`).pipe(map(() => void 0));
  }
}
