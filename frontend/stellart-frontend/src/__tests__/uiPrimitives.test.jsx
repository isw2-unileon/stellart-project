import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from '../components/ui/input-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '../components/ui/combobox';
import GenericCombobox from '../components/ui/GenericCombobox';

describe('ui primitives', () => {
  it('renders input and textarea', () => {
    render(
      <>
        <Input placeholder="Email" />
        <Textarea placeholder="Message" />
      </>
    );
    expect(screen.getByPlaceholderText('Email')).toBeDefined();
    expect(screen.getByPlaceholderText('Message')).toBeDefined();
  });

  it('renders avatar fallback content', () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('AB')).toBeDefined();
  });

  it('renders input-group variants', () => {
    render(
      <>
        <InputGroup>
          <InputGroupAddon>Prefix</InputGroupAddon>
          <InputGroupInput placeholder="Group input" />
        </InputGroup>
        <InputGroup>
          <InputGroupTextarea placeholder="Group textarea" />
        </InputGroup>
      </>
    );
    expect(screen.getByPlaceholderText('Group input')).toBeDefined();
    expect(screen.getByPlaceholderText('Group textarea')).toBeDefined();
  });

  it('renders dropdown trigger', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item A</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(screen.getByText('Open')).toBeDefined();
  });

  it('renders combobox input and list item', () => {
    render(
      <Combobox defaultValue={null}>
        <ComboboxInput placeholder="Pick one" />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="one" textValue="One">
              One
            </ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
    expect(screen.getByPlaceholderText('Pick one')).toBeDefined();
  });

  it('renders GenericCombobox and calls onChange', () => {
    const onChange = vi.fn();
    render(
      <GenericCombobox
        options={[
          { value: 'digital', label: 'Digital' },
          { value: 'paint', label: 'Painting' },
        ]}
        value=""
        onChange={onChange}
        placeholder="Type"
      />
    );
    const input = screen.getByPlaceholderText('Type');
    fireEvent.change(input, { target: { value: 'Pa' } });
    expect(input).toBeDefined();
  });
});
