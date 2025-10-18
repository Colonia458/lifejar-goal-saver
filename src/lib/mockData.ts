export interface Jar {
  id: string;
  title: string;
  image?: string;
  currentAmount: number;
  targetAmount: number;
  deadline?: string;
  contributors: Contributor[];
}

export interface Contributor {
  name: string;
  amount: number;
  date: string;
}

export const mockJars: Jar[] = [
  {
    id: "1",
    title: "Emergency Fund",
    currentAmount: 45000,
    targetAmount: 100000,
    deadline: "2025-12-31",
    contributors: [
      { name: "You", amount: 35000, date: "2025-01-15" },
      { name: "Sarah K.", amount: 5000, date: "2025-01-20" },
      { name: "John M.", amount: 5000, date: "2025-02-01" },
    ],
  },
  {
    id: "2",
    title: "New Laptop",
    currentAmount: 25000,
    targetAmount: 80000,
    deadline: "2025-06-30",
    contributors: [
      { name: "You", amount: 20000, date: "2025-01-10" },
      { name: "Mom", amount: 5000, date: "2025-01-25" },
    ],
  },
  {
    id: "3",
    title: "Vacation to Mombasa",
    currentAmount: 60000,
    targetAmount: 150000,
    deadline: "2025-08-15",
    contributors: [
      { name: "You", amount: 40000, date: "2025-01-05" },
      { name: "Alex W.", amount: 10000, date: "2025-01-18" },
      { name: "Grace N.", amount: 10000, date: "2025-02-03" },
    ],
  },
];

export const getJarById = (id: string): Jar | undefined => {
  return mockJars.find((jar) => jar.id === id);
};
