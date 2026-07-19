import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MaterialUtilization {
  name: string;
  used: number;
  total: number;
}

export interface ProgressOverviewData {
  overallProgress: number;
  todayProgress: number;
  plannedProgress: number;
  actualProgress: number;
  delayDays: number;
  materials: MaterialUtilization[];
}

@Component({
  selector: 'app-progress-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-overview.html',
  styleUrl: './progress-overview.css',
})
export class ProgressOverviewComponent {

  @Input() progressData: ProgressOverviewData = {
    overallProgress: 0,
    todayProgress: 0,
    plannedProgress: 0,
    actualProgress: 0,
    delayDays: 0,
    materials: [],
  };

  /* ── Overall ring SVG ─────────────────────────── */
  readonly circumference = 2 * Math.PI * 70; // r = 70

  get overallOffset(): number {
    return this.circumference - (this.circumference * this.progressData.overallProgress / 100);
  }

  get overallStrokeColor(): string {
    const p = this.progressData.overallProgress;
    if (p >= 75) return '#059669';
    if (p >= 40) return '#2563eb';
    return '#ea580c';
  }

  /* ── Delay status ─────────────────────────────── */
  get delayStatus(): 'on-schedule' | 'minor' | 'critical' {
    const d = this.progressData.delayDays;
    if (d <= 0) return 'on-schedule';
    if (d <= 7) return 'minor';
    return 'critical';
  }

  get delayLabel(): string {
    const d = this.progressData.delayDays;
    if (d <= 0) return 'On Schedule';
    return `${d} Day${d > 1 ? 's' : ''} Behind`;
  }

  get delayIcon(): string {
    if (this.delayStatus === 'on-schedule') return '✅';
    if (this.delayStatus === 'minor') return '⚠️';
    return '🚨';
  }

  /* ── Deviation ────────────────────────────────── */
  get deviation(): number {
    return this.progressData.actualProgress - this.progressData.plannedProgress;
  }

  get deviationLabel(): string {
    const d = this.deviation;
    if (d === 0) return 'On target';
    if (d > 0) return `+${d}% ahead`;
    return `${d}% behind`;
  }

  get deviationClass(): string {
    if (this.deviation > 0) return 'deviation-ahead';
    if (this.deviation < 0) return 'deviation-behind';
    return 'deviation-on-target';
  }

  /* ── Material util helpers ────────────────────── */
  materialPercent(mat: MaterialUtilization): number {
    return mat.total > 0 ? Math.round((mat.used / mat.total) * 100) : 0;
  }

  materialBarClass(mat: MaterialUtilization): string {
    const p = this.materialPercent(mat);
    if (p >= 90) return 'mat-bar-critical';
    if (p >= 70) return 'mat-bar-warn';
    return 'mat-bar-normal';
  }
}
