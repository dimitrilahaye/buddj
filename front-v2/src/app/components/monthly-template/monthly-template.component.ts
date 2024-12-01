import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-monthly-template',
  standalone: true,
  imports: [],
  templateUrl: './monthly-template.component.html',
  styleUrl: './monthly-template.component.scss',
})
export class MonthlyTemplateComponent implements OnInit {
  templateId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.templateId = this.route.snapshot.paramMap.get('id') || '';
    console.info(this.templateId);
  }
}
