import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TSPService } from '../tsp.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @ViewChild('map', { static: true }) mapElement: ElementRef;
  map: google.maps.Map;
  markers: google.maps.marker.AdvancedMarkerElement[] = [];
  maxPins = 20;
  geocoder: google.maps.Geocoder;

  constructor(private tspService: TSPService) {}

  ngOnInit(): void {
    this.geocoder = new google.maps.Geocoder();

    const mapProperties = {
      center: new google.maps.LatLng(39.8283, -98.5795),
      zoom: 5,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapId: "bigmap"
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapProperties);

    this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (this.markers.length < this.maxPins) {
        this.addMarker(event.latLng);
      }
    });
  }

  createMarkerContent(name: string, index?: number): HTMLDivElement {
    console.log(index);
    const element = document.createElement('div');
    element.className = index == 0 ? 'starting-location map-city-name' : 'map-city-name';
    element.textContent = index ? `${index} ${name}` : name;
    return element;
  }
    
  addMarker(location: google.maps.LatLng): void {
    this.geocoder.geocode({ location: location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const city = this.getCityFromResults(results);
        const intital = this.markers.length === 0 ? 0 : undefined; // Highlight the first one
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: location,
          map: this.map,
          content: this.createMarkerContent(city, intital),
        });

        this.markers.push(marker);

        marker.addListener('rightclick', () => {
          marker.map = null;
          this.markers = this.markers.filter(m => m !== marker);
        });
      } else {
        console.error('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

  getCityFromResults(results: google.maps.GeocoderResult[]): string {
    for (const result of results) {
      for (const component of result.address_components) {
        if (component.types.includes('locality')) {
          return component.long_name;
        }
      }
    }
    return 'Unknown';
  }

  submit(): void {
    const cities = this.markers.map(marker => ({
      city: marker.content.textContent,
      lat: marker.position.lat,
      lng: marker.position.lng,
    }));

    this.tspService.solveTSP(cities).subscribe(response => {
      this.updateMap(response);
    });
  }

  updateMap(response: any): void {
    // Clear existing markers and routes
    this.markers.forEach(marker => marker.map = null);
    this.markers = [];

    const path: any[] = [];

    // Add new markers and draw routes
    response.orderedCities.forEach((city, index) => {
      path.push(new google.maps.LatLng(city.lat, city.lng));

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: new google.maps.LatLng(city.lat, city.lng),
        map: this.map,
        content: this.createMarkerContent(city.city, index), // Highlight the first one
      });
      this.markers.push(marker);
    });

    const route = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    route.setMap(this.map);
  }
}