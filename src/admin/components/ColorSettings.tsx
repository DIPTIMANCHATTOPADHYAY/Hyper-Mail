import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { ThemeColors } from '../../types';
import { settingsService } from '../../services/settingsService';

interface ColorSettingsProps {
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  onUpdate: (colors: { light: ThemeColors; dark: ThemeColors }) => void;
}

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

function ColorInput({ label, value, onChange, description }: ColorInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="flex gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-20 rounded border border-[var(--border)] bg-[var(--bg-secondary)] p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
        />
      </div>
      {description && (
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
      )}
    </div>
  );
}

export function ColorSettings({ colors, onUpdate }: ColorSettingsProps) {
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>('light');
  const defaultColors = settingsService.getDefaultColors();

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    onUpdate({
      ...colors,
      [activeTheme]: {
        ...colors[activeTheme],
        [key]: value
      }
    });
  };

  const handleResetTheme = () => {
    onUpdate({
      ...colors,
      [activeTheme]: defaultColors[activeTheme]
    });
  };

  return (
    <div className="space-y-6">
      {/* Theme Selector */}
      <div className="flex gap-4 p-4 bg-[var(--bg-secondary)]/50 rounded-lg">
        <button
          onClick={() => setActiveTheme('light')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTheme === 'light'
              ? 'bg-[var(--accent)] text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
          }`}
        >
          <Sun className="w-4 h-4" />
          Light Theme
        </button>
        <button
          onClick={() => setActiveTheme('dark')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTheme === 'dark'
              ? 'bg-[var(--accent)] text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
          }`}
        >
          
          <Moon className="w-4 h-4" />
          Dark Theme
        </button>
        <button
          onClick={handleResetTheme}
          className="ml-auto px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
        >
          Reset Theme
        </button>
      </div>

      {/* Color Inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Background Colors</h3>
          <ColorInput
            label="Primary Background"
            value={colors[activeTheme].bgPrimary}
            onChange={(value) => handleColorChange('bgPrimary', value)}
            description="Main background color of the application"
          />
          <ColorInput
            label="Secondary Background"
            value={colors[activeTheme].bgSecondary}
            onChange={(value) => handleColorChange('bgSecondary', value)}
            description="Background color for cards and elevated elements"
          />
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Text Colors</h3>
          <ColorInput
            label="Primary Text"
            value={colors[activeTheme].textPrimary}
            onChange={(value) => handleColorChange('textPrimary', value)}
            description="Main text color"
          />
          <ColorInput
            label="Secondary Text"
            value={colors[activeTheme].textSecondary}
            onChange={(value) => handleColorChange('textSecondary', value)}
            description="Color for less important text"
          />
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Accent Colors</h3>
          <ColorInput
            label="Accent"
            value={colors[activeTheme].accent}
            onChange={(value) => handleColorChange('accent', value)}
            description="Primary brand color"
          />
          <ColorInput
            label="Accent Hover"
            value={colors[activeTheme].accentHover}
            onChange={(value) => handleColorChange('accentHover', value)}
            description="Hover state for accent color"
          />
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold">UI Colors</h3>
          <ColorInput
            label="Border"
            value={colors[activeTheme].border}
            onChange={(value) => handleColorChange('border', value)}
            description="Color for borders and dividers"
          />
          <ColorInput
            label="Button Background"
            value={colors[activeTheme].buttonBg}
            onChange={(value) => handleColorChange('buttonBg', value)}
            description="Default button background color"
          />
          <ColorInput
            label="Button Hover"
            value={colors[activeTheme].buttonHover}
            onChange={(value) => handleColorChange('buttonHover', value)}
            description="Button hover background color"
          />
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Status Colors</h3>
          <ColorInput
            label="Danger"
            value={colors[activeTheme].danger}
            onChange={(value) => handleColorChange('danger', value)}
            description="Color for dangerous actions"
          />
          <ColorInput
            label="Danger Hover"
            value={colors[activeTheme].dangerHover}
            onChange={(value) => handleColorChange('dangerHover', value)}
            description="Hover state for danger color"
          />
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Effects</h3>
          <ColorInput
            label="Shadow Color"
            value={colors[activeTheme].shadowColor}
            onChange={(value) => handleColorChange('shadowColor', value)}
            description="Color for box shadows (supports opacity)"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        <div className="p-6 rounded-lg" style={{ backgroundColor: colors[activeTheme].bgPrimary }}>
          <div className="p-4 rounded-lg" style={{ backgroundColor: colors[activeTheme].bgSecondary }}>
            <h4 style={{ color: colors[activeTheme].textPrimary }}>Sample Content</h4>
            <p style={{ color: colors[activeTheme].textSecondary }}>
              This is how your theme colors will look in the application.
            </p>
            <div className="flex gap-3 mt-4">
              <button
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: colors[activeTheme].accent }}
              >
                Primary Button
              </button>
              <button
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: colors[activeTheme].buttonBg }}
              >
                Secondary Button
              </button>
              <button
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: colors[activeTheme].danger }}
              >
                Danger Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}