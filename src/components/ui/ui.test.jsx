import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './button.jsx'
import { Chip } from './chip.jsx'
import { Input } from './input.jsx'

describe('Button', () => {
  it('calls onClick and does nothing when disabled', async () => {
    const onClick = vi.fn()
    const { rerender } = render(<Button onClick={onClick}>Create universe</Button>)

    await userEvent.click(screen.getByRole('button', { name: 'Create universe' }))
    expect(onClick).toHaveBeenCalledTimes(1)

    rerender(<Button onClick={onClick} disabled>Create universe</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Create universe' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('Chip', () => {
  it('toggles its pressed state', async () => {
    function Harness() {
      const [selected, setSelected] = useState(false)
      return <Chip selected={selected} onSelectedChange={setSelected}>Streetwear</Chip>
    }
    render(<Harness />)
    const chip = screen.getByRole('button', { name: 'Streetwear' })

    expect(chip).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(chip)
    expect(chip).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('Input', () => {
  it('links the label, counts characters and announces the error', () => {
    render(<Input label="Universe name" value="Dark Academia" maxLength={255} onChange={() => {}} error="The name is required." />)
    const input = screen.getByLabelText('Universe name')

    expect(screen.getByText('13 / 255')).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('The name is required.')
  })
})
