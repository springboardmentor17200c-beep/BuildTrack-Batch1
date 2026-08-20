import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { } from '../../shared/sidebar/app-sidebar.component';


interface MaintenanceRecord {
  resource: string;
  type: string;
  maintenanceDate: string;
  nextDate: string;
  cost: number;
  servicedBy: string;
  remarks: string;
  status: string;
}

@Component({
  selector: 'app-maintenance-scheduling',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './maintenance-scheduling.component.html',
  styleUrls: ['./maintenance-scheduling.component.css']
})
export class MaintenanceSchedulingComponent {

  constructor(private location: Location) {}

  searchText = '';
  selectedType = 'All';

  showModal = false;

  records: MaintenanceRecord[] = [
    {
      resource: 'Excavator EX-01',
      type: 'Preventive',
      maintenanceDate: '2026-07-20',
      nextDate: '2026-10-20',
      cost: 4500,
      servicedBy: 'John',
      remarks: 'Oil changed',
      status: 'Upcoming'
    },
    {
      resource: 'Tower Crane TC-02',
      type: 'Corrective',
      maintenanceDate: '2026-07-18',
      nextDate: '-',
      cost: 12000,
      servicedBy: 'Mike',
      remarks: 'Hydraulic repair',
      status: 'Completed'
    }
  ];

  get filteredRecords() {
    return this.records.filter(r =>
      (this.selectedType === 'All' || r.type === this.selectedType) &&
      r.resource.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  goBack() {
    this.location.back();
  }

  scheduleMaintenance() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

}