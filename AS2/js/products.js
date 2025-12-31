const PRODUCTS = {
  1: {
    id: 1,
    name: "Kauri Trek Pack",
    price: 420,
    rating: 4,
    reviewCount: 5,
    image: "images/trekpack.png",
    description:
      "Built for multi-day tramps: supportive frame, weather-resistant fabric, and easy-access pockets.",
    models: ["50L", "65L", "75L"],
    reviews: [
      { name: "JOHN DOE", date: "august 14, 2018", rating: 4, text: "Comfortable under load and the hip belt sits nicely. Great for weekend trips." },
      { name: "JANE DOE", date: "september 02, 2018", rating: 3, text: "Solid pack overall. Would love slightly more padding on the shoulder straps." }
    ]
  },
  2: {
    id: 2,
    name: "Ridge Daypack",
    price: 180,
    rating: 5,
    reviewCount: 12,
    image: "images/daypack.png",
    description:
      "Lightweight daypack for day walks, commuting, and quick missions — with room for layers and lunch.",
    models: ["18L", "24L", "30L"],
    reviews: [
      { name: "ARIA W", date: "june 10, 2019", rating: 5, text: "Perfect size for day walks. Fits water bottle, jacket, and snacks easily." },
      { name: "MIKE P", date: "july 21, 2019", rating: 5, text: "Surprisingly comfy. Great ventilation on the back panel." }
    ]
  },
  3: {
    id: 3,
    name: "Alpine Sleeping Bag",
    price: 240,
    rating: 3,
    reviewCount: 8,
    image: "images/sleepingbag.png",
    description:
      "Warm and packable sleeping bag for cool nights. Compresses down small for easy carrying.",
    models: ["Regular", "Long"],
    reviews: [
      { name: "SAM K", date: "may 04, 2020", rating: 3, text: "Good value. Warm enough in shoulder season with a liner." },
      { name: "PRIYA N", date: "may 19, 2020", rating: 3, text: "Comfortable but I’d recommend a warmer rating for winter alpine nights." }
    ]
  },
  4: {
    id: 4,
    name: "Stormproof Tent",
    price: 360,
    rating: 4,
    reviewCount: 10,
    image: "images/tent.png",
    description:
      "Two-person tent designed for NZ conditions: stable poles, fast pitch, and strong rain protection.",
    models: ["2P", "3P"],
    reviews: [
      { name: "KATE L", date: "november 11, 2021", rating: 4, text: "Handled wind really well. Setup was quick even in bad weather." },
      { name: "NOAH B", date: "december 02, 2021", rating: 4, text: "Great for the price. Vestibule space is handy for packs." }
    ]
  },
  5: {
    id: 5,
    name: "Hiking Poles",
    price: 110,
    rating: 3,
    reviewCount: 6,
    image: "images/hikingpoles.png",
    description:
      "Adjustable poles with sturdy locks and comfortable grips — ideal for steep climbs and long descents.",
    models: ["Pair"],
    reviews: [
      { name: "ELLA T", date: "march 03, 2022", rating: 3, text: "Helped heaps on downhill sections. Locks are fine but need to be tightened properly." },
      { name: "JOSH M", date: "march 20, 2022", rating: 3, text: "Good starter poles. Light enough for regular use." }
    ]
  },
  6: {
    id: 6,
    name: "Trail Stove",
    price: 95,
    rating: 5,
    reviewCount: 14,
    image: "images/stove.png",
    description:
      "Compact stove for quick boils and simple camp meals. Packs small and lights easily.",
    models: ["Stove only", "Stove + Pot set"],
    reviews: [
      { name: "TAYLA R", date: "january 07, 2023", rating: 5, text: "Boils water fast and packs down tiny. Perfect for coffee on the track." },
      { name: "BEN H", date: "january 22, 2023", rating: 5, text: "Reliable ignition and stable base. Great for multi-day trips." }
    ]
  }
};
