import { render, screen } from '@testing-library/react';
import VillaCard from '../VillaCard';

// Mock the next/image component since it's not supported in standard Jest DOM environment
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ priority, fill, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />
  },
}));

const mockVilla = {
  id: 'test-villa-1',
  ad: 'Villa Test',
  konum: 'Kalkan, Antalya',
  fiyat: 5000,
  kapasite: 6,
  yatak: 3,
  resimler: ['https://example.com/test-image.jpg'],
  ozellikler: ['Lüks Villa'],
  havuzVar: true,
  mustakilMi: true,
  barbekuVar: true,
  belgeNo: '12345',
  fiyatlar: {
    mayis: 5000,
    haziran: 7000
  }
};

describe('VillaCard Component', () => {
  it('renders villa title correctly', () => {
    render(<VillaCard villa={mockVilla} />);
    
    // Check if the title is in the document
    const titleElements = screen.getAllByText('Villa Test');
    expect(titleElements.length).toBeGreaterThan(0);
  });

  it('displays the correct location', () => {
    render(<VillaCard villa={mockVilla} />);
    
    expect(screen.getByText('Kalkan, Antalya')).toBeInTheDocument();
  });

  it('calculates and displays the lowest price correctly', () => {
    render(<VillaCard villa={mockVilla} />);
    
    // It should pick 5000 from the fiyatlar object
    expect(screen.getByText('₺5.000')).toBeInTheDocument();
  });

  it('renders features based on villa properties', () => {
    render(<VillaCard villa={mockVilla} />);
    
    expect(screen.getByText('Özel Havuz')).toBeInTheDocument();
    expect(screen.getByText('Müstakil Villa')).toBeInTheDocument();
    expect(screen.getByText('Barbekü')).toBeInTheDocument();
    expect(screen.getByText('Belgeli')).toBeInTheDocument();
  });

  it('displays correct capacity and beds', () => {
    render(<VillaCard villa={mockVilla} />);
    
    expect(screen.getByText('6 Kişi')).toBeInTheDocument();
    expect(screen.getByText('3 Yatak Odası')).toBeInTheDocument();
  });

  it('handles missing price gracefully', () => {
    const noPriceVilla = { ...mockVilla, fiyat: 0, fiyatlar: undefined };
    render(<VillaCard villa={noPriceVilla} />);
    
    expect(screen.getByText('Fiyat İsteyin')).toBeInTheDocument();
  });
});
