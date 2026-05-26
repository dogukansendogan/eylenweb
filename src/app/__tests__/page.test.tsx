import { render } from '@testing-library/react';
import Home from '../page';

// Mock the child components to simplify the test and avoid rendering the entire tree
jest.mock('@/components/Hero', () => () => <div data-testid="hero-component">Hero</div>);
jest.mock('@/components/FeaturedVillas', () => () => <div data-testid="featured-villas-component">FeaturedVillas</div>);
jest.mock('@/components/Features', () => () => <div data-testid="features-component">Features</div>);
jest.mock('@/components/Locations', () => () => <div data-testid="locations-component">Locations</div>);
jest.mock('@/components/CTA', () => () => <div data-testid="cta-component">CTA</div>);
jest.mock('@/components/Footer', () => () => <div data-testid="footer-component">Footer</div>);

describe('Home Page', () => {
  it('renders all main sections successfully', () => {
    const { getByTestId } = render(<Home />);
    
    // Check if all mocked child components are rendered
    expect(getByTestId('hero-component')).toBeInTheDocument();
    expect(getByTestId('featured-villas-component')).toBeInTheDocument();
    expect(getByTestId('features-component')).toBeInTheDocument();
    expect(getByTestId('locations-component')).toBeInTheDocument();
    expect(getByTestId('cta-component')).toBeInTheDocument();
    expect(getByTestId('footer-component')).toBeInTheDocument();
  });
});
