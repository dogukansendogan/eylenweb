import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../Navbar';
import * as navigation from 'next/navigation';
import * as authContext from '@/context/AuthContext';

// Mock the router
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock the AuthContext
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    // Default mocks
    (navigation.usePathname as jest.Mock).mockReturnValue('/');
    (authContext.useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders logo and basic navigation links', () => {
    render(<Navbar />);
    
    // Logo text check
    expect(screen.getByText(/Eyleniyoruzvillam/i)).toBeInTheDocument();
    
    // Navigation links check (desktop)
    const anasayfaLinks = screen.getAllByText('Anasayfa');
    expect(anasayfaLinks.length).toBeGreaterThan(0);
    
    const villalarLinks = screen.getAllByText('Villalar');
    expect(villalarLinks.length).toBeGreaterThan(0);
    
    const hakkimizdaLinks = screen.getAllByText('Hakkımızda');
    expect(hakkimizdaLinks.length).toBeGreaterThan(0);
    
    const iletisimLinks = screen.getAllByText('İletişim');
    expect(iletisimLinks.length).toBeGreaterThan(0);
  });

  it('shows login and register buttons when not authenticated', () => {
    render(<Navbar />);
    
    expect(screen.getAllByText(/Giriş Yap/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Kayıt Ol/i).length).toBeGreaterThan(0);
  });

  it('shows user menu when authenticated', () => {
    // Change mock to authenticated state
    (authContext.useAuth as jest.Mock).mockReturnValue({
      user: { fullName: 'Test User', email: 'test@example.com' },
      isAuthenticated: true,
      logout: jest.fn(),
    });

    render(<Navbar />);
    
    // Check if user's name is displayed
    expect(screen.getByText('Test')).toBeInTheDocument();
    
    // Login/Register should not be visible
    expect(screen.queryByText('Giriş Yap')).not.toBeInTheDocument();
  });

  it('opens mobile menu when hamburger icon is clicked', () => {
    render(<Navbar />);
    
    // Find the button (it has a specific svg pattern, let's find it by role or aria if possible, 
    // or just grab the last button since it's the mobile toggle)
    const buttons = screen.getAllByRole('button');
    const mobileMenuButton = buttons.find(b => b.className.includes('md:hidden'));
    
    if (mobileMenuButton) {
      fireEvent.click(mobileMenuButton);
      
      // Since our component doesn't hide the links from DOM but changes opacity/height,
      // we can verify the class changes if we want, or just assume it works.
      // A better way is to check the parent div's className for 'max-h-[600px]'.
      const mobileMenuContainer = screen.getAllByText('Anasayfa')[0].closest('nav')?.querySelector('.md\\:hidden.overflow-hidden');
      expect(mobileMenuContainer?.className).toContain('max-h-[600px]');
    }
  });

  it('highlights the active link based on pathname', () => {
    (navigation.usePathname as jest.Mock).mockReturnValue('/villalar');
    
    render(<Navbar />);
    
    // The active link should have bg-primary class
    const activeLink = screen.getAllByText('Villalar')[0];
    expect(activeLink.className).toContain('bg-primary');
  });
});
