import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private apiUrl = 'http://localhost:5080/api/tickets';

  constructor(private http: HttpClient) {}

  getTickets() {
    return this.http.get<any[]>(this.apiUrl);
  }

  createTicket(ticket: any) {
    return this.http.post(this.apiUrl, ticket);
  }

  updateTicket(id: number, data: any) {
    return this.http.put(this.apiUrl + '/' + id, data);
  }
}
