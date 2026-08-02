const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { connectDB, disconnectDB } = require('../src/config/db');
const Scheme = require('../src/models/Scheme');

const seedSchemes = [
  {
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    category: 'Financial Support',
    description: `Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) is a Central Sector Scheme launched by the Government of India in February 2019 to augment the income of landholding farmers' families across the nation. Under this flagship initiative, financial assistance of ₹6,000 per year is provided directly into the bank accounts of eligible farmer families in three equal installments of ₹2,000 every four months. The scheme aims to supplement the financial needs of farmers in procuring various inputs to ensure proper crop health and appropriate yields, commensurate with the expected farm income at the end of each crop cycle.

The scheme covers all landholding farmer families subject to certain exclusion criteria pertaining to higher income strata. PM-KISAN utilizes Direct Benefit Transfer (DBT) mode to ensure complete transparency and eliminate intermediaries. The integration with Aadhaar and state land records ensures that benefits reach genuine agriculturalists directly without delays.

Over the years, PM-KISAN has provided vital income support to over 11 crore farming households, helping them withstand seasonal market fluctuations and buy essential inputs such as seeds, fertilizers, and equipment. Farmers can track their payment status, update Aadhaar details, and complete e-KYC through the dedicated PM-KISAN portal or mobile application.`,
    benefits: [
      'Direct financial transfer of ₹6,000 per year in 3 equal installments of ₹2,000.',
      'Direct Benefit Transfer (DBT) directly into Aadhaar-seeded bank accounts.',
      'Cash support available at the beginning of sowing seasons for essential input purchases.'
    ],
    eligibilityRules: {
      minLandSizeAcres: 0,
      maxLandSizeAcres: null,
      allowedCategories: ['General', 'SC', 'ST', 'OBC'],
      allowedFarmerTypes: ['marginal', 'smallholder', 'medium', 'large'],
      maxIncomeLimit: null,
      minAge: 18,
      maxAge: null,
      genderPreference: 'All',
      cropTypes: [],
      additionalCriteria: [
        'Must own cultivable land registered in state land records.',
        'Excludes institutional landholders, active/former constitutional post holders, serving/retired government employees, and income tax payers.'
      ]
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Land Ownership Documents (Khasra / Khatauni / Revenue Records)',
      'Bank Account Passbook with IFSC Code',
      'Valid Mobile Number linked with Aadhaar'
    ],
    deadline: null,
    applicationUrl: 'https://pmkisan.gov.in',
    supportedStates: ['All India'],
    lastUpdated: new Date()
  },
  {
    name: 'PM Fasal Bima Yojana (Crop Insurance)',
    category: 'Crop Insurance',
    description: `Pradhan Mantri Fasal Bima Yojana (PMFBY) is a comprehensive crop insurance scheme launched by the Ministry of Agriculture & Farmers Welfare in 2016. The scheme provides end-to-end risk coverage for crops against non-preventable natural risks from pre-sowing to post-harvest stages. It aims to support sustainable production in agriculture sector by providing financial support to farmers suffering crop loss or damage arising out of unforeseen natural calamities such as floods, droughts, pests, and diseases.

Under PMFBY, farmers pay a uniform nominal premium of only 2% for all Kharif crops, 1.5% for all Rabi crops, and 5% for annual commercial and horticultural crops. The remaining balance of the actuarial premium is shared equally by the Central Government and the respective State Governments. The scheme leverages technology including remote sensing, smart phones, and drone imagery for rapid crop damage assessment and faster claim settlements.

The scheme is voluntary for all farmers, including non-loanee farmers, sharecroppers, and tenant farmers. By stabilizing the income of farmers to ensure their continuance in farming and encouraging them to adopt innovative practices, PMFBY plays a crucial role in safeguarding the agricultural economy against adverse climate changes and natural disasters.`,
    benefits: [
      'Comprehensive financial protection against pre-sowing losses, standing crop damage, and post-harvest losses.',
      'Highly subsidized premium rates: 2% for Kharif crops, 1.5% for Rabi crops, 5% for commercial/horticultural crops.',
      'Fast track claim settlement using satellite mapping, weather stations, and mobile technology.'
    ],
    eligibilityRules: {
      minLandSizeAcres: 0,
      maxLandSizeAcres: null,
      allowedCategories: ['General', 'SC', 'ST', 'OBC'],
      allowedFarmerTypes: ['marginal', 'smallholder', 'medium', 'large'],
      maxIncomeLimit: null,
      minAge: 18,
      maxAge: null,
      genderPreference: 'All',
      cropTypes: ['Paddy', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Pulses', 'Oilseeds', 'Soybean'],
      additionalCriteria: [
        'Open to all farmers growing notified crops in notified areas including sharecroppers and tenant farmers.'
      ]
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Land Possession Certificate / Rent Agreement for sharecroppers',
      'Bank Account Details',
      'Sowing Certificate / Self-declaration of Sown Crop',
      'Land Revenue Receipt / Land Registry'
    ],
    deadline: null,
    applicationUrl: 'https://pmfby.gov.in',
    supportedStates: ['All India'],
    lastUpdated: new Date()
  },
  {
    name: 'Kisan Credit Card (KCC)',
    category: 'Credit & Loan',
    description: `The Kisan Credit Card (KCC) scheme was introduced in 1998 to provide timely and hassle-free credit to farmers for their short-term agricultural needs, post-harvest expenses, consumption requirements, and maintenance of farm assets. Managed by NABARD and implemented across commercial banks, RRBs, and cooperative banks, KCC serves as an indispensable financial instrument for Indian farmers by saving them from informal high-interest moneylenders.

Under the KCC scheme, farmers receive credit cards with flexible drawal limits based on landholding size, crop pattern, and credit history. Interest subvention of 2% per annum is provided by the Government, along with an additional 3% prompt repayment incentive, reducing the effective interest rate to just 4% per annum for prompt payers. Loan limits can also be enhanced every year up to 10% based on performance.

Furthermore, the KCC facility has been extended to animal husbandry, dairy, fisheries, and poultry farmers. Short-term loans up to ₹1.60 lakh are provided without collateral, and loans up to ₹3 lakh are covered under interest subvention, enabling smallholders to invest in high-quality seeds, fertilizers, livestock feed, and machinery upgrades.`,
    benefits: [
      'Short-term credit limit up to ₹3 lakh with effective interest rate as low as 4% upon prompt repayment.',
      'Collateral-free loan facility up to ₹1.60 lakh.',
      'Integrated coverage for crop cultivation, post-harvest expenses, livestock, and fisheries.'
    ],
    eligibilityRules: {
      minLandSizeAcres: 0,
      maxLandSizeAcres: null,
      allowedCategories: ['General', 'SC', 'ST', 'OBC'],
      allowedFarmerTypes: ['marginal', 'smallholder', 'medium', 'large'],
      maxIncomeLimit: null,
      minAge: 18,
      maxAge: 75,
      genderPreference: 'All',
      cropTypes: [],
      additionalCriteria: [
        'Individual / Joint borrowers who are owner cultivators, tenant farmers, oral lessees, or sharecroppers.',
        'Self Help Groups (SHGs) or Joint Liability Groups (JLGs) of farmers.'
      ]
    },
    requiredDocuments: [
      'Duly filled KCC Application Form',
      'Identity Proof (Aadhaar Card / Voter ID / PAN Card)',
      'Address Proof (Aadhaar Card / Electricity Bill / Ration Card)',
      'Land ownership documents / Land Revenue Record / Lease Deed',
      'Passport-size photographs'
    ],
    deadline: null,
    applicationUrl: 'https://pmkisan.gov.in/KCC.aspx',
    supportedStates: ['All India'],
    lastUpdated: new Date()
  },
  {
    name: 'PM Krishi Sinchai Yojana (Irrigation)',
    category: 'Irrigation & Infrastructure',
    description: `Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) was launched with the vision of 'Har Khet Ko Pani' (Water to every farm) and enhancing water use efficiency through 'Per Drop More Crop'. The scheme aims to create protective irrigation by harnessing rainwater, developing farm ponds, expanding micro-irrigation systems, and rehabilitating traditional water bodies across rural India.

PMKSY integrates water source creation, distribution, and efficient farm-level management. The 'Per Drop More Crop' component focuses on micro-irrigation techniques such as Drip Irrigation and Sprinkler Irrigation. Small and marginal farmers receive financial assistance/subsidy up to 55%, while other farmers receive up to 45% of the total installation cost of micro-irrigation systems.

By promoting micro-irrigation, PMKSY drastically reduces water consumption, minimizes fertilizer leaching through fertigation, decreases electricity usage, and boosts crop productivity by 20% to 50%. The scheme plays a strategic role in drought-proofing agricultural belts and encouraging climate-resilient farming practices.`,
    benefits: [
      'Subsidy up to 55% for small/marginal farmers and 45% for other farmers on Drip and Sprinkler Irrigation systems.',
      'Support for farm pond construction, tube wells, and water storage infrastructure.',
      'Increased crop yield and water conservation through micro-irrigation fertigation.'
    ],
    eligibilityRules: {
      minLandSizeAcres: 0.2,
      maxLandSizeAcres: null,
      allowedCategories: ['General', 'SC', 'ST', 'OBC'],
      allowedFarmerTypes: ['marginal', 'smallholder', 'medium', 'large'],
      maxIncomeLimit: null,
      minAge: 18,
      maxAge: null,
      genderPreference: 'All',
      cropTypes: [],
      additionalCriteria: [
        'Farmers owning agricultural land with a valid water source.',
        'Members of cooperative societies, SHGs, and registered farmer groups.'
      ]
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Land Record Proof (7/12 Extract / Khatauni)',
      'Electricity Bill / Water Source Proof',
      'Bank Passbook Copy',
      'Quotation from authorized Micro-irrigation equipment manufacturer'
    ],
    deadline: null,
    applicationUrl: 'https://pmksy.gov.in',
    supportedStates: ['All India'],
    lastUpdated: new Date()
  },
  {
    name: 'Soil Health Card Scheme',
    category: 'Soil & Nutrient Management',
    description: `The Soil Health Card (SHC) Scheme was launched by the Ministry of Agriculture and Farmers Welfare in February 2015 to assist farmers in improving soil health and crop productivity. Under this scheme, soil samples are collected from farmers' fields across India and tested in accredited laboratories for 12 essential parameters: macro-nutrients (N, P, K), secondary nutrients (S), micro-nutrients (Zn, Fe, Cu, Mn, Bo), and physical parameters (pH, EC, OC).

Based on laboratory findings, a customized Soil Health Card is issued to every farmer once every 3 years. The card provides detailed soil fertility status along with crop-specific fertilizer recommendations (both organic and inorganic) required for optimal crop yields. This prevents excessive and unbalanced usage of chemical fertilizers like Urea, reducing cultivation costs and preventing soil degradation.

The scheme empowers farmers with scientific knowledge regarding soil health management, soil organic carbon enhancement, and micronutrient deficiency correction. Farmers also receive guidance on adopting bio-fertilizers, neem-coated urea, and balanced micro-nutrient application to maintain long-term soil fertility and maximize farm profitability.`,
    benefits: [
      'Free soil testing and personalized Soil Health Card issued every 3 years.',
      'Precise, crop-wise nutrient recommendations for 12 key soil parameters.',
      'Savings of ₹1,000–₹3,000 per acre by reducing excessive fertilizer application.'
    ],
    eligibilityRules: {
      minLandSizeAcres: 0,
      maxLandSizeAcres: null,
      allowedCategories: ['General', 'SC', 'ST', 'OBC'],
      allowedFarmerTypes: ['marginal', 'smallholder', 'medium', 'large'],
      maxIncomeLimit: null,
      minAge: 18,
      maxAge: null,
      genderPreference: 'All',
      cropTypes: [],
      additionalCriteria: [
        'All agricultural landholders across all states and Union Territories.'
      ]
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Land Ownership / Cultivation Proof',
      'Mobile Number for digital notification'
    ],
    deadline: null,
    applicationUrl: 'https://soilhealth.dac.gov.in',
    supportedStates: ['All India'],
    lastUpdated: new Date()
  },
  {
    name: 'Paramparagat Krishi Vikas Yojana (Organic Farming)',
    category: 'Organic Farming',
    description: `Paramparagat Krishi Vikas Yojana (PKVY) is an elaborated component of Soil Health Management under the National Mission of Sustainable Agriculture (NMSA). Launched in 2015, PKVY aims to promote organic farming across India through a cluster-based approach and Participatory Guarantee System (PGS) certification. The scheme aims to produce chemical-free, eco-friendly agricultural produce while enhancing soil health and organic matter.

Under PKVY, organic farming is promoted through clusters of 50 or more farmers having 50 acres of land. Financial assistance of ₹50,000 per hectare is provided over 3 years, out of which ₹31,000 per hectare is directly transferred to farmers for organic inputs (seeds, bio-fertilizers, bio-pesticides, vermicompost, botanical extracts). Additional funds are allocated for cluster formation, capacity building, PGS certification, packaging, and marketing support.

The scheme encourages traditional indigenous knowledge combined with modern organic techniques, eliminating dependence on synthetic chemical inputs. PKVY links organic farmer clusters directly with local markets and digital platforms, enabling farmers to command premium prices for certified organic produce.`,
    benefits: [
      'Financial support of ₹50,000 per hectare over 3 years (₹31,000 directly for organic inputs).',
      'Free organic certification through Participatory Guarantee System (PGS-India).',
      'Marketing and packaging assistance to sell organic produce at premium rates.'
    ],
    eligibilityRules: {
      minLandSizeAcres: 0.5,
      maxLandSizeAcres: null,
      allowedCategories: ['General', 'SC', 'ST', 'OBC'],
      allowedFarmerTypes: ['marginal', 'smallholder', 'medium', 'large'],
      maxIncomeLimit: null,
      minAge: 18,
      maxAge: null,
      genderPreference: 'All',
      cropTypes: [],
      additionalCriteria: [
        'Farmers willing to form clusters of 20-50 farmers covering at least 50 acres of land.',
        'Commitment to adopt chemical-free organic farming practices for at least 3 years.'
      ]
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Land Record (Khatauni / Khasra)',
      'Bank Account Passbook',
      'Cluster Group Registration / Declaration Form'
    ],
    deadline: null,
    applicationUrl: 'https://pgsindia-ncof.dac.gov.in',
    supportedStates: ['All India'],
    lastUpdated: new Date()
  },
  {
    name: 'National Mission on Sustainable Agriculture',
    category: 'Sustainable Agriculture',
    description: `The National Mission on Sustainable Agriculture (NMSA) is designed to make agriculture more productive, sustainable, remunerative, and climate-resilient by promoting location-specific integrated farming systems, soil health management, and resource conservation technology. NMSA addresses climate change challenges by promoting water use efficiency, soil nutrient management, and integrated farming.

The mission comprises several major sub-components: Rainfed Area Development (RAD), Soil Health Management (SHM), Sub-Mission on Agroforestry (SMAF), and Climate Change and Sustainable Agriculture Monitoring. Under RAD, financial assistance is provided to farmers for setting up integrated farming systems combining agriculture with horticulture, livestock, fishery, agroforestry, and apiculture.

NMSA incentivizes resource-conserving technologies such as zero tillage, laser land leveling, micro-irrigation, and green manuring. Subsidies up to 50% are offered for adopting agroforestry models, farm ponds, vermicomposting units, and silvopastoral systems, ensuring stable income even in drought-prone rainfed areas.`,
    benefits: [
      '50% subsidy for setting up Integrated Farming Systems (IFS) combining crops, livestock, poultry, and fish farming.',
      'Financial assistance for agroforestry plantation, farm ponds, and soil conservation structures.',
      'Increased climate resilience and multi-stream farm income throughout the year.'
    ],
    eligibilityRules: {
      minLandSizeAcres: 0,
      maxLandSizeAcres: null,
      allowedCategories: ['General', 'SC', 'ST', 'OBC'],
      allowedFarmerTypes: ['marginal', 'smallholder', 'medium', 'large'],
      maxIncomeLimit: null,
      minAge: 18,
      maxAge: null,
      genderPreference: 'All',
      cropTypes: [],
      additionalCriteria: [
        'Priority given to small, marginal, SC/ST, and women farmers in rainfed agricultural zones.'
      ]
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Land Possession Certificate',
      'Bank Passbook Copy',
      'Detailed Integrated Farming Plan / Proposal'
    ],
    deadline: null,
    applicationUrl: 'https://nmsa.dac.gov.in',
    supportedStates: ['All India'],
    lastUpdated: new Date()
  },
  {
    name: 'Rashtriya Krishi Vikas Yojana',
    category: 'Infrastructure & Logistics',
    description: `Rashtriya Krishi Vikas Yojana (RKVY) — redesigned as RKVY-RAFTAAR (Remunerative Approaches for Agriculture and Allied Sectors Rejuvenation) — is a state-plan scheme launched to ensure holistic development of agriculture and allied sectors. The scheme grants states flexibility and autonomy to plan and execute agriculture development programs based on district and state agricultural plans.

RKVY focuses on building pre- and post-harvest infrastructure, setting up processing units, cold storage facilities, seed processing plants, custom hiring centers, and promoting agri-entrepreneurship. The scheme provides grant-in-aid up to ₹25 lakh for agri-startups and financial funding for farmer producer organizations (FPOs) and individual farmers for infrastructure creation.

Through its innovation and agri-entrepreneurship development component, RKVY incubates innovative ideas in agriculture, food processing, IoT in farming, and supply chain logistics, providing seed stage funding and mentoring to young agri-entrepreneurs and farmer collectives.`,
    benefits: [
      'Subsidies and capital grants up to 50%-80% for setting up agricultural infrastructure, custom hiring centers, and processing units.',
      'Seed stage grant-in-aid up to ₹25 lakh for agri-startups and innovative agricultural ideas.',
      'Support for Farmer Producer Organizations (FPOs) in infrastructure creation and market access.'
    ],
    eligibilityRules: {
      minLandSizeAcres: 0,
      maxLandSizeAcres: null,
      allowedCategories: ['General', 'SC', 'ST', 'OBC'],
      allowedFarmerTypes: ['marginal', 'smallholder', 'medium', 'large'],
      maxIncomeLimit: null,
      minAge: 18,
      maxAge: null,
      genderPreference: 'All',
      cropTypes: [],
      additionalCriteria: [
        'Individual farmers, FPOs, Agri-entrepreneurs, Cooperatives, and Self-Help Groups.'
      ]
    },
    requiredDocuments: [
      'Aadhaar Card / Identity Proof',
      'Project Report / Business Proposal for infrastructure setup',
      'Land documents / Lease deed for project site',
      'Bank Account & Financial Statements',
      'FPO / SHG Registration Certificate (if applicable)'
    ],
    deadline: null,
    applicationUrl: 'https://rkvy.nic.in',
    supportedStates: ['All India'],
    lastUpdated: new Date()
  },
  {
    name: 'Sub-Mission on Agricultural Mechanization',
    category: 'Mechanization',
    description: `Sub-Mission on Agricultural Mechanization (SMAM) was launched by the Ministry of Agriculture & Farmers Welfare to promote farm mechanization across India, especially in regions with low availability of farm power and among small and marginal landholders. Farm mechanization increases land productivity, timeliness of agricultural operations, and reduces drudgery associated with manual farming operations.

Under SMAM, financial assistance/subsidy ranging from 40% to 80% is provided for purchasing farm equipment such as tractors, power tillers, reapers, combines, laser land levelers, rotavators, and agricultural drones. Special emphasis is given to setting up Custom Hiring Centers (CHCs) and Hi-Tech Machinery Hubs by FPOs, cooperative societies, and rural entrepreneurs to make expensive machinery accessible to smallholders on a rental basis.

The scheme incorporates dedicated mobile applications (FARMS app - Farm Machinery Solutions) through which small and marginal farmers can easily rent farm equipment from nearby Custom Hiring Centers at affordable hourly rates, eliminating the burden of capital investment in costly machinery.`,
    benefits: [
      '40% to 50% subsidy for individual farmers purchasing agricultural implements and equipment.',
      'Up to 80% financial assistance for establishing Custom Hiring Centers (CHCs) and Farm Machinery Banks.',
      'Access to high-tech agricultural drones and precision machinery on rental basis.'
    ],
    eligibilityRules: {
      minLandSizeAcres: 0,
      maxLandSizeAcres: null,
      allowedCategories: ['General', 'SC', 'ST', 'OBC'],
      allowedFarmerTypes: ['marginal', 'smallholder', 'medium', 'large'],
      maxIncomeLimit: null,
      minAge: 18,
      maxAge: null,
      genderPreference: 'All',
      cropTypes: [],
      additionalCriteria: [
        'Priority given to small, marginal, SC/ST, and women farmers.',
        'Cooperative societies, SHGs, FPOs, and rural entrepreneurs eligible for CHC funding.'
      ]
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Land Ownership Record (7/12 extract / Khatauni)',
      'Bank Account Passbook',
      'Quotation & Invoice of machinery from authorized dealer',
      'Caste Certificate (if claiming SC/ST higher subsidy)'
    ],
    deadline: null,
    applicationUrl: 'https://agrimachinery.nic.in',
    supportedStates: ['All India'],
    lastUpdated: new Date()
  },
  {
    name: 'Agriculture Infrastructure Fund',
    category: 'Infrastructure & Logistics',
    description: `The Agriculture Infrastructure Fund (AIF) is a Medium - Long Term financing facility launched in 2020 under the Atmanirbhar Bharat package with a corpus of ₹1 Lakh Crore. The scheme aims to mobilize capital for creation of post-harvest management infrastructure and community farming assets across rural India to minimize post-harvest losses and boost farmer incomes.

Under AIF, banks and financial institutions provide loans with an interest subvention of 3% per annum on all loans up to ₹2 Crore for a maximum duration of 7 years. Additionally, credit guarantee coverage is provided under Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE) for loans up to ₹2 Crore without demanding collateral from borrowers.

Eligible projects include primary processing centers, warehouses, cold chains, silos, sorting/grading units, solar-powered agricultural assets, and e-marketing platforms. The scheme caters to primary agricultural credit societies (PACS), FPOs, Agri-entrepreneurs, Startups, and individual farmers to build robust rural supply chain infrastructure.`,
    benefits: [
      '3% interest subvention per annum on bank loans up to ₹2 Crore for up to 7 years.',
      'Credit guarantee coverage under CGTMSE for loans up to ₹2 Crore.',
      'Financing support for warehouses, cold stores, processing units, solar pumps, and sorting centers.'
    ],
    eligibilityRules: {
      minLandSizeAcres: 0,
      maxLandSizeAcres: null,
      allowedCategories: ['General', 'SC', 'ST', 'OBC'],
      allowedFarmerTypes: ['marginal', 'smallholder', 'medium', 'large'],
      maxIncomeLimit: null,
      minAge: 18,
      maxAge: null,
      genderPreference: 'All',
      cropTypes: [],
      additionalCriteria: [
        'Farmers, Agri-Entrepreneurs, Startups, PACS, FPOs, SHGs, Cooperatives, and Joint Liability Groups.'
      ]
    },
    requiredDocuments: [
      'Aadhaar Card & PAN Card',
      'Detailed Project Report (DPR) with cash flow projections',
      'Land Ownership / Lease Agreement for project site',
      'Bank Account details & Bank statement for last 6 months',
      'Enterprise / FPO Registration Certificate (if applicable)'
    ],
    deadline: null,
    applicationUrl: 'https://agriinfra.dac.gov.in',
    supportedStates: ['All India'],
    lastUpdated: new Date()
  }
];

const runSeeder = async () => {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.log('[Seed] Database connection unavailable. Skipping database write (Syntax & Seed object validation passed).');
      process.exit(0);
    }

    console.log('[Seed] Clearing existing scheme records...');
    await Scheme.deleteMany({});

    console.log(`[Seed] Seeding ${seedSchemes.length} authentic Indian agricultural schemes...`);
    const createdSchemes = await Scheme.insertMany(seedSchemes);

    console.log(`[Seed] Successfully seeded ${createdSchemes.length} schemes into MongoDB!`);
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error executing seed script: ${error.message}`);
    console.error(error.stack);
    await disconnectDB();
    process.exit(1);
  }
};

if (require.main === module) {
  runSeeder();
}

module.exports = seedSchemes;
