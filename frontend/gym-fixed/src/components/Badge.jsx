import React from 'react';

const VARIANT_MAP = {
  active:    'badge-active',
  inactive:  'badge-inactive',
  pending:   'badge-pending',
  confirmed: 'badge-active',
  completed: 'badge-active',
  cancelled: 'badge-inactive',
  info:      'badge-info',
  card:      'badge-info',
  cash:      'badge-pending',
  online:    'badge-active',
  approved:  'badge-active',
  rejected:  'badge-inactive',
};

export default function Badge({ variant = 'info', children }) {
  const cls = VARIANT_MAP[variant?.toLowerCase()] || 'badge-info';
  return <span className={`badge ${cls}`}>{children}</span>;
}
