import { render, screen } from '@testing-library/react'
import App from './App.jsx'

describe('App', () => {
  it('shows the Grôncho logo and tagline', () => {
    render(<App />)

    expect(screen.getByText('GRÔNCHÔ')).toBeInTheDocument()
    expect(screen.getByText('Every wardrobe is a universe.')).toBeInTheDocument()
  })
})
