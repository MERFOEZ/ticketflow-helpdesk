import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-my-tickets',
  imports: [FormsModule, DatePipe],
  templateUrl: './my-tickets.component.html'
})
export class MyTicketsComponent implements OnInit {
  tickets: any[] = [];

  // new ticket form
  title = '';
  description = '';
  priority = 'Normal';
  message = '';

  constructor(private ticketService: TicketService) {}

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    this.ticketService.getTickets().subscribe(data => {
      this.tickets = data;
    });
  }

  addTicket() {
    if (!this.title || !this.description) {
      this.message = 'Please enter title and description';
      return;
    }

    const ticket = { title: this.title, description: this.description, priority: this.priority };

    this.ticketService.createTicket(ticket).subscribe(() => {
      this.message = 'Ticket sent successfully';
      this.title = '';
      this.description = '';
      this.priority = 'Normal';
      this.loadTickets();
    });
  }
}
