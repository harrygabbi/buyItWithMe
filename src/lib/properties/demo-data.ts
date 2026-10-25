import type { Property } from "@/types/property";
export function createDemoProperties(now = new Date()): Property[] {
  const time = (days: number) =>
    new Date(now.getTime() + days * 86400000).toISOString();
  return [
    {
      id: "demo-cedar",
      address: "2847 Cedar Crescent, Vancouver, BC",
      propertyType: "Detached house",
      askingPrice: 2480000,
      bedrooms: 4,
      bathrooms: 3.5,
      squareFeet: 2860,
      lotSize: 6100,
      yearBuilt: 2018,
      listingNumber: "R2948721",
      description:
        "A light-filled family home with considered finishes, an open kitchen, and a private garden in the heart of Shaughnessy.",
      published: true,
      isDemo: true,
      image: "/images/house.jpg",
      nextOpenHouse: time(2),
      createdAt: time(-10),
      updatedAt: time(0),
    },
    {
      id: "demo-pacific",
      address: "1204–1288 Pacific Boulevard, Vancouver, BC",
      propertyType: "Condo",
      askingPrice: 895000,
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 945,
      yearBuilt: 2012,
      listingNumber: "R2948106",
      description:
        "Contemporary Yaletown living with expansive windows, a thoughtful layout, and a covered balcony.",
      published: false,
      isDemo: true,
      image: "/images/condo.jpg",
      nextOpenHouse: time(4),
      createdAt: time(-8),
      updatedAt: time(-1),
    },
    {
      id: "demo-lynn",
      address: "18–1550 Lynn Valley Road, North Vancouver, BC",
      propertyType: "Townhouse",
      askingPrice: 1249000,
      bedrooms: 3,
      bathrooms: 2.5,
      published: false,
      isDemo: true,
      image: "/images/townhouse.jpg",
      createdAt: time(-4),
      updatedAt: time(-2),
    },
  ];
}
