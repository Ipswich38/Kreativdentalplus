import React from 'react';

interface PageWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageWrapper({ title, subtitle, children, actions }: PageWrapperProps) {
  return (
    <div className="donezo-dashboard">
      {/* Page Header */}
      <div className="donezo-dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <div>
            <h1 className="donezo-dashboard-title">{title}</h1>
            {subtitle && <p className="donezo-dashboard-subtitle">{subtitle}</p>}
          </div>
          {actions && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
}