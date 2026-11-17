import { HttpErrorResponse, HttpParams, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api-config';
import { LabelService } from './label.service';
import { ProjectMemberService } from './project-member.service';
import { ProjectService } from './project.service';
import { UserService } from './user.service';

describe('HTTP services', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends a GET with the project-member filter and returns the response', () => {
    const expected = [{ id: 1, projectId: 7, userId: 3, role: 'Fejlesztő' }];
    let result: typeof expected | undefined;
    TestBed.inject(ProjectMemberService).listByProject(7).subscribe((data) => result = data);
    const request = http.expectOne(`${API_BASE_URL}/projectMembers?projectId=7`);
    expect(request.request.method).toBe('GET');
    expect(request.request.body).toBeNull();
    request.flush(expected);
    expect(result).toEqual(expected);
  });

  it('sends a POST with the label body', () => {
    const body = { name: 'Frontend', color: '#315CF8' };
    let result: unknown;
    TestBed.inject(LabelService).create(body).subscribe((data) => result = data);
    const request = http.expectOne(`${API_BASE_URL}/labels`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({ id: 4, ...body });
    expect(result).toEqual({ id: 4, ...body });
  });

  it('sends a PATCH with the project changes', () => {
    const body = { name: 'Új név' };
    let result: unknown;
    TestBed.inject(ProjectService).update(2, body).subscribe((data) => result = data);
    const request = http.expectOne(`${API_BASE_URL}/projects/2`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(body);
    request.flush({ id: 2, ...body });
    expect(result).toEqual({ id: 2, ...body });
  });

  it('forwards the DELETE error without converting it to success', () => {
    let error: HttpErrorResponse | undefined;
    let success = false;
    TestBed.inject(UserService).remove(9).subscribe({
      next: () => success = true,
      error: (response: HttpErrorResponse) => error = response,
    });
    const request = http.expectOne(`${API_BASE_URL}/users/9`);
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toBeNull();
    request.flush({ message: 'Hiba' }, { status: 500, statusText: 'Server Error' });
    expect(success).toBe(false);
    expect(error?.status).toBe(500);
    expect(error?.error).toEqual({ message: 'Hiba' });
  });

  it('passes custom query parameters through to the list endpoint', () => {
    TestBed.inject(UserService).list(new HttpParams().set('active', true)).subscribe();
    const request = http.expectOne(`${API_BASE_URL}/users?active=true`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('forwards errors from GET, POST and PATCH requests', () => {
    const service = TestBed.inject(LabelService);
    const errors: number[] = [];
    service.list().subscribe({ error: (error: HttpErrorResponse) => errors.push(error.status) });
    http.expectOne(`${API_BASE_URL}/labels`).flush('GET hiba', { status: 503, statusText: 'Unavailable' });
    service.create({ name: 'UI', color: '#123456' }).subscribe({
      error: (error: HttpErrorResponse) => errors.push(error.status),
    });
    http.expectOne(`${API_BASE_URL}/labels`).flush('POST hiba', { status: 400, statusText: 'Bad Request' });
    service.update(1, { name: 'Új név' }).subscribe({
      error: (error: HttpErrorResponse) => errors.push(error.status),
    });
    http.expectOne(`${API_BASE_URL}/labels/1`).flush('PATCH hiba', { status: 404, statusText: 'Not Found' });
    expect(errors).toEqual([503, 400, 404]);
  });
});
