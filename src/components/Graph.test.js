import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Graph from './Graph';

describe('Graph Component', () => {
  // Sample data for testing
  const mockNodes = [
    { id: 'Node1' },
    { id: 'Node2' },
    { id: 'Node3' }
  ];

  const mockEdges = [
    { source: 'Node1', target: 'Node2' },
    { source: 'Node2', target: 'Node3' }
  ];

  test('renders SVG with correct dimensions', () => {
    render(<Graph nodes={mockNodes} edges={mockEdges} />);
    
    const svgElement = screen.getByRole('graphics-document');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute('width', '800');
    expect(svgElement).toHaveAttribute('height', '500');
  });

  test('renders correct number of nodes', () => {
    render(<Graph nodes={mockNodes} edges={mockEdges} />);
    
    const nodeElements = screen.getAllByRole('graphics-symbol');
    expect(nodeElements).toHaveLength(mockNodes.length);
  });

  test('renders node labels', () => {
    render(<Graph nodes={mockNodes} edges={mockEdges} />);
    
    mockNodes.forEach(node => {
      const label = screen.getByText(node.id);
      expect(label).toBeInTheDocument();
    });
  });

  test('handles empty data', () => {
    render(<Graph nodes={[]} edges={[]} />);
    
    const svgElement = screen.getByRole('graphics-document');
    expect(svgElement).toBeInTheDocument();
  });
}); 