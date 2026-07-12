import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthDataService } from '../auth/auth-data.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './unauthorized.html',
  styleUrls: ['./unauthorized.css'],
})
export class Unauthorized {
  constructor(public auth: AuthDataService) {}
}
