// types.ts (should be in your project types)
export interface ProductFeature {
  imgSrc: string;
  heading: string;
  subheading: string;
  path: string; // Added path property
}

export interface ExpertProduct {
  profession: string;
  name: string;
  imgSrc: string;
  productLink: string;
  price: string;
  features: string[];
}

// data.ts
export const FeaturesData: ProductFeature[] = [
  {
    imgSrc: '/images/dog6.png',
    heading: "Portion Control",
    subheading: "Exact dietary requirements for pet care",
    path: "/search/portion%20control"
  },
  {
    imgSrc: '/images/dog5.png',
    heading: "Smart App",
    subheading: "Pet supplies that say which pet ate how much",
    path: "/search/smart%20app"
  },
  {
    imgSrc: '/images/Best-Automatic-Cat-Feeder-with-a-Timer-for-Precise-Wet-Food-Feeding-Schedules.png',
    heading: "Timers",
    subheading: "Feeding schedules for pet friendly supplies",
    path: "/search/timers"
  },
  {
    imgSrc: '/images/dog4.png',
    heading: "Two-Way Audio",
    subheading: "Communicate with your pet using your pet feeder",
    path: "/search/two-way%20audio"
  }
];

export const ExpertData: ExpertProduct[] = [
  {
    profession: 'Automatic Cat Feeder',
    name: 'PETLIBRO',
    imgSrc: 'https://m.media-amazon.com/images/I/41IyqubT+HL._SL500_.jpg',
    productLink: 'https://www.amazon.com/dp/B0B1TMLL3F',
    price: '$69.99',
    features: [
      "Smart APP Control: Wi-Fi enabled for remote feeding",
      "10 meals per day with 1-48 portions per meal",
      "10-second voice recording for meal calls",
      "5L capacity with freshness preservation"
    ]
  },
  {
    profession: 'Automatic Feeder',
    name: 'IMIPAW',
    imgSrc: 'https://m.media-amazon.com/images/I/31smh+Fyk0L._SL500_.jpg',
    productLink: 'https://www.amazon.com/dp/B0BR5VST5N',
    price: '$35.99',
    features: [
      "Programmable timed feeding",
      "3L/12 cup capacity",
      "Dual power supply (adapter + batteries)",
      "Easy to use LCD screen"
    ]
  },
  {
    profession: 'Automatic Feeder',
    name: 'VOLUAS',
    imgSrc: 'https://m.media-amazon.com/images/I/31FCol5w8TL._SL500_.jpg',
    productLink: 'https://www.amazon.com/dp/B09LD2CD1L',
    price: '$54.99',
    features: [
      "4L/16.9 cup capacity",
      "Voice record meal call (10 seconds)",
      "1-4 meals with 0-40 portion choices",
      "Wired or battery power"
    ]
  },
  {
    profession: 'Dual Cat Feeder',
    name: 'oneisall',
    imgSrc: 'https://m.media-amazon.com/images/I/41IyqubT+HL._SL500_.jpg',
    productLink: 'https://www.amazon.com/dp/B0C5X2G933',
    price: '$50.99',
    features: [
      "Designed for 2 cats (separate bowls)",
      "5L/20 cups capacity",
      "10-second voice recorder",
      "Up to 6 meals a day"
    ]
  }
];