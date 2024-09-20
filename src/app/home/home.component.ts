import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Countries } from '../../interfaces/countries.model';
import { CountriesService } from '../../services/countries.service';
import { RouterLink } from '@angular/router';
import { Holiday } from '../../interfaces/holiday.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  $countries = signal<Countries[]>([]);
  $holidays = signal<{ countryCode: string; countryName: string; holidays: Holiday[] }[]>([]);
  $filteredCountries = signal<Countries[]>([]); 
  inputData: string = '';
  $isSearching = signal<boolean>(false);

  private countriesService = inject(CountriesService);
  private destroyRef = inject(DestroyRef)

  ngOnInit(): void {
    const subscription = this.countriesService.getAllCountries().subscribe({
      next: (data) => {
        this.$countries.set(data),
        this.$filteredCountries.set(data);
        this.fetchRandomHolidays()
      },
      error: (error) => console.error('Failed to load countries: ', error)
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe())
  }

  clearSearch(): void {
    this.inputData = '';
    this.$isSearching.set(false);
    this.$filteredCountries.set(this.$countries()); 
  }

  onSearchCountry(): void {
    const searchValue = this.inputData.toLowerCase();
    this.$isSearching.set(true)

    const filtered = this.$countries().filter(country =>
      country.name.toLowerCase().includes(searchValue)
    );

    this.$filteredCountries.set(filtered);
  }

  private fetchRandomHolidays(): void {
    const subscription = this.countriesService.getHolidaysForRandomCountries(3).subscribe({
      next: (holidays) =>
        this.$holidays.set(holidays),
      error: (error) => console.error('Failed to fetch holidays:', error)
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe())
  }
}
