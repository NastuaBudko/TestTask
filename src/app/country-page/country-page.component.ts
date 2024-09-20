import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CountriesService } from '../../services/countries.service';
import { Country } from '../../interfaces/country.model';
import { Holiday } from '../../interfaces/holiday.model';

@Component({
  selector: 'app-country-page',
  standalone: true,
  imports: [],
  templateUrl: './country-page.component.html',
  styleUrl: './country-page.component.css'
})
export class CountryPageComponent implements OnInit{
  private route = inject(ActivatedRoute);
  private countryService = inject(CountriesService);
  private destroyRef = inject(DestroyRef)

  $countryCode = signal<string>('');
  $countryInfo = signal<Country | null>(null);
  $countryHolidays = signal<Holiday[]>([])
  $year = signal<number>(new Date().getFullYear());

  ngOnInit(): void {
    const subscription = this.route.params.subscribe(params => {
      this.$countryCode.set(params['countryCode']);
      this.getCountryDetails();
      this.getCountryHolidays();
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe())
  }

  getCountryDetails() {
    if (this.$countryCode()) {
      const subscription = this.countryService.getCountryByCode(this.$countryCode()).subscribe({
        next: details => {
        this.$countryInfo.set(details)
      },
      error: (error) => console.error(error)
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe())
    }
  }

  onAddYear() {
    if(this.$year() > 2029) {
      return;
    }
    this.$year.set(this.$year() + 1);
    this.getCountryHolidays();
  }

  onMinusYear() {
    if(this.$year() < 2021) {
      return;
    }
    this.$year.set(this.$year() - 1);
    this.getCountryHolidays();
  }

  getCountryHolidays() {
    const subscription = this.countryService.getHolidaysByCountryCodeAndYear(this.$countryCode(), this.$year()).subscribe({
      next: data => this.$countryHolidays.set(data),
      error: (error) => console.error(error)
    })
    this.destroyRef.onDestroy(() => subscription.unsubscribe())
  }

}
