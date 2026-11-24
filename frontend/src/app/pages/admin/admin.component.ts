import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-admin',
  imports: [FormsModule, DatePipe],
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {
  tickets: any[] = [];

  // filters
  search = '';
  statusFilter = '';
  priorityFilter = '';

  // selected ticket for update
  selected: any = null;
  newStatus = '';
  reply = '';

  constructor(private ticketService: TicketService) {}

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    this.ticketService.getTickets().subscribe(data => {
      this.tickets = data;
    });
  }

  // statistics
  get totalCount() {
    return this.tickets.length;
  }

  get openCount() {
    return this.tickets.filter(t => t.status == 'Open').length;
  }

  get closedCount() {
    return this.tickets.filter(t => t.status == 'Resolved').length;
  }

  // search + filter
  get filteredTickets() {
    return this.tickets.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(this.search.toLowerCase());
      const matchStatus = this.statusFilter == '' || t.status == this.statusFilter;
      const matchPriority = this.priorityFilter == '' || t.priority == this.priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }

  selectTicket(t: any) {
    this.selected = t;
    this.newStatus = t.status;
    this.reply = t.reply || '';
  }

  saveTicket() {
    const data = { status: this.newStatus, reply: this.reply };

    this.ticketService.updateTicket(this.selected.id, data).subscribe(() => {
      this.selected = null;
      this.loadTickets();
    });
  }
}
