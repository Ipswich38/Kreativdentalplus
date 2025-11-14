export interface ServiceRate {
  category: string;
  rate: string;
}

export interface Service {
  id: string;
  name: string;
  rates: ServiceRate[];
  description?: string;
}

export const services: Service[] = [
  {
    id: "1",
    name: "Oral Prophylaxis",
    description: "Professional dental cleaning services",
    rates: [
      { category: "Simple Cleaning", rate: "₱1,500.00" },
      { category: "Moderate Cleaning", rate: "₱2,500.00" },
      { category: "Deep Cleaning", rate: "₱900 - ₱4,500" },
      { category: "PEDO", rate: "₱2,000.00" }
    ]
  },
  {
    id: "2",
    name: "Restoration/Light Cure/Permanent Filling/Pasta",
    description: "Tooth restoration and filling procedures",
    rates: [
      { category: "NO PROMO", rate: "₱1,500.00" },
      { category: "W/PROMO PEDO", rate: "₱1,000 / ₱800" },
      { category: "with HMO", rate: "₱2,000.00" }
    ]
  },
  {
    id: "3",
    name: "Fluoride",
    description: "Fluoride treatment for cavity prevention",
    rates: [
      { category: "NO HMO PEDO", rate: "₱1,500.00" },
      { category: "PFM", rate: "₱10,000.00" }
    ]
  },
  {
    id: "4",
    name: "Crowns",
    description: "Dental crown procedures",
    rates: [
      { category: "PFM JLITE", rate: "₱1,500.00" },
      { category: "ZIRCONIA", rate: "₱25,000 / ₱30,000" }
    ]
  },
  {
    id: "5",
    name: "Dentures",
    description: "Complete and partial denture services",
    rates: [
      { category: "NEW ACE CD", rate: "₱35,000 / ₱40,000" },
      { category: "NATURA CD", rate: "₱50,000.00" },
      { category: "POSTERIOR/ANTERIOR PER ARCH", rate: "₱15,000 - ₱18,000" }
    ]
  },
  {
    id: "6",
    name: "High Polish",
    description: "Denture polishing service",
    rates: [
      { category: "Standard Service", rate: "Contact for pricing" }
    ]
  },
  {
    id: "7",
    name: "Acrylic",
    description: "Acrylic denture and appliances",
    rates: [
      { category: "COMPLETE DENTURE PER ARCH", rate: "₱20,000.00" },
      { category: "RPD POS/ANT", rate: "₱10,000.00" },
      { category: "IVOCAP PER ARCH", rate: "₱6,000.00" },
      { category: "IVOSTAR CD", rate: "₱9,000.00" }
    ]
  },
  {
    id: "8",
    name: "Veneers",
    description: "Cosmetic veneer treatments",
    rates: [
      { category: "COMPOSITE", rate: "₱800 / ₱1,000" },
      { category: "W/ HMO PVT", rate: "₱10,000 / ₱15,000" }
    ]
  },
  {
    id: "9",
    name: "Whitening",
    description: "Professional teeth whitening",
    rates: [
      { category: "Standard Treatment", rate: "₱15,000 / ₱20,000" }
    ]
  },
  {
    id: "10",
    name: "Retainers",
    description: "Orthodontic retainer services",
    rates: [
      { category: "HAWLEY PER ARCH", rate: "₱6,000.00" },
      { category: "HAWLEY W/ PONTIC PER ARCH", rate: "Contact for pricing" },
      { category: "WRAP AROUND", rate: "Contact for pricing" },
      { category: "PONTIC FIXED", rate: "Contact for pricing" }
    ]
  },
  {
    id: "11",
    name: "Braces",
    description: "Orthodontic braces treatment",
    rates: [
      { category: "Treatment Plan", rate: "Check patient file" }
    ]
  }
];

export const serviceCategories = [
  "All Services",
  "Cleaning & Prevention",
  "Restorative",
  "Cosmetic",
  "Orthodontics",
  "Prosthetics"
];
