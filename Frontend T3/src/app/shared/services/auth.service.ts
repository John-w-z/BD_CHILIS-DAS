import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { AuthResponseDTO, LoginRequestDTO, ValidarPinDTO } from '../entities/auth.dto';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly apiUrl = 'http://localhost:8080/api/auth';
    private readonly currentUserSubject = new BehaviorSubject<AuthResponseDTO | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private readonly http: HttpClient) {
        const savedUser = localStorage.getItem('chilis_session');
        if (savedUser) {
            this.currentUserSubject.next(JSON.parse(savedUser));
        }
    }

    login(credentials: LoginRequestDTO): Observable<AuthResponseDTO> {
        return this.http.post<AuthResponseDTO>(`${this.apiUrl}/login`, credentials).pipe(
            tap((response: AuthResponseDTO) => {
                localStorage.setItem('chilis_session', JSON.stringify(response));
                localStorage.setItem('token', response.token);
                this.currentUserSubject.next(response);
            })
        );
    }

    validarPinAdmin(dto: ValidarPinDTO): Observable<boolean> {
        return this.http.post<boolean>(`${this.apiUrl}/validar-pin`, dto);
    }

    logout(): void {
        localStorage.removeItem('chilis_session');
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
    }

    getUserRole(): string | null {
        return this.currentUserSubject.value?.rol || null;
    }
}