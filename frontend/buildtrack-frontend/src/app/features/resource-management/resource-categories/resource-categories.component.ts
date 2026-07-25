import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';

interface ResourceCategory {
  name: string;
  description: string;
  resources: number;
  status: string;
}

@Component({
  selector: 'app-resource-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resource-categories.component.html',
  styleUrls: ['./resource-categories.component.css']
})
export class ResourceCategoriesComponent {

  showModal = false;

  categories: ResourceCategory[] = [
    {
      name: 'Heavy Machinery',
      description: 'Excavators, Cranes, Bulldozers',
      resources: 15,
      status: 'Active'
    },
    {
      name: 'Vehicles',
      description: 'Trucks, Dumpers, Loaders',
      resources: 9,
      status: 'Active'
    },
    {
      name: 'Power Equipment',
      description: 'Generators and Compressors',
      resources: 6,
      status: 'Active'
    },
    {
      name: 'Safety Equipment',
      description: 'Helmets, Harnesses, PPE Kits',
      resources: 25,
      status: 'Active'
    }
  ];

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveCategory() {
    this.closeModal();
  }
}