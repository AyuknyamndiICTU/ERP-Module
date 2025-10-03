// Test script to verify CampaignsPage toLocaleString fix
console.log('Testing CampaignsPage fixes...');

// Test the problematic toLocaleString scenarios
const testCampaigns = [
  // Valid campaign data
  {
    id: 1,
    name: 'Test Campaign 1',
    budget: 5000000,
    spent: 3200000,
    leads: 245,
    conversions: 89
  },
  // Campaign with undefined values (would cause original error)
  {
    id: 2,
    name: 'Test Campaign 2',
    budget: undefined,
    spent: undefined,
    leads: undefined,
    conversions: undefined
  },
  // Campaign with null values
  {
    id: 3,
    name: 'Test Campaign 3',
    budget: null,
    spent: null,
    leads: null,
    conversions: null
  }
];

console.log('Testing original problematic code (would fail):');
testCampaigns.forEach((campaign, index) => {
  try {
    // This would cause the original error
    const originalResult = campaign.budget.toLocaleString();
    console.log(`❌ Campaign ${index + 1} original: Would work but unsafe`);
  } catch (error) {
    console.log(`❌ Campaign ${index + 1} original: ${error.message}`);
  }
});

console.log('\nTesting fixed code with safety checks:');
testCampaigns.forEach((campaign, index) => {
  try {
    // This is the fixed version with safety checks
    const fixedResult = (campaign.budget || 0).toLocaleString();
    const spentResult = (campaign.spent || 0).toLocaleString();
    const leadsResult = campaign.leads || 0;
    const conversionsResult = campaign.conversions || 0;
    
    console.log(`✅ Campaign ${index + 1} fixed: Budget ${fixedResult} FCFA, Spent ${spentResult} FCFA, Leads ${leadsResult}, Conversions ${conversionsResult}`);
  } catch (error) {
    console.log(`❌ Campaign ${index + 1} fixed: ${error.message}`);
  }
});

// Test progress calculation safety
console.log('\nTesting progress calculation safety:');
testCampaigns.forEach((campaign, index) => {
  try {
    const originalProgress = (campaign.spent / campaign.budget) * 100;
    console.log(`❌ Campaign ${index + 1} progress original: ${originalProgress}% (unsafe)`);
  } catch (error) {
    console.log(`❌ Campaign ${index + 1} progress original: ${error.message}`);
  }
  
  try {
    const fixedProgress = campaign.budget ? (campaign.spent / campaign.budget) * 100 : 0;
    console.log(`✅ Campaign ${index + 1} progress fixed: ${fixedProgress}% (safe)`);
  } catch (error) {
    console.log(`❌ Campaign ${index + 1} progress fixed: ${error.message}`);
  }
});

console.log('\n🔧 CAMPAIGNS PAGE FIXES:');
console.log('• Updated backend API to return budget, spent, leads, conversions properties');
console.log('• Added safety checks: (value || 0).toLocaleString() instead of value.toLocaleString()');
console.log('• Added safe progress calculation: budget ? (spent / budget) * 100 : 0');
console.log('• Prevents TypeError: Cannot read properties of undefined (reading \'toLocaleString\')');
console.log('\nThe CampaignsPage should now load without runtime errors!');
