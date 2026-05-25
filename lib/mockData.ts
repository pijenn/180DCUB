export type ProductType = 'DECK' | 'CASEBOOK' | 'MENTORING';

export interface Product {
  id: string;
  type: ProductType;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  file_url?: string;
  owner?: string;
}

export interface MentoringSchedule {
  id: string;
  product_id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  locked_until: string | null;
}

export const mockProducts: Product[] = [
  {
    id: '1',
    type: 'DECK',
    name: 'Consulting 101 Deck',
    description: 'Learn the basics of consulting with this comprehensive deck.',
    price: 150000,
    image_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop',
    category: 'Competition',
    owner: 'John Doe',
  },
  {
    id: '2',
    type: 'DECK',
    name: 'Advanced Frameworks',
    description: 'Deep dive into advanced business frameworks.',
    price: 200000,
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
    category: 'Career',
    owner: 'Jane Smith',
  },
  {
    id: '3',
    type: 'CASEBOOK',
    name: 'Tech Strategy Casebook',
    description: 'Practice tech strategy cases with real-world examples.',
    price: 100000,
    image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop',
    category: 'BCC',
  },
  {
    id: '4',
    type: 'CASEBOOK',
    name: 'Finance Casebook',
    description: 'Master finance and M&A cases.',
    price: 120000,
    image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2072&auto=format&fit=crop',
    category: 'Prof',
  },
  {
    id: '5',
    type: 'MENTORING',
    name: '1-on-1 with Senior Consultant',
    description: 'Get personalized feedback and guidance from an experienced consultant.',
    price: 300000,
    image_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1974&auto=format&fit=crop',
    category: 'Career',
  },
  {
    id: '6',
    type: 'MENTORING',
    name: 'Mock Case Interview',
    description: 'Practice a case interview with a peer or mentor.',
    price: 250000,
    image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop',
    category: 'Competition',
  }
];

export const mockSchedules: MentoringSchedule[] = [
  {
    id: 's1',
    product_id: '5',
    start_time: '2025-06-01T10:00:00Z',
    end_time: '2025-06-01T11:00:00Z',
    is_booked: false,
    locked_until: null,
  },
  {
    id: 's2',
    product_id: '5',
    start_time: '2025-06-01T14:00:00Z',
    end_time: '2025-06-01T15:00:00Z',
    is_booked: false,
    locked_until: null,
  },
  {
    id: 's3',
    product_id: '6',
    start_time: '2025-06-02T13:00:00Z',
    end_time: '2025-06-02T14:00:00Z',
    is_booked: true,
    locked_until: null,
  }
];
