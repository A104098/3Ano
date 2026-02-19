// Dados mockup de cidades e regiões para alimentar a interface e os filtros.
import citiesJson from '../../db.json';

export interface Listing {
  id: number;
  title: string;
  type: string;
  region: string;
  image: string;
  city: string;
}

export interface Region {
  name: string;
  heroImage?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  averagePrice: number;
  averageNights: number;
  rating: number;
  yearData?: YearData[];
}



export interface YearData {
  year: number;
  totalListings: number;
  averagePrice: number;
  averageNights: number;
  occupancyRate: number;
  roomTypeDistribution: {
    [key: string]: number;
  };
  topOwnersDistribution?: {
    [key: string]: number;
  };
  monthlyPrices: number[];
  monthlyListings: number[];
}

export interface CityData {
  name: string;
  country: string;
  heroImage?: string;
  averagePrice: number;
  averageNights: number;
  rating: number;
  mapImage: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  regions: Region[];
  listings: Listing[];
  yearData: YearData[];
}

const data = citiesJson as unknown as { cities: Record<string, CityData> };
export const citiesData: Record<string, CityData> = data.cities;

export const getCityBySlug = (slug: string): CityData | null =>
  citiesData[slug.toLowerCase()] ?? null;

export const getCitiesList = (): CityData[] =>
  Object.values(citiesData);



