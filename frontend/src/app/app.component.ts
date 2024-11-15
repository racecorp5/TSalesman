import { Component, OnInit } from '@angular/core';
import { TSPService } from './tsp.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  cities: string = '';
  message: string = '';

  constructor(private tspService: TSPService) {}

  ngOnInit(): void {}
}
