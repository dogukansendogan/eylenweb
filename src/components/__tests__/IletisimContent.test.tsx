import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IletisimContent from '../IletisimContent';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ priority, fill, sizes, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />
  },
}));

// Mock Footer
jest.mock('@/components/Footer', () => () => <div data-testid="footer-component">Footer</div>);

describe('IletisimContent Component', () => {
  it('renders contact information', () => {
    render(<IletisimContent />);
    
    expect(screen.getByText('+90 532 123 45 67')).toBeInTheDocument();
    expect(screen.getByText('info@egleniyoruzvillam.com')).toBeInTheDocument();
    expect(screen.getByText(/Yalıkavak Mah/)).toBeInTheDocument();
  });

  it('renders the contact form', () => {
    render(<IletisimContent />);
    
    expect(screen.getByLabelText(/Adınız Soyadınız/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-posta Adresiniz/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Telefon Numaranız/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Konu/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mesajınız/i)).toBeInTheDocument();
    
    const submitButton = screen.getByRole('button', { name: /Mesajı Gönder/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('shows success message after successful form submission', async () => {
    render(<IletisimContent />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Adınız Soyadınız/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/E-posta Adresiniz/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Mesajınız/i), { target: { value: 'Hello world' } });
    fireEvent.change(screen.getByLabelText(/Konu/i), { target: { value: 'info' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Mesajı Gönder/i });
    fireEvent.click(submitButton);
    
    // Should show loading state
    expect(screen.getByText(/Gönderiliyor/i)).toBeInTheDocument();
    
    // Wait for submission to complete (the component has a 1.5s delay)
    await waitFor(() => {
      expect(screen.getByText(/Mesajınız Alındı!/i)).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Check if the form is hidden and the new message button is visible
    expect(screen.queryByLabelText(/Adınız Soyadınız/i)).not.toBeInTheDocument();
    
    // Click "Yeni Mesaj Gönder" to show form again
    fireEvent.click(screen.getByRole('button', { name: /Yeni Mesaj Gönder/i }));
    expect(screen.getByLabelText(/Adınız Soyadınız/i)).toBeInTheDocument();
  });
});
