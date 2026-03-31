'use client';

import { useState } from 'react';
import { EconomicIndicator } from '@/lib/types';
import { CATEGORY_LABELS, CATEGORY_ICONS, getUniqueCategories } from '@/lib/indicators-config';
import IndicatorCard from './IndicatorCard';

interface IndicatorsGridProps {
  indicators: EconomicIndicator[];
}

export default function IndicatorsGrid({ indicators }: IndicatorsGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = getUniqueCategories();

  const filtered =
    activeCategory === 'all'
      ? indicators
      : indicators.filter((ind) => ind.category === activeCategory);

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-text-primary font-semibold text-base">经济指标概览</h2>
        <span className="text-text-muted text-xs">{filtered.length} 项指标</span>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 text-xs rounded border transition-colors ${
            activeCategory === 'all'
              ? 'bg-accent-blue/20 text-accent-blue border-accent-blue/40'
              : 'text-text-secondary border-dashboard-border hover:border-dashboard-border-light hover:text-text-primary'
          }`}
        >
          全部 ({indicators.length})
        </button>
        {categories.map((cat) => {
          const count = indicators.filter((i) => i.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                activeCategory === cat
                  ? 'bg-accent-blue/20 text-accent-blue border-accent-blue/40'
                  : 'text-text-secondary border-dashboard-border hover:border-dashboard-border-light hover:text-text-primary'
              }`}
            >
              {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat] || cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
        {filtered.map((indicator) => (
          <IndicatorCard
            key={indicator.id}
            indicator={indicator}
            isExpanded={expandedId === indicator.id}
            onToggleExpand={() => handleToggleExpand(indicator.id)}
          />
        ))}
      </div>
    </section>
  );
}
