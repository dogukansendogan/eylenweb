import { render, screen, waitFor } from '@testing-library/react';
import VillalarList from '../VillalarList';
import * as villaService from '@/firebase/villaService';
import * as locationService from '@/firebase/locationService';
import * as navigation from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

// Mock services
jest.mock('@/firebase/villaService', () => ({
  getVillalar: jest.fn(),
}));

jest.mock('@/firebase/locationService', () => ({
  getLocations: jest.fn(),
}));

// Mock VillaCard to avoid testing the card logic here
jest.mock('../VillaCard', () => {
  return function MockVillaCard({ villa }: { villa: any }) {
    return <div data-testid="villa-card">{villa.ad}</div>;
  };
});

describe('VillalarList Component', () => {
  beforeEach(() => {
    // Default mocks
    (navigation.useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });
    
    (locationService.getLocations as jest.Mock).mockResolvedValue([
      { id: '1', name: 'Kalkan' },
      { id: '2', name: 'Fethiye' },
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', async () => {
    // Delay resolution to catch loading state
    (villaService.getVillalar as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([]), 100)));
    
    render(<VillalarList />);
    
    // Check for the loading spinner (it's a div with animate-spin)
    const spinners = document.getElementsByClassName('animate-spin');
    expect(spinners.length).toBeGreaterThan(0);
  });

  it('renders a list of villas when data is fetched', async () => {
    const mockVillas = [
      { id: '1', ad: 'Villa Deniz', konum: 'Kalkan', fiyat: 5000 },
      { id: '2', ad: 'Villa Orman', konum: 'Fethiye', fiyat: 4000 },
    ];
    
    (villaService.getVillalar as jest.Mock).mockResolvedValue(mockVillas);
    
    render(<VillalarList />);
    
    // Wait for the loading to finish and villas to appear
    await waitFor(() => {
      const villaCards = screen.getAllByTestId('villa-card');
      expect(villaCards.length).toBe(2);
    });
    
    expect(screen.getByText('Villa Deniz')).toBeInTheDocument();
    expect(screen.getByText('Villa Orman')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 lüks villa bulundu
  });

  it('shows "not found" message when no villas match', async () => {
    (villaService.getVillalar as jest.Mock).mockResolvedValue([]);
    
    render(<VillalarList />);
    
    await waitFor(() => {
      expect(screen.getByText(/Aramanıza uygun lüks villa bulunamadı/i)).toBeInTheDocument();
    });
  });

  it('shows error message on fetch failure', async () => {
    (villaService.getVillalar as jest.Mock).mockRejectedValue(new Error('Firebase error'));
    
    render(<VillalarList />);
    
    await waitFor(() => {
      expect(screen.getByText(/Villalar yüklenirken bir hata oluştu/i)).toBeInTheDocument();
    });
  });
});
