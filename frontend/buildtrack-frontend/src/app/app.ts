import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppDataService } from './app-data.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('buildtrack-frontend');

  // Injecting AppDataService here ensures it is instantiated at app startup
  // and begins listening to auth state changes immediately — so all module
  // data services reload whenever a user logs in or re-logs in.
  constructor(private _appData: AppDataService) {}
}
