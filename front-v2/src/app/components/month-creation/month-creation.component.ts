import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MonthTemplate } from '../../models/monthTemplate.model';

@Component({
  selector: 'app-month-creation',
  standalone: true,
  imports: [],
  templateUrl: './month-creation.component.html',
  styleUrl: './month-creation.component.scss',
})
export class MonthCreationComponent implements OnInit {
  template: MonthTemplate | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.template = data['template'];
    });
  }
}
