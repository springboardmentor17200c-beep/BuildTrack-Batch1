import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [],
  templateUrl: './project-details.html',
  styleUrl: './project-details.css',
})
export class ProjectDetails {

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/projects']);
  }

}