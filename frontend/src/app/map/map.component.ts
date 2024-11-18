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
  route: (google.maps.Polyline | google.maps.marker.AdvancedMarkerElement)[] = [];
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
    const element = document.createElement('div');
    element.className = index == 0 ? 'starting-location map-city-name' : 'map-city-name';
    element.textContent = index ? `${index} ${name}` : name;
    return element;
  }
    
  createDistanceMarkerContent(distance: string): HTMLDivElement {
    const element = document.createElement('div');
    element.style.backgroundColor = 'white';
    element.style.border = '1px solid black';
    element.style.borderRadius = '4px';
    element.style.padding = '2px 4px';
    element.style.fontSize = '12px';
    element.style.fontWeight = 'bold';
    element.style.color = '#FF0000';
    element.textContent = distance+"m";
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
    this.route.forEach(marker => {
      if (marker instanceof google.maps.Polyline) {
        marker.setMap(null);
      } else {
        marker.map = null;
      }
    });
    this.route = [];

    const path: any[] = [];

    // Add new markers and draw routes
    const size = response.orderedCities.length;
    response.orderedCities.forEach((city, index) => {
      path.push(new google.maps.LatLng(city.lat, city.lng));

      if(index === size - 1) {
        return;
      }
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: new google.maps.LatLng(city.lat, city.lng),
        map: this.map,
        content: this.createMarkerContent(city.city, index), // Highlight the first one
      });
      this.markers.push(marker);
        let midpoint: google.maps.LatLng;
        let content: HTMLDivElement;
        if(index === 0) {
          const lastCity = response.orderedCities[size-2];
          const lastCityPoint = new google.maps.LatLng(lastCity.lat, lastCity.lng);
          midpoint = google.maps.geometry.spherical.interpolate(path[index], lastCityPoint, 0.5);
          content = this.createDistanceMarkerContent(response.orderedCities[size-1].distanceFromLastPoint);
        } else {
          midpoint = google.maps.geometry.spherical.interpolate(path[index], path[index-1], 0.5);
          content = this.createDistanceMarkerContent(city.distanceFromLastPoint);
        }

        // Create and display the AdvancedMarkerElement
        const labelMarker = new google.maps.marker.AdvancedMarkerElement({
          position: midpoint,
          map: this.map,
          content,
        });
        this.route.push(labelMarker);
    });

    const route = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: this.map
    });
    this.route.push(route);
  }

  resetMap(): void {
    // Clear existing markers and routes
    this.markers.forEach(marker => marker.map = null);
    this.markers = [];
    this.route.forEach(marker => {
      if (marker instanceof google.maps.Polyline) {
        marker.setMap(null);
      } else {
        marker.map = null;
      }
    });
    this.route = [];
  }
}