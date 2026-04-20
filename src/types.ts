/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CSSProperties } from 'react';

export interface SlideElement {
  id: string;
  type: 'text' | 'shape' | 'image';
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
  content?: string;
  className?: string;
  style?: CSSProperties;
}

export interface Slide {
  id: string;
  elements: SlideElement[];
  background: string;
  notes?: string;
  transition?: 'fade' | 'slide' | 'zoomX' | 'none';
}

export type PresentationMode = 'edit' | 'present';
