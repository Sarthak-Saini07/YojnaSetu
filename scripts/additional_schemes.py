"""
Authoritative, verified dataset of 27 additional genuine government schemes.
Populated according to SchemeCreate Pydantic schema and verified with official .gov.in and .nic.in portals.
Categories covered:
- Education and Scholarships (6 schemes)
- Farmers and Agriculture (5 schemes)
- Healthcare and Social Welfare (4 schemes)
- Employment and Entrepreneurship (4 schemes)
- Housing and Financial Assistance (5 schemes)
- Punjab and State-Specific Schemes (3 schemes)
"""

ADDITIONAL_SCHEMES = [
    # =========================================================================
    # A. Education and Scholarships
    # =========================================================================
    {
        "name": "PM-USP Central Sector Interest Subsidy Scheme (CSIS)",
        "slug": "pm-usp-csis",
        "description": "Interest subsidy scheme on educational loans under Pradhan Mantri Uchchatar Shiksha Protsahan (PM-USP) for economically weaker students pursuing professional/technical higher education in India.",
        "category": ["education", "loan", "financial_assistance", "scholarship"],
        "government": {
            "level": "central",
            "department": "Department of Higher Education, Ministry of Education"
        },
        "eligibility": {
            "age": {"min": 17, "max": 35},
            "income": {"min": None, "max": 450000},
            "states": [],
            "districts": [],
            "occupations": ["student"],
            "education": ["undergraduate", "postgraduate", "higher_education"],
            "gender": [],
            "categories": [],
            "is_farmer": None,
            "is_student": True,
            "is_disabled": None
        },
        "benefits": [
            "Full interest subsidy during moratorium period (course duration + 1 year) on educational loans up to ₹10 Lakhs taken from scheduled commercial banks"
        ],
        "documents": [
            "Income Certificate issued by designated state authority (family annual income ≤ ₹4.5 Lakh)",
            "Aadhaar Card",
            "Proof of admission to NAAC/NBA accredited higher educational institution",
            "Bank Loan Sanction Letter with Moratorium terms"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Visit PM Vidya Lakshmi / Canara Bank CSIS Portal",
                "Register student profile and apply for education loan with interest subsidy",
                "Upload income certificate verified by competent authority",
                "Bank verifies enrollment and submits interest subsidy claims on the portal"
            ],
            "official_url": "https://www.education.gov.in/pm-usp"
        },
        "source": {
            "department": "Department of Higher Education, Ministry of Education",
            "source_url": "https://www.education.gov.in/pm-usp",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Post-Matric Scholarship Scheme for Minorities",
        "slug": "post-matric-scholarship-minorities",
        "description": "National scholarship scheme to provide financial assistance to meritorious students belonging to notified minority communities (Muslim, Christian, Sikh, Buddhist, Jain, Parsi) for pursuing Class 11 to Ph.D.",
        "category": ["education", "scholarship", "financial_assistance"],
        "government": {
            "level": "central",
            "department": "Ministry of Minority Affairs"
        },
        "eligibility": {
            "age": {"min": 15, "max": 30},
            "income": {"min": None, "max": 200000},
            "states": [],
            "districts": [],
            "occupations": ["student"],
            "education": ["higher_secondary", "undergraduate", "postgraduate", "diploma"],
            "gender": [],
            "categories": [],
            "is_farmer": None,
            "is_student": True,
            "is_disabled": None
        },
        "benefits": [
            "Admission and tuition fee of up to ₹3,000 to ₹10,000 per annum",
            "Monthly maintenance allowance of ₹570 to ₹1,200 for hostellers and day scholars"
        ],
        "documents": [
            "Self-declaration certificate of minority community membership",
            "Income Certificate (family income ≤ ₹2 Lakh per annum)",
            "Previous year marksheet (minimum 50% marks in final exam)",
            "Aadhaar Card & Bank Passbook details"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Register on the National Scholarship Portal (scholarships.gov.in)",
                "Submit Post-Matric Scholarship application for Minorities",
                "Upload community declaration, income certificate, and fee receipts",
                "Verification by educational institution and state minority affairs department"
            ],
            "official_url": "https://scholarships.gov.in"
        },
        "source": {
            "department": "Ministry of Minority Affairs",
            "source_url": "https://www.minorityaffairs.gov.in/schemes-performance-reports/post-matric-scholarship-scheme",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "AICTE Pragati Scholarship for Girls",
        "slug": "aicte-pragati-scholarship-girls",
        "description": "Scholarship by All India Council for Technical Education (AICTE) to encourage female students to pursue technical degree and diploma education in approved institutions.",
        "category": ["education", "scholarship", "women_empowerment"],
        "government": {
            "level": "central",
            "department": "All India Council for Technical Education (AICTE), Ministry of Education"
        },
        "eligibility": {
            "age": {"min": 16, "max": 30},
            "income": {"min": None, "max": 800000},
            "states": [],
            "districts": [],
            "occupations": ["student"],
            "education": ["undergraduate", "diploma"],
            "gender": ["female"],
            "categories": [],
            "is_farmer": None,
            "is_student": True,
            "is_disabled": None
        },
        "benefits": [
            "Financial grant of ₹50,000 per annum for each year of study towards college tuition, computer, stationeries, and books (maximum 2 girls per family)"
        ],
        "documents": [
            "Class 10th and 12th Marksheets",
            "Allotment letter for admission to AICTE approved technical course",
            "Annual family income certificate (not exceeding ₹8 Lakhs)",
            "Aadhaar Card and Student Bank Passbook"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Register on National Scholarship Portal (NSP)",
                "Apply under AICTE Schemes: Pragati Scholarship Scheme for Girls",
                "Submit proof of admission to degree/diploma 1st year or 2nd year lateral entry",
                "Institute online verification followed by AICTE sanction"
            ],
            "official_url": "https://scholarships.gov.in"
        },
        "source": {
            "department": "AICTE, Ministry of Education",
            "source_url": "https://www.aicte-india.org/schemes/students-development-schemes/pragati",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "AICTE Saksham Scholarship for Specially-Abled Students",
        "slug": "aicte-saksham-scholarship",
        "description": "Scheme to provide encouragement and financial support to specially-abled students with disability not less than 40% pursuing technical degree or diploma courses.",
        "category": ["education", "scholarship", "disability"],
        "government": {
            "level": "central",
            "department": "All India Council for Technical Education (AICTE)"
        },
        "eligibility": {
            "age": {"min": 16, "max": 35},
            "income": {"min": None, "max": 800000},
            "states": [],
            "districts": [],
            "occupations": ["student"],
            "education": ["undergraduate", "diploma"],
            "gender": [],
            "categories": [],
            "is_farmer": None,
            "is_student": True,
            "is_disabled": True
        },
        "benefits": [
            "₹50,000 per annum for every year of technical study to cover college fees, purchase of computers, and assistive software/devices"
        ],
        "documents": [
            "Unique Disability ID (UDID) or Disability Certificate (≥ 40% disability)",
            "Income certificate proving family income ≤ ₹8 Lakhs per annum",
            "Admission confirmation letter in AICTE-recognized institution",
            "Class 10th & 12th marksheets and Aadhaar Card"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Apply on National Scholarship Portal (scholarships.gov.in)",
                "Select AICTE Saksham Scholarship Scheme",
                "Upload disability certificate and income verification",
                "Verification by college Nodal Officer and AICTE direct DBT release"
            ],
            "official_url": "https://scholarships.gov.in"
        },
        "source": {
            "department": "AICTE, Ministry of Education",
            "source_url": "https://www.aicte-india.org/schemes/students-development-schemes/saksham",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "AICTE Swanath Scholarship Scheme",
        "slug": "aicte-swanath-scholarship",
        "description": "Financial assistance scheme to provide scholarships to orphans, wards of parents who died of COVID-19, and wards of Armed Forces and Central Paramilitary Forces personnel martyred in action.",
        "category": ["education", "scholarship", "social_welfare"],
        "government": {
            "level": "central",
            "department": "All India Council for Technical Education (AICTE)"
        },
        "eligibility": {
            "age": {"min": 16, "max": 30},
            "income": {"min": None, "max": 800000},
            "states": [],
            "districts": [],
            "occupations": ["student"],
            "education": ["undergraduate", "diploma"],
            "gender": [],
            "categories": [],
            "is_farmer": None,
            "is_student": True,
            "is_disabled": None
        },
        "benefits": [
            "₹50,000 per annum for each year of degree or diploma education towards tuition and educational equipment"
        ],
        "documents": [
            "Death Certificate of parents / Martyr certificate issued by Armed Forces/CAPF authority",
            "Family income certificate (≤ ₹8 Lakhs per annum)",
            "Admission letter in AICTE approved institution",
            "Aadhaar Card and Student Bank account passbook"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Apply through the National Scholarship Portal (NSP)",
                "Choose AICTE Swanath Scholarship Scheme",
                "Submit verification documents for orphan/martyr criteria",
                "Direct Benefit Transfer to student bank account upon institute authentication"
            ],
            "official_url": "https://scholarships.gov.in"
        },
        "source": {
            "department": "AICTE, Ministry of Education",
            "source_url": "https://www.aicte-india.org/schemes/students-development-schemes/swanath",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "National Fellowship for Scheduled Caste Students (NFSC)",
        "slug": "national-fellowship-sc-students",
        "description": "Fellowship scheme providing financial support to Scheduled Caste students pursuing regular and full-time M.Phil and Ph.D. degrees in Sciences, Humanities, Social Sciences, and Engineering.",
        "category": ["education", "scholarship", "fellowship"],
        "government": {
            "level": "central",
            "department": "Ministry of Social Justice and Empowerment / UGC"
        },
        "eligibility": {
            "age": {"min": 21, "max": 36},
            "income": {"min": None, "max": 600000},
            "states": [],
            "districts": [],
            "occupations": ["student"],
            "education": ["postgraduate", "doctorate"],
            "gender": [],
            "categories": ["sc"],
            "is_farmer": None,
            "is_student": True,
            "is_disabled": None
        },
        "benefits": [
            "Junior Research Fellowship (JRF) of ₹37,000/month for initial 2 years",
            "Senior Research Fellowship (SRF) of ₹42,000/month for remaining period + HRA and annual contingency grants"
        ],
        "documents": [
            "Scheduled Caste (SC) Category Certificate",
            "UGC-NET / CSIR-NET Score Card / Ph.D. Enrollment Letter",
            "Postgraduate Degree Marksheet & Certificate",
            "Aadhaar Card and Bank Account details"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Qualify UGC-NET or CSIR-NET examination",
                "Apply on the National Scholarship Portal / NTA Fellowship portal",
                "Submit university research registration proof and SC certificate",
                "UGC releases monthly DBT fellowship into scholar bank account"
            ],
            "official_url": "https://ugcnet.nta.ac.in"
        },
        "source": {
            "department": "Ministry of Social Justice and Empowerment",
            "source_url": "https://socialjustice.gov.in/schemes/19",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },

    # =========================================================================
    # B. Farmers and Agriculture
    # =========================================================================
    {
        "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "slug": "pm-fasal-bima-yojana",
        "description": "Comprehensive crop insurance scheme providing financial support to farmers suffering crop loss or damage arising out of non-preventable natural risks (drought, flood, pests, unseasonal rains).",
        "category": ["agriculture", "insurance", "financial_assistance"],
        "government": {
            "level": "central",
            "department": "Department of Agriculture and Farmers Welfare, Ministry of Agriculture"
        },
        "eligibility": {
            "age": {"min": 18, "max": 75},
            "income": {"min": None, "max": None},
            "states": [],
            "districts": [],
            "occupations": ["farmer"],
            "education": [],
            "gender": [],
            "categories": [],
            "is_farmer": True,
            "is_student": None,
            "is_disabled": None
        },
        "benefits": [
            "Very low uniform farmer premium: 2% of sum insured for Kharif crops, 1.5% for Rabi food/oilseed crops, and 5% for annual commercial/horticultural crops",
            "Full sum insured compensation directly deposited in bank account upon crop assessment"
        ],
        "documents": [
            "Land ownership record (RoR / Khasra-Khatauni) or Tenant Farmer agreement",
            "Aadhaar Card",
            "Bank passbook with IFSC code",
            "Sowing Certificate issued by Village Patwari / Agriculture Officer"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Visit the official PMFBY portal (pmfby.gov.in) or Common Service Centre (CSC)",
                "Register as farmer with Aadhaar and mobile number",
                "Enter crop details, sown area, and bank account",
                "Pay nominal farmer share of premium online to generate insurance policy"
            ],
            "official_url": "https://pmfby.gov.in"
        },
        "source": {
            "department": "Department of Agriculture & Farmers Welfare",
            "source_url": "https://pmfby.gov.in",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Kisan Credit Card (KCC) Scheme",
        "slug": "kisan-credit-card",
        "description": "Institutional credit facility to ensure farmers receive adequate and timely credit support for agricultural production, post-harvest expenses, maintenance of farm assets, and allied activities.",
        "category": ["agriculture", "credit", "financial_assistance"],
        "government": {
            "level": "central",
            "department": "Department of Agriculture & Farmers Welfare / RBI / NABARD"
        },
        "eligibility": {
            "age": {"min": 18, "max": 75},
            "income": {"min": None, "max": None},
            "states": [],
            "districts": [],
            "occupations": ["farmer"],
            "education": [],
            "gender": [],
            "categories": [],
            "is_farmer": True,
            "is_student": None,
            "is_disabled": None
        },
        "benefits": [
            "Flexible revolving credit line with subsidized interest rate of 4% per annum (with 3% prompt repayment incentive) for loans up to ₹3 Lakhs",
            "Collateral-free agricultural loans up to ₹1.60 Lakhs"
        ],
        "documents": [
            "Duly completed KCC application form",
            "Land revenue record (Parcha/Khatauni) showing cultivable landholding",
            "Aadhaar Card and Voter ID / PAN Card",
            "Passport size photograph"
        ],
        "application": {
            "method": "hybrid",
            "steps": [
                "Download KCC form from PM-KISAN portal or visit nearest bank branch/CSC",
                "Submit land record verification and KYC documents",
                "Bank sanctions credit limit based on cropping pattern and scale of finance",
                "Issue of RuPay KCC ATM/Debit card to withdraw funds directly"
            ],
            "official_url": "https://myscheme.gov.in/schemes/kcc"
        },
        "source": {
            "department": "Department of Agriculture and Farmers Welfare",
            "source_url": "https://agricoop.nic.in",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) - Per Drop More Crop",
        "slug": "pm-krishi-sinchayee-yojana",
        "description": "Centrally sponsored scheme focused on enhancing water use efficiency at farm level through micro-irrigation technologies such as Drip and Sprinkler irrigation systems.",
        "category": ["agriculture", "infrastructure", "financial_assistance"],
        "government": {
            "level": "central",
            "department": "Ministry of Agriculture and Farmers Welfare"
        },
        "eligibility": {
            "age": {"min": 18, "max": 75},
            "income": {"min": None, "max": None},
            "states": [],
            "districts": [],
            "occupations": ["farmer"],
            "education": [],
            "gender": [],
            "categories": [],
            "is_farmer": True,
            "is_student": None,
            "is_disabled": None
        },
        "benefits": [
            "Capital subsidy of up to 55% for small and marginal farmers, and 45% for other farmers for installing drip and sprinkler irrigation equipment"
        ],
        "documents": [
            "Land title deeds (Jamabandi/Fard)",
            "Aadhaar Card",
            "Bank passbook",
            "Electricity connection receipt / Water source availability certificate"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Apply on the state agriculture/horticulture department micro-irrigation portal",
                "Upload land documents and select authorized micro-irrigation manufacturer/vendor",
                "Field inspection by district agriculture officer",
                "Subsidy transferred directly to beneficiary/vendor after installation verification"
            ],
            "official_url": "https://pmksy.gov.in"
        },
        "source": {
            "department": "Department of Agriculture & Farmers Welfare",
            "source_url": "https://pmksy.gov.in",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Soil Health Card Scheme",
        "slug": "soil-health-card-scheme",
        "description": "Scheme to assist state governments in issuing Soil Health Cards to all farmers in the country, detailing nutrient status of their agricultural soil and customized fertilizer dosage recommendations.",
        "category": ["agriculture", "advisory", "welfare"],
        "government": {
            "level": "central",
            "department": "Department of Agriculture and Farmers Welfare"
        },
        "eligibility": {
            "age": {"min": 18, "max": 80},
            "income": {"min": None, "max": None},
            "states": [],
            "districts": [],
            "occupations": ["farmer"],
            "education": [],
            "gender": [],
            "categories": [],
            "is_farmer": True,
            "is_student": None,
            "is_disabled": None
        },
        "benefits": [
            "Periodic comprehensive laboratory soil analysis testing 12 chemical and physical parameters free of charge",
            "Personalized fertilizer and organic manure dosage recommendations to reduce input costs and increase yields"
        ],
        "documents": [
            "Aadhaar Card",
            "Farm land identification details (Survey number/Khasra number)",
            "Contact mobile number"
        ],
        "application": {
            "method": "offline",
            "steps": [
                "Soil samples collected from agricultural field by village agriculture assistant",
                "Testing conducted in government designated Soil Testing Laboratory (STL)",
                "Soil Health Card generated and handed over to farmer at village camp or via portal download"
            ],
            "official_url": "https://soilhealth.dac.gov.in"
        },
        "source": {
            "department": "Ministry of Agriculture and Farmers Welfare",
            "source_url": "https://soilhealth.dac.gov.in",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "PM Kisan Maandhan Yojana (PM-KMY)",
        "slug": "pm-kisan-maandhan-yojana",
        "description": "Old age pension scheme for Small and Marginal Farmers (SMF) to provide social security and financial independence in their old age through voluntary and contributory pension fund managed by LIC.",
        "category": ["agriculture", "pension", "social_welfare"],
        "government": {
            "level": "central",
            "department": "Department of Agriculture & Farmers Welfare & LIC"
        },
        "eligibility": {
            "age": {"min": 18, "max": 40},
            "income": {"min": None, "max": None},
            "states": [],
            "districts": [],
            "occupations": ["farmer"],
            "education": [],
            "gender": [],
            "categories": [],
            "is_farmer": True,
            "is_student": None,
            "is_disabled": None
        },
        "benefits": [
            "Assured monthly pension of ₹3,000 on attaining the age of 60 years",
            "Equal 50% matching monthly contribution by the Central Government"
        ],
        "documents": [
            "Aadhaar Card",
            "Savings Bank Account / PM-KISAN bank account details",
            "Copy of land record documents showing cultivable land up to 2 hectares"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Visit nearest Common Service Centre (CSC) or maandhan.in portal",
                "Authenticate using Aadhaar and mobile OTP",
                "Select monthly contribution based on enrollment age (₹55 to ₹200/month)",
                "Auto-debit mandate registered; Pension Card issued instantly"
            ],
            "official_url": "https://maandhan.in"
        },
        "source": {
            "department": "Ministry of Agriculture and Farmers Welfare",
            "source_url": "https://maandhan.in",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },

    # =========================================================================
    # C. Healthcare and Social Welfare
    # =========================================================================
    {
        "name": "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
        "slug": "pm-matru-vandana-yojana",
        "description": "Maternity Benefit Programme providing cash incentive to pregnant women and lactating mothers for health checkups, institutional delivery, and vaccination of the child.",
        "category": ["healthcare", "women_welfare", "financial_assistance"],
        "government": {
            "level": "central",
            "department": "Ministry of Women and Child Development"
        },
        "eligibility": {
            "age": {"min": 19, "max": 45},
            "income": {"min": None, "max": 800000},
            "states": [],
            "districts": [],
            "occupations": [],
            "education": [],
            "gender": ["female"],
            "categories": [],
            "is_farmer": None,
            "is_student": None,
            "is_disabled": None
        },
        "benefits": [
            "Direct cash benefit of ₹5,000 for the first child in two installments upon antenatal registration and child immunization",
            "Additional incentive of ₹6,000 in a single installment for the second girl child"
        ],
        "documents": [
            "Mother-Child Protection (MCP) Card registered with Anganwadi/Health centre",
            "Aadhaar Card of mother and husband",
            "Mother's Aadhaar-seeded Bank Passbook",
            "Child Birth Certificate (for 2nd installment/girl child)"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Register at the local Anganwadi Centre (AWC) or apply online via PMMVY portal (pmmvy.wcd.gov.in)",
                "Submit pregnancy registration details from MCP card",
                "Direct Benefit Transfer (DBT) credited straight to mother's bank account"
            ],
            "official_url": "https://pmmvy.wcd.gov.in"
        },
        "source": {
            "department": "Ministry of Women and Child Development",
            "source_url": "https://pmmvy.wcd.gov.in",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
        "slug": "nsap-ignoaps-old-age-pension",
        "description": "Non-contributory old age social pension component of the National Social Assistance Programme (NSAP) providing social security pensions to senior citizens living below poverty line.",
        "category": ["pension", "social_welfare", "senior_citizens"],
        "government": {
            "level": "central",
            "department": "Ministry of Rural Development"
        },
        "eligibility": {
            "age": {"min": 60, "max": 120},
            "income": {"min": None, "max": 100000},
            "states": [],
            "districts": [],
            "occupations": ["unemployed", "worker", "artisan"],
            "education": [],
            "gender": [],
            "categories": [],
            "is_farmer": None,
            "is_student": False,
            "is_disabled": None
        },
        "benefits": [
            "Monthly central pension supplemented by state assistance, providing ₹1,000 to ₹2,500 monthly financial assistance directly into beneficiary bank account"
        ],
        "documents": [
            "Aadhaar Card / Proof of age (Birth certificate, voter card, or medical board certificate)",
            "BPL Ration Card / SECC 2011 listing or verified low-income certificate",
            "Aadhaar-linked Bank Account Passbook",
            "Passport size photograph"
        ],
        "application": {
            "method": "hybrid",
            "steps": [
                "Apply through Gram Panchayat / Block Development Office / Municipal Office or NSAP portal",
                "Submit age proof and BPL documentation",
                "Verification by Social Welfare Inspector",
                "Monthly pension sanctioned and credited directly to bank account"
            ],
            "official_url": "https://nsap.nic.in"
        },
        "source": {
            "department": "Ministry of Rural Development",
            "source_url": "https://nsap.nic.in",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Rashtriya Vayoshri Yojana (RVY)",
        "slug": "rashtriya-vayoshri-yojana",
        "description": "Scheme for providing physical aids and assisted-living devices for senior citizens belonging to BPL category suffering from age-related disabilities or infirmities.",
        "category": ["healthcare", "senior_citizens", "disability", "social_welfare"],
        "government": {
            "level": "central",
            "department": "Ministry of Social Justice and Empowerment / ALIMCO"
        },
        "eligibility": {
            "age": {"min": 60, "max": 120},
            "income": {"min": None, "max": 180000},
            "states": [],
            "districts": [],
            "occupations": [],
            "education": [],
            "gender": [],
            "categories": [],
            "is_farmer": None,
            "is_student": False,
            "is_disabled": None
        },
        "benefits": [
            "Free distribution of standard assistive devices including walking sticks, elbow crutches, walkers, tripods/quadpods, hearing aids, wheelchairs, artificial dentures, and spectacles"
        ],
        "documents": [
            "Proof of age (Aadhaar Card, Voter ID, or certificate of age)",
            "Certificate of BPL status or monthly family income not exceeding ₹15,000 (annual ≤ ₹1.8 Lakhs)",
            "Medical certificate indicating age-related physical impairment"
        ],
        "application": {
            "method": "offline",
            "steps": [
                "Attend district-level assessment camp organized by ALIMCO and District Administration",
                "Medical screening to determine exact assistive equipment required",
                "Free devices distributed during follow-up distribution camps"
            ],
            "official_url": "https://socialjustice.gov.in"
        },
        "source": {
            "department": "Department of Social Justice and Empowerment",
            "source_url": "https://socialjustice.gov.in/schemes/30",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Deendayal Antyodaya Yojana - NRLM",
        "slug": "day-nrlm-livelihoods",
        "description": "Flagship poverty alleviation program organizing rural poor into Women Self Help Groups (SHGs) and providing continuous financial and livelihood support.",
        "category": ["livelihoods", "employment", "women_empowerment", "financial_assistance"],
        "government": {
            "level": "central",
            "department": "Ministry of Rural Development"
        },
        "eligibility": {
            "age": {"min": 18, "max": 65},
            "income": {"min": None, "max": 200000},
            "states": [],
            "districts": [],
            "occupations": ["self_employed", "artisan", "worker", "unemployed"],
            "education": [],
            "gender": ["female"],
            "categories": [],
            "is_farmer": None,
            "is_student": None,
            "is_disabled": None
        },
        "benefits": [
            "Revolving Fund (RF) of ₹15,000 to ₹30,000 and Community Investment Fund (CIF) up to ₹2.5 Lakhs per SHG",
            "Bank loans at subsidized 7% interest rate with additional 3% interest subvention for prompt repayment on loans up to ₹3 Lakhs"
        ],
        "documents": [
            "Aadhaar Card of member",
            "SHG Membership Passbook / Resolution book",
            "Bank Account details of the Self Help Group",
            "Proof of rural residence"
        ],
        "application": {
            "method": "offline",
            "steps": [
                "Join an active village Self Help Group (SHG) facilitated by Community Resource Persons",
                "Regular weekly micro-savings and internal lending for minimum 3 months",
                "Submit micro-credit plan to Block Mission Management Unit (BMMU)",
                "Bank sanctions collateral-free SHG credit linkage"
            ],
            "official_url": "https://nrlm.gov.in"
        },
        "source": {
            "department": "Ministry of Rural Development",
            "source_url": "https://nrlm.gov.in",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },

    # =========================================================================
    # D. Employment and Entrepreneurship
    # =========================================================================
    {
        "name": "Prime Minister's Employment Generation Programme (PMEGP)",
        "slug": "pm-employment-generation-programme",
        "description": "Credit-linked subsidy program to generate continuous self-employment opportunities in rural and urban areas by setting up new micro-enterprises.",
        "category": ["employment", "entrepreneurship", "business", "financial_assistance"],
        "government": {
            "level": "central",
            "department": "Ministry of Micro, Small and Medium Enterprises (MSME / KVIC)"
        },
        "eligibility": {
            "age": {"min": 18, "max": 65},
            "income": {"min": None, "max": None},
            "states": [],
            "districts": [],
            "occupations": ["unemployed", "self_employed", "artisan", "worker"],
            "education": ["primary", "secondary", "higher_secondary", "undergraduate", "postgraduate", "diploma"],
            "gender": [],
            "categories": [],
            "is_farmer": None,
            "is_student": False,
            "is_disabled": None
        },
        "benefits": [
            "Capital subsidy of 15% to 35% on project cost (up to ₹50 Lakhs for manufacturing and up to ₹20 Lakhs for service sector projects)",
            "Beneficiary contribution only 5% to 10% of total project cost"
        ],
        "documents": [
            "Detailed Project Report (DPR) of proposed micro-enterprise",
            "Aadhaar Card and PAN Card",
            "Educational Qualification / 8th Pass Marksheet (mandatory for projects > ₹10L manufacturing / > ₹5L service)",
            "Special Category / Rural area certificate if claiming 35% higher subsidy"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Apply online on the PMEGP e-Portal (kviconline.gov.in/pmegpeportal)",
                "Submit project profile and select preferred financing bank",
                "District Level Task Force Committee (DLTFC) scrutinizes application",
                "Bank sanctions loan and KVIC disburses margin money subsidy into lock-in deposit"
            ],
            "official_url": "https://www.kviconline.gov.in/pmegpeportal"
        },
        "source": {
            "department": "Ministry of MSME",
            "source_url": "https://msme.gov.in/pmegp",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)",
        "slug": "pradhan-mantri-kaushal-vikas-yojana",
        "description": "Skill certification initiative of the Ministry of Skill Development and Entrepreneurship to enable youth to take up industry-relevant skill training for better livelihoods.",
        "category": ["employment", "skill_development", "training"],
        "government": {
            "level": "central",
            "department": "Ministry of Skill Development and Entrepreneurship (MSDE / NSDC)"
        },
        "eligibility": {
            "age": {"min": 15, "max": 45},
            "income": {"min": None, "max": None},
            "states": [],
            "districts": [],
            "occupations": ["student", "unemployed", "worker"],
            "education": ["primary", "secondary", "higher_secondary", "undergraduate", "diploma", "none"],
            "gender": [],
            "categories": [],
            "is_farmer": None,
            "is_student": None,
            "is_disabled": None
        },
        "benefits": [
            "100% free skill training courses aligned with National Skills Qualifications Framework (NSQF)",
            "Government certification, assessment fee waiver, placement assistance, and ₹500 to ₹1,500 post-placement stipend"
        ],
        "documents": [
            "Aadhaar Card",
            "Bank Account details",
            "Educational qualification certificates",
            "Passport size photographs"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Register on Skill India Digital portal (skillindiadigital.gov.in)",
                "Find accredited training center and select job role / trade",
                "Complete classroom and on-the-job training (OJT)",
                "Take third-party assessment and receive Skill India certificate"
            ],
            "official_url": "https://www.skillindiadigital.gov.in"
        },
        "source": {
            "department": "Ministry of Skill Development and Entrepreneurship",
            "source_url": "https://www.msde.gov.in/en/schemes-initiatives/schemes-programmes-under-msde/pmkvy",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Startup India Seed Fund Scheme (SISFS)",
        "slug": "startup-india-seed-fund",
        "description": "Financial assistance scheme to startups for proof of concept, prototype development, product trials, market entry, and commercialization through approved incubators across India.",
        "category": ["entrepreneurship", "startup", "innovation", "financial_assistance"],
        "government": {
            "level": "central",
            "department": "Department for Promotion of Industry and Internal Trade (DPIIT), Ministry of Commerce and Industry"
        },
        "eligibility": {
            "age": {"min": 18, "max": 65},
            "income": {"min": None, "max": None},
            "states": [],
            "districts": [],
            "occupations": ["self_employed", "employed", "student"],
            "education": ["undergraduate", "postgraduate", "higher_secondary", "diploma"],
            "gender": [],
            "categories": [],
            "is_farmer": None,
            "is_student": None,
            "is_disabled": None
        },
        "benefits": [
            "Up to ₹20 Lakhs grant for proof of concept and prototype development",
            "Up to ₹50 Lakhs through convertible debentures or debt-linked instruments for commercialization"
        ],
        "documents": [
            "DPIIT Startup Recognition Certificate",
            "Certificate of Incorporation / Partnership deed",
            "Business pitch deck and proof of innovative concept",
            "Audited financial statements or bank statement"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Register on Startup India Portal (startupindia.gov.in) and obtain DPIIT recognition",
                "Apply on Seed Fund portal (seedfund.startupindia.gov.in)",
                "Select up to 3 approved incubators in order of preference",
                "Present proposal to Incubator Seed Management Committee (ISMC)"
            ],
            "official_url": "https://seedfund.startupindia.gov.in"
        },
        "source": {
            "department": "DPIIT, Ministry of Commerce and Industry",
            "source_url": "https://seedfund.startupindia.gov.in",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "National Apprenticeship Promotion Scheme (NAPS)",
        "slug": "national-apprenticeship-promotion-scheme",
        "description": "Government scheme promoting apprenticeship training across industrial sectors by providing financial support directly to apprentices and sharing training costs.",
        "category": ["employment", "skill_development", "financial_assistance"],
        "government": {
            "level": "central",
            "department": "Ministry of Skill Development and Entrepreneurship"
        },
        "eligibility": {
            "age": {"min": 14, "max": 35},
            "income": {"min": None, "max": None},
            "states": [],
            "districts": [],
            "occupations": ["student", "unemployed", "worker"],
            "education": ["primary", "secondary", "higher_secondary", "undergraduate", "diploma"],
            "gender": [],
            "categories": [],
            "is_farmer": None,
            "is_student": None,
            "is_disabled": None
        },
        "benefits": [
            "Direct Benefit Transfer (DBT) of 25% of prescribed monthly stipend up to ₹1,500 per month paid directly to apprentice's bank account",
            "Hands-on industrial work experience and nationally recognized National Apprenticeship Certificate"
        ],
        "documents": [
            "Aadhaar Card",
            "Educational qualification marksheet (minimum 5th pass depending on trade)",
            "Aadhaar-seeded bank account details",
            "Passport size photo"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Register candidate profile on Apprenticeship India portal (apprenticeshipindia.gov.in)",
                "Search and apply for apprenticeship vacancies by trade/location",
                "Sign apprenticeship contract with participating establishment",
                "Stipend DBT credited monthly directly by government"
            ],
            "official_url": "https://www.apprenticeshipindia.gov.in"
        },
        "source": {
            "department": "Ministry of Skill Development and Entrepreneurship",
            "source_url": "https://www.msde.gov.in/en/schemes-initiatives/schemes-programmes-under-msde/naps",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },

    # =========================================================================
    # E. Housing and Financial Assistance
    # =========================================================================
    {
        "name": "Pradhan Mantri Awas Yojana - Urban 2.0 (PMAY-U 2.0)",
        "slug": "pmay-urban-2",
        "description": "Flagship urban housing mission providing central financial assistance to Economically Weaker Section (EWS), Low Income Group (LIG), and Middle Income Group (MIG) families to construct or buy all-weather pucca houses.",
        "category": ["housing", "financial_assistance", "urban_development"],
        "government": {
            "level": "central",
            "department": "Ministry of Housing and Urban Affairs"
        },
        "eligibility": {
            "age": {"min": 18, "max": 75},
            "income": {"min": None, "max": 900000},
            "states": [],
            "districts": [],
            "occupations": [],
            "education": [],
            "gender": [],
            "categories": [],
            "is_farmer": None,
            "is_student": False,
            "is_disabled": None
        },
        "benefits": [
            "Interest subsidy of 4.0% on home loans up to ₹25 Lakhs (maximum subsidy up to ₹1.80 Lakhs) for tenure up to 12 years",
            "Financial assistance of ₹2.50 Lakhs for Beneficiary-Led Construction (BLC) of pucca houses"
        ],
        "documents": [
            "Aadhaar Cards of all family members",
            "Proof of family income certificate (EWS ≤ ₹3L, LIG ≤ ₹6L, MIG ≤ ₹9L)",
            "Self-affidavit declaring non-ownership of any pucca house anywhere in India",
            "Bank passbook & Land ownership document / property allotment papers"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Visit the official PMAY-Urban portal (pmay-urban.gov.in) or visit CSC",
                "Enter Aadhaar and authenticate demographic profile",
                "Fill in family details, current address, and select housing vertical (ISS / BLC / AHP)",
                "Track application and subsidy through CLSS Awas Portal (CLAP)"
            ],
            "official_url": "https://pmay-urban.gov.in"
        },
        "source": {
            "department": "Ministry of Housing and Urban Affairs",
            "source_url": "https://pmay-urban.gov.in",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Atal Pension Yojana (APY)",
        "slug": "atal-pension-yojana",
        "description": "Government-backed guaranteed pension scheme primarily targeted at unorganized sector workers to provide financial security in old age administered by PFRDA.",
        "category": ["pension", "financial_assistance", "social_welfare"],
        "government": {
            "level": "central",
            "department": "Pension Fund Regulatory and Development Authority (PFRDA), Ministry of Finance"
        },
        "eligibility": {
            "age": {"min": 18, "max": 40},
            "income": {"min": None, "max": None},
            "states": [],
            "districts": [],
            "occupations": ["worker", "artisan", "self_employed", "unemployed", "farmer"],
            "education": [],
            "gender": [],
            "categories": [],
            "is_farmer": None,
            "is_student": None,
            "is_disabled": None
        },
        "benefits": [
            "Guaranteed monthly pension of ₹1,000, ₹2,000, ₹3,000, ₹4,000, or ₹5,000 per month upon reaching 60 years of age based on monthly contribution",
            "In case of demise, spouse receives pension and full pension wealth is handed to nominee"
        ],
        "documents": [
            "Active Savings Bank Account or Post Office savings account",
            "Aadhaar Card",
            "Active mobile number",
            "Declaration of non-taxpayer status"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Approach bank branch where savings account is held or apply via NetBanking/APY portal",
                "Select desired monthly pension slab and register auto-debit facility",
                "PRAN (Permanent Retirement Account Number) issued immediately"
            ],
            "official_url": "https://www.pfrda.org.in"
        },
        "source": {
            "department": "Department of Financial Services, Ministry of Finance",
            "source_url": "https://financialservices.gov.in/beta/en/atal-pension-yojana",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
        "slug": "pm-jeevan-jyoti-bima-yojana",
        "description": "One-year life insurance scheme renewable from year to year offering life insurance cover for death due to any reason for savings bank account holders.",
        "category": ["insurance", "financial_assistance", "social_welfare"],
        "government": {
            "level": "central",
            "department": "Department of Financial Services, Ministry of Finance"
        },
        "eligibility": {
            "age": {"min": 18, "max": 50},
            "income": {"min": None, "max": None},
            "states": [],
            "districts": [],
            "occupations": [],
            "education": [],
            "gender": [],
            "categories": [],
            "is_farmer": None,
            "is_student": None,
            "is_disabled": None
        },
        "benefits": [
            "Life insurance coverage of ₹2,00,000 payable to nominee in case of death of the insured person due to any reason for an annual premium of ₹436 auto-debited once a year"
        ],
        "documents": [
            "Savings Bank Account with auto-debit facility",
            "Aadhaar Card",
            "Nominee details and KYC documents"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Enroll via NetBanking/Mobile Banking app or fill simple consent-cum-declaration form at bank branch",
                "Ensure sufficient balance for ₹436 auto-debit during May-June each year",
                "Policy certificate generated instantly with auto-renewal"
            ],
            "official_url": "https://jansuraksha.gov.in"
        },
        "source": {
            "department": "Department of Financial Services, Ministry of Finance",
            "source_url": "https://financialservices.gov.in/insurance-divisions/Government-Sponsored-Socially-Oriented-Insurance-Schemes/Pradhan-Mantri-Jeevan-Jyoti-Bima-Yojana(PMJJBY)",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
        "slug": "pm-suraksha-bima-yojana",
        "description": "Extremely affordable one-year accidental death and disability insurance scheme renewable year-to-year protecting citizens against unfortunate accidental casualties.",
        "category": ["insurance", "financial_assistance", "social_welfare"],
        "government": {
            "level": "central",
            "department": "Department of Financial Services, Ministry of Finance"
        },
        "eligibility": {
            "age": {"min": 18, "max": 70},
            "income": {"min": None, "max": None},
            "states": [],
            "districts": [],
            "occupations": [],
            "education": [],
            "gender": [],
            "categories": [],
            "is_farmer": None,
            "is_student": None,
            "is_disabled": None
        },
        "benefits": [
            "Accidental death and permanent full disability cover of ₹2,00,000",
            "Permanent partial disability cover of ₹1,00,000 for a nominal annual premium of only ₹20 auto-debited per annum"
        ],
        "documents": [
            "Savings Bank Account / Post Office savings account",
            "Aadhaar Card",
            "Nominee details"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Subscribe through NetBanking / Mobile Banking or at any bank branch",
                "Authorize annual auto-debit of ₹20 from savings account",
                "Instant issuance of Jan Suraksha accidental coverage"
            ],
            "official_url": "https://jansuraksha.gov.in"
        },
        "source": {
            "department": "Ministry of Finance",
            "source_url": "https://jansuraksha.gov.in",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "National Family Benefit Scheme (NFBS)",
        "slug": "national-family-benefit-scheme",
        "description": "Component of the National Social Assistance Programme (NSAP) providing lump-sum financial assistance to a below poverty line bereaved family on the death of the primary breadwinner.",
        "category": ["financial_assistance", "social_welfare", "bpl"],
        "government": {
            "level": "central",
            "department": "Ministry of Rural Development"
        },
        "eligibility": {
            "age": {"min": 18, "max": 60},
            "income": {"min": None, "max": 100000},
            "states": [],
            "districts": [],
            "occupations": [],
            "education": [],
            "gender": [],
            "categories": [],
            "is_farmer": None,
            "is_student": False,
            "is_disabled": None
        },
        "benefits": [
            "One-time lump sum financial assistance of ₹20,000 transferred to the surviving head of the bereaved BPL household upon death of primary wage earner"
        ],
        "documents": [
            "Death Certificate of the primary breadwinner (aged between 18 and 59 years)",
            "BPL Ration Card or certified low-income certificate",
            "Aadhaar Card of the applicant (surviving spouse/eldest family member)",
            "Applicant's bank account details"
        ],
        "application": {
            "method": "hybrid",
            "steps": [
                "Submit application to Sub-Divisional Magistrate (SDM) / Tehsildar / Block Development Officer or online via NSAP portal",
                "Submit death certificate and proof of breadwinner status",
                "Verification by local administration and direct DBT transfer into applicant bank account"
            ],
            "official_url": "https://nsap.nic.in"
        },
        "source": {
            "department": "Ministry of Rural Development",
            "source_url": "https://nsap.nic.in",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },

    # =========================================================================
    # F. Punjab and State-Specific Schemes
    # =========================================================================
    {
        "name": "Punjab Ghar Ghar Rozgar and Karobar Mission (PGRKAM)",
        "slug": "punjab-ghar-ghar-rozgar-mission",
        "description": "State employment and entrepreneurship flagship initiative by Government of Punjab connecting job seekers with employers, overseas employment counseling, and self-employment loans.",
        "category": ["employment", "skill_development", "livelihoods"],
        "government": {
            "level": "state",
            "department": "Department of Employment Generation, Skill Development & Training, Government of Punjab"
        },
        "eligibility": {
            "age": {"min": 18, "max": 45},
            "income": {"min": None, "max": None},
            "states": ["Punjab"],
            "districts": [],
            "occupations": ["unemployed", "student", "worker"],
            "education": ["primary", "secondary", "higher_secondary", "undergraduate", "postgraduate", "diploma"],
            "gender": [],
            "categories": [],
            "is_farmer": None,
            "is_student": None,
            "is_disabled": None
        },
        "benefits": [
            "Free access to mega job fairs (Rojgar Melas) across Punjab districts",
            "Career counseling, foreign study and visa guidance, free civil services and competitive exam coaching, and self-employment bank loan facilitation"
        ],
        "documents": [
            "Punjab Domicile / Residence Proof",
            "Aadhaar Card",
            "Educational and technical certificates",
            "Resume / CV"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Register on PGRKAM portal (pgrkam.com)",
                "Complete candidate profile with qualifications and job preferences",
                "Apply for verified private and government job openings or attend district job fairs"
            ],
            "official_url": "https://pgrkam.com"
        },
        "source": {
            "department": "Department of Employment Generation, Punjab",
            "source_url": "https://pgrkam.com",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Punjab Old Age Pension Scheme",
        "slug": "punjab-old-age-pension",
        "description": "State social security monthly pension provided by Government of Punjab to destitute elderly persons who lack sufficient source of livelihood.",
        "category": ["pension", "senior_citizens", "social_welfare"],
        "government": {
            "level": "state",
            "department": "Department of Social Security and Women & Child Development, Government of Punjab"
        },
        "eligibility": {
            "age": {"min": 58, "max": 120},
            "income": {"min": None, "max": 60000},
            "states": ["Punjab"],
            "districts": [],
            "occupations": ["unemployed", "worker"],
            "education": [],
            "gender": [],
            "categories": [],
            "is_farmer": None,
            "is_student": False,
            "is_disabled": None
        },
        "benefits": [
            "Monthly financial pension of ₹1,500 transferred directly to bank account of senior citizens (women aged 58+ and men aged 65+) having annual family income ≤ ₹60,000"
        ],
        "documents": [
            "Punjab Domicile / Residence Certificate (voter card, ration card)",
            "Age proof (School certificate, Voter Card, or Civil Surgeon medical age certificate)",
            "Income certificate / Patwari verification (family income not exceeding ₹60,000/year and land ≤ 2.5 acres)",
            "Aadhaar Card and Bank Account passbook"
        ],
        "application": {
            "method": "hybrid",
            "steps": [
                "Obtain application form from District Social Security Office (DSSO), Sewa Kendra, or sswcd.punjab.gov.in",
                "Get verification from Municipal Councilor or Sarpanch and Patwari",
                "Submit at Sewa Kendra or online on Connect Punjab portal",
                "Pension disbursed monthly via DBT"
            ],
            "official_url": "https://sswcd.punjab.gov.in"
        },
        "source": {
            "department": "Department of Social Security, Punjab",
            "source_url": "https://sswcd.punjab.gov.in/en/old-age-pension",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Punjab Financial Assistance to Persons with Disabilities",
        "slug": "punjab-disability-pension",
        "description": "State monthly disability pension assistance for persons with recognized physical or mental disabilities of 40% or more living in Punjab.",
        "category": ["disability", "pension", "social_welfare"],
        "government": {
            "level": "state",
            "department": "Department of Social Security and Women & Child Development, Government of Punjab"
        },
        "eligibility": {
            "age": {"min": 0, "max": 120},
            "income": {"min": None, "max": 60000},
            "states": ["Punjab"],
            "districts": [],
            "occupations": [],
            "education": [],
            "gender": [],
            "categories": [],
            "is_farmer": None,
            "is_student": None,
            "is_disabled": True
        },
        "benefits": [
            "Monthly financial assistance of ₹1,500 directly deposited to bank account to provide dignity and support"
        ],
        "documents": [
            "Disability Certificate / UDID card issued by Civil Surgeon (minimum 40% disability)",
            "Punjab Residence Certificate",
            "Income Certificate (family income ≤ ₹60,000 per annum)",
            "Aadhaar Card and Bank Account details"
        ],
        "application": {
            "method": "hybrid",
            "steps": [
                "Obtain form from Sewa Kendra or download from sswcd.punjab.gov.in",
                "Attach UDID / Civil Surgeon disability certificate and income verification",
                "Submit application at nearest Sewa Kendra",
                "Sanctioned by District Social Security Officer and credited monthly"
            ],
            "official_url": "https://sswcd.punjab.gov.in"
        },
        "source": {
            "department": "Department of Social Security, Government of Punjab",
            "source_url": "https://sswcd.punjab.gov.in/en/financial-assistance-to-disabled-persons",
            "last_verified": "2026-03-01"
        },
        "status": "active",
        "is_demo_data": False
    }
]
