import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { AboutComponent } from '@features/portfolio/components/about/about.component';
import { ContactComponent } from '@features/portfolio/components/contact/contact.component';
import { HeroComponent } from '@features/portfolio/components/hero/hero.component';
import { ProjectsComponent } from '@features/portfolio/components/projects/projects.component';

@Component({
  selector: 'app-portfolio-page-portfolio',
  imports: [
    CommonModule,
    HeroComponent,
    AboutComponent,
    ContactComponent,
    ProjectsComponent,
  ],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
})
export class PortfolioComponent {}
