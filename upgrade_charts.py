import os
import re

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/analytics/procurement-analytics/procurement-analytics.component.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

old_init = r"private initCharts\(\) \{.*?this\.updateCharts\(\);\s*\}"

new_init = """private initCharts() {
    const chartOptions: any = {
      responsive: true,
      maintainAspectRatio: false,
      color: 'rgba(255, 255, 255, 0.7)',
      plugins: {
        legend: { labels: { color: 'rgba(255, 255, 255, 0.7)', font: { family: 'Inter', size: 13 } } },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { family: 'Inter', size: 14 },
          bodyFont: { family: 'Inter', size: 13 },
          padding: 12,
          cornerRadius: 8,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1
        }
      }
    };

    const ctxStatus = this.statusChartRef?.nativeElement;
    if (ctxStatus) {
      this.statusChart = new Chart(ctxStatus, {
        type: 'doughnut',
        data: { 
          labels: [], 
          datasets: [{ 
            data: [], 
            backgroundColor: ['#f97316', '#3b82f6', '#10b981', '#ef4444'],
            borderWidth: 0,
            hoverOffset: 6
          }] 
        },
        options: { 
          ...chartOptions, 
          cutout: '70%',
          plugins: {
            ...chartOptions.plugins,
            legend: { position: 'bottom', labels: { ...chartOptions.plugins.legend.labels, padding: 20 } }
          }
        }
      });
    }

    const ctxVendor = this.vendorChartRef?.nativeElement;
    if (ctxVendor) {
      const ctx2d = ctxVendor.getContext('2d');
      const gradient = ctx2d.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, 'rgba(139, 92, 246, 1)');
      gradient.addColorStop(1, 'rgba(56, 189, 248, 0.2)');

      this.vendorChart = new Chart(ctxVendor, {
        type: 'bar',
        data: { 
          labels: [], 
          datasets: [{ 
            label: 'Total Spend (\\u20b9)', 
            data: [], 
            backgroundColor: gradient,
            borderRadius: 8,
            borderSkipped: false,
            barThickness: 'flex',
            maxBarThickness: 60
          }] 
        },
        options: { 
          ...chartOptions,
          scales: {
            x: { 
              grid: { display: false }, 
              ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { family: 'Inter' } } 
            },
            y: { 
              grid: { color: 'rgba(255, 255, 255, 0.05)', tickLength: 0 }, 
              ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { family: 'Inter' }, padding: 10 } 
            }
          }
        }
      });
    }
    
    this.updateCharts();
  }"""

ts_content = re.sub(old_init, new_init, ts_content, flags=re.DOTALL)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
