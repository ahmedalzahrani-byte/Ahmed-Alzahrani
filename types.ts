
export interface SaudiCity {
  id: string;
  name: string;
  arabicName: string;
  description: string;
}

export interface CityEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  category: string;
  bookingUrl: string;
}

export enum ViewState {
  GRID = 'GRID',
  CITY_DETAIL = 'CITY_DETAIL'
}
