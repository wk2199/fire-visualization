import React from 'react';

// Define state regions
const stateRegions = {
  Eastern: ['CT', 'DE', 'FL', 'GA', 'ME', 'MD', 'MA', 'NH', 'NJ', 'NY', 'NC', 'PA', 'RI', 'SC', 'VT', 'VA', 'WV'],
  Central: ['AL', 'AR', 'IL', 'IN', 'IA', 'KY', 'LA', 'MI', 'MN', 'MS', 'MO', 'OH', 'OK', 'TN', 'TX', 'WI'],
  Western: ['AK', 'AZ', 'CA', 'CO', 'HI', 'ID', 'KS', 'MT', 'NE', 'NV', 'NM', 'ND', 'OR', 'SD', 'UT', 'WA', 'WY'],
};

const StateDropdown = ({ onSelectRegion }) => {
  const handleRegionChange = (e) => {
    const region = e.target.value;
    onSelectRegion(region);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <select onChange={handleRegionChange}>
        <option value="">Select Region</option>
        {Object.keys(stateRegions).map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StateDropdown;
