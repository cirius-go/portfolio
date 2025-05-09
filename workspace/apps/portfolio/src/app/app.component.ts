import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MainComponent } from './layout/main/main.component';

@Component({
  imports: [RouterModule, MainComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'portfolio';
}
