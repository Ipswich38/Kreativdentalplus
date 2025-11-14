export interface RateStructure {
  type: "commission" | "basic" | "mixed";
  basicRate?: {
    description: string;
    amount: number;
  }[];
  commissions?: {
    service: string;
    rate: string;
  }[];
}

export interface Dentist {
  id: string;
  name: string;
  title: string;
  specialty: string;
  email: string;
  phone: string;
  status: "active" | "on-leave" | "inactive";
  rateStructure: RateStructure;
}

export const dentists: Dentist[] = [
  {
    id: "1",
    name: "DRA. CAMILA CAÑARES-PRICE",
    title: "General Dentist",
    specialty: "Owner & Founder",
    email: "camila@kreativdental.com",
    phone: "+1 234-567-8901",
    status: "active",
    rateStructure: {
      type: "commission",
      commissions: [
        { service: "For all services", rate: "Owner" }
      ]
    }
  },
  {
    id: "2",
    name: "DR. JEROME OH",
    title: "Oral Surgeon",
    specialty: "Endodontics Specialist",
    email: "jerome@kreativdental.com",
    phone: "+1 234-567-8902",
    status: "active",
    rateStructure: {
      type: "mixed",
      basicRate: [
        { description: "If there is NO SURGERY performed & for REFERRALS", amount: 1500 },
        { description: "If the procedure EXCEEDS 3 hours", amount: 750 },
        { description: "For days with SURGICAL CASES charged at 35% & RCT and crowns", amount: 0 }
      ],
      commissions: [
        { service: "OP & Resto", rate: "10%" },
        { service: "Simple Extractions", rate: "15%" },
        { service: "Surgical Cases (If Dr. On consultant)", rate: "35%" },
        { service: "Root Canal Treatment & Crowns (If Dr. on consultant)", rate: "30%" },
        { service: "Referrals from associates for surgical cases, RCT, prostho", rate: "25%" }
      ]
    }
  },
  {
    id: "3",
    name: "DRA. CLENCY",
    title: "Pediatric Dentist",
    specialty: "Pediatric Dentistry",
    email: "clency@kreativdental.com",
    phone: "+1 234-567-8903",
    status: "active",
    rateStructure: {
      type: "commission",
      commissions: [
        { service: "For all services", rate: "40%" }
      ]
    }
  },
  {
    id: "4",
    name: "DRA. FATIMA PORCIUNCULA",
    title: "Orthodontist",
    specialty: "Orthodontics",
    email: "fatima@kreativdental.com",
    phone: "+1 234-567-8904",
    status: "active",
    rateStructure: {
      type: "mixed",
      basicRate: [
        { description: "Basic per day (Ortho patients)", amount: 2000 },
        { description: "Basic per day (GP/PMO)", amount: 1500 }
      ],
      commissions: [
        { service: "New case", rate: "20%" },
        { service: "Old patient ortho", rate: "10%" },
        { service: "All general dentistry (GP/PMO)", rate: "10%" },
        { service: "Xray (per shot)", rate: "50" }
      ]
    }
  },
  {
    id: "5",
    name: "DRA. FEVI STELLA TORRALBA-PIO",
    title: "General Dentist",
    specialty: "General Dentistry",
    email: "fevi@kreativdental.com",
    phone: "+1 234-567-8905",
    status: "active",
    rateStructure: {
      type: "mixed",
      basicRate: [
        { description: "Basic per day", amount: 1800 }
      ],
      commissions: [
        { service: "General Procedures (OP, resto, EXO, fluoride)", rate: "15%" },
        { service: "RCT/Surgery/Prostho", rate: "20%" },
        { service: "Pediatric Referral", rate: "5%" },
        { service: "Xray (per shot)", rate: "50" }
      ]
    }
  },
  {
    id: "6",
    name: "DR. JONATHAN PINEDA",
    title: "TMJ Specialist",
    specialty: "TMJ Disorders",
    email: "jonathan@kreativdental.com",
    phone: "+1 234-567-8906",
    status: "active",
    rateStructure: {
      type: "commission",
      commissions: [
        { service: "For all services", rate: "50%" }
      ]
    }
  },
  {
    id: "7",
    name: "DR. FELIPE SUPILANA",
    title: "Implant Specialist",
    specialty: "Dental Implant Specialist",
    email: "felipe@kreativdental.com",
    phone: "+1 234-567-8907",
    status: "active",
    rateStructure: {
      type: "commission",
      commissions: [
        { service: "For all services", rate: "45%" }
      ]
    }
  },
  {
    id: "8",
    name: "DRA. SHIRLEY BAYOG",
    title: "Cosmetic Dentist",
    specialty: "Cosmetic Dentistry",
    email: "shirley@kreativdental.com",
    phone: "+1 234-567-8908",
    status: "active",
    rateStructure: {
      type: "mixed",
      basicRate: [
        { description: "Basic per day", amount: 1500 }
      ],
      commissions: [
        { service: "OP, resto, fluoride, EXO", rate: "10%" },
        { service: "Prostho (Crowns, Endo, Simple Surgery)", rate: "20%" },
        { service: "Referral Fee (TMJ & Surgery cases)", rate: "500" },
        { service: "Xray (per shot)", rate: "50" }
      ]
    }
  }
];