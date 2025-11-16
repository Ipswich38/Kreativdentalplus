import React from 'react';

export const HelpPage: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Help & Support</h1>
      <p>This is the help page. Information on how to use the application will be displayed here.</p>
      <p>For assistance, please contact support at <a href="mailto:support@kreativdental.com" style={{ color: 'blue' }}>support@kreativdental.com</a>.</p>
    </div>
  );
};