import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
    }
  `]
})
export class PieChartComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() data: ChartConfiguration['data'] = { datasets: [], labels: [] };
  @Input() options: ChartConfiguration['options'] = {};
  
  private chart!: Chart;

  ngOnInit() {
    this.options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      ...this.options
    };
  }

  ngAfterViewInit() {
    this.createChart();
  }

  createChart() {
    if (this.chart) {
      this.chart.destroy();
    }
    
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'pie',
      data: this.data,
      options: this.options
    });
  }

  updateChart(data: ChartConfiguration['data']) {
    this.data = data;
    if (this.chart) {
      this.chart.data = data;
      this.chart.update();
    }
  }
}