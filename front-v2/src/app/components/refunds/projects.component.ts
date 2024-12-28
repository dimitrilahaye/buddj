import { Component, OnInit } from '@angular/core';
import { Category } from '../../services/projects/projects.service.interface';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent implements OnInit {
  category: Category | undefined;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const category = this.route.snapshot.queryParamMap.get('category');
    if (category === null || !['refund', 'saving'].includes(category)) {
      this.router.navigate(['/']);
    }
    this.category = category as Category;
  }
}
