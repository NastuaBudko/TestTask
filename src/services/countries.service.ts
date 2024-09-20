import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Countries} from '../interfaces/countries.model';
import { Country } from '../interfaces/country.model';
import { forkJoin, map, tap } from 'rxjs';
import { Holiday } from '../interfaces/holiday.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl

  countries = signal<string[]>([]);
  
  getAllCountries() {
    return this.http.get<Countries[]>(`${this.baseUrl}/AvailableCountries`).pipe(
      tap((countries) => {
        this.countries.set(countries.map(country => country.countryCode)); 
      })
    );
  }

  getCountryByCode(countryCode: string) {
    return this.http.get<Country>((`${this.baseUrl}/CountryInfo/${countryCode}`))
  }

  getHolidaysByCountryCode(countryCode: string) {
    return this.http.get<Holiday[]>(`${this.baseUrl}/NextPublicHolidays/${countryCode}`);
  }

  getHolidaysByCountryCodeAndYear(countryCode: string, year: number) {
    return this.http.get<Holiday[]>(`${this.baseUrl}/PublicHolidays/${year}/${countryCode}`);
  }

  getHolidaysForRandomCountries(count: number) {
    const randomCountries = this.getRandomCountries(count);
    const holidayRequests = randomCountries.map(countryCode =>
      this.getHolidaysByCountryCode(countryCode)
    );

    const countryInfoRequests = randomCountries.map(countryCode =>
      this.getCountryByCode(countryCode)
    );

    return forkJoin([forkJoin(holidayRequests), forkJoin(countryInfoRequests)]).pipe(
      map(([holidays, countries]) => 
        randomCountries.map((code, index) => ({
          countryCode: code,
          countryName: countries[index].commonName,
          holidays: holidays[index]
        }))
      )
    );
  }

  getRandomCountries(count: number): string[] {
    const shuffled = this.countries().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}
