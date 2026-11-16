import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private stompClient: any;
    private readonly messageSubject = new Subject<any>();

    constructor() {
        this.initWebSocket();
    }

    private initWebSocket(): void {
        const socket = new SockJS('http://localhost:8080/ws-chilis');
        this.stompClient = Stomp.over(socket);
        this.stompClient.debug = null;

        this.stompClient.connect({}, () => {
            this.stompClient.subscribe('/topic/actualizaciones', (message: any) => {
                if (message.body) {
                    this.messageSubject.next(JSON.parse(message.body));
                }
            });
        }, () => {
            setTimeout(() => this.initWebSocket(), 3000);
        });
    }

    listenEvents(): Observable<any> {
        return this.messageSubject.asObservable();
    }

    sendEvent(destination: string, payload: any): void {
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.send(destination, {}, JSON.stringify(payload));
        }
    }
}