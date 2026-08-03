import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="kpi-card" [class]="colorClass">
      <div class="kpi-icon">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <div class="kpi-content">
        <div class="kpi-title">{{ title }}</div>
        <div class="kpi-value">{{ value }}</div>
        <div class="kpi-subtitle" *ngIf="subtitle">{{ subtitle }}</div>
      </div>
    </div>
  `,
  styles: [`
    .kpi-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 16px;
      transition: transform 0.2s;
      cursor: pointer;
      height: 100%;
    }
    .kpi-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
    .kpi-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(63, 81, 181, 0.1);
      color: #3f51b5;
    }
    .kpi-icon .mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .kpi-content {
      flex: 1;
    }
    .kpi-title {
      font-size: 14px;
      color: #666;
      margin-bottom: 4px;
    }
    .kpi-value {
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
    }
    .kpi-subtitle {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
    .primary .kpi-icon { background: rgba(63, 81, 181, 0.1); color: #3f51b5; }
    .success .kpi-icon { background: rgba(76, 175, 80, 0.1); color: #4caf50; }
    .warning .kpi-icon { background: rgba(255, 152, 0, 0.1); color: #ff9800; }
    .danger .kpi-icon { background: rgba(244, 67, 54, 0.1); color: #f44336; }
  `]
})
export class KpiCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() subtitle: string = '';
  @Input() icon: string = '';
  @Input() color: 'primary' | 'success' | 'warning' | 'danger' = 'primary';

  get colorClass(): string {
    return this.color;
  }
}