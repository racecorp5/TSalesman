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
  markers: google.maps.Marker[] = [];
  maxPins = 20;
  geocoder: google.maps.Geocoder;

  constructor(private tspService: TSPService) {}

  ngOnInit(): void {
    this.geocoder = new google.maps.Geocoder();

    const mapProperties = {
      center: new google.maps.LatLng(39.8283, -98.5795),
      zoom: 5,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapProperties);

    this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (this.markers.length < this.maxPins) {
        this.addMarker(event.latLng);
      }
    });
  }

  addMarker(location: google.maps.LatLng): void {
    this.geocoder.geocode({ location: location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const city = this.getCityFromResults(results);
        const marker = new google.maps.Marker({
          position: location,
          map: this.map,
          draggable: true,
          label: city
        });
        this.markers.push(marker);

        marker.addListener('rightclick', () => {
          marker.setMap(null);
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

  createMarkerLabel(index: number): string {
    const label = index.toString();
    return label;
  }

  submit(): void {
    const cities = this.markers.map(marker => ({
      city: marker.getLabel(),
      lat: marker.getPosition().lat(),
      lng: marker.getPosition().lng(),
    }));

    this.tspService.solveTSP(cities).subscribe(response => {
      console.log('Ordered Cities:', response.orderedCities);
      console.log('Total Distance:', response.totalDistance);
      // this.updateMap(response);
    });
  }

  updateMap(response: any): void {
    // Clear existing markers and routes
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];

    // Add new markers and draw routes
    const path = response.cities.map(city => new google.maps.LatLng(city.lat, city.lng));
    const route = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    route.setMap(this.map);

    response.cities.forEach((city, index) => {
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(city.lat, city.lng),
        map: this.map,
        label: city.name,
      });
      this.markers.push(marker);
    });

    // Display distances
    console.log('Total Distance:', response.totalDistance);
    response.cities.forEach(city => {
      console.log(`Distance from last point: ${city.distanceFromLastPoint}`);
    });
  }
}