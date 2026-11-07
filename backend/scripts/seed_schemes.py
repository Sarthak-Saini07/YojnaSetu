#!/usr/bin/env python3
"""
Seed script to populate MongoDB Atlas with initial 15 verified authoritative government schemes.
Validates all scheme documents against the Pydantic SchemeCreate schema before upserting.
Data-Quality Verified against official government portals (.gov.in, .nic.in, .ac.in).
"""

import sys
import os
import logging
import urllib.request
import json
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

from app.database import db_manager
from app.schemas.scheme import SchemeCreate
from app.repositories.scheme_repository import scheme_repository

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("seed_schemes")

SEED_SCHEMES = [
    {
        "name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
        "slug": "pm-kisan",
        "description": "Direct income support scheme for landholding farmer families across India to supplement their financial needs for procuring agricultural inputs and domestic needs.",
        "category": ["agriculture", "financial_assistance"],
        "government": {
            "level": "central",
            "department": "Ministry of Agriculture and Farmers Welfare"
        },
        "eligibility": {
            "age": {"min": 18, "max": None},
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
            "Financial benefit of ₹6,000 per year transferred directly to bank account in 3 equal installments of ₹2,000 every 4 months"
        ],
        "documents": [
            "Aadhaar Card",
            "Proof of agricultural landholding (Khata/Khatauni)",
            "Bank Account Passbook with IFSC (Aadhaar-seeded)",
            "Active mobile number"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Visit the official PM-KISAN online portal (pmkisan.gov.in)",
                "Navigate to Farmers Corner and select New Farmer Registration",
                "Enter Aadhaar number and select state",
                "Fill in land ownership details and bank account numbers",
                "Submit form for verification by state nodal officer"
            ],
            "official_url": "https://pmkisan.gov.in"
        },
        "source": {
            "department": "Department of Agriculture & Farmers Welfare",
            "source_url": "https://pmkisan.gov.in",
            "last_verified": "2026-02-15"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "PM Vidya Lakshmi Education Loan Scheme",
        "slug": "pm-vidya-lakshmi",
        "description": "First of its kind single-window portal for students seeking educational loans and Central Sector Interest Subsidy (CSIS) for pursuing higher education in India or abroad.",
        "category": ["education", "loan", "financial_assistance"],
        "government": {
            "level": "central",
            "department": "Ministry of Education"
        },
        "eligibility": {
            "age": {"min": 16, "max": 35},
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
            "Single application form for applying to multiple banks for education loans",
            "Full interest subsidy during the moratorium period (course period + 1 year) for students with family income up to ₹4.5 lakh"
        ],
        "documents": [
            "Aadhaar Card",
            "Mark sheets of 10th and 12th board exams",
            "Admission letter from recognized educational institution",
            "Income certificate issued by competent state authority",
            "Bank statement of student and co-borrower"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Register on the Vidya Lakshmi Portal (vidyalakshmi.co.in)",
                "Fill out the Common Educational Loan Application Form (CELAF)",
                "Search and select suitable education loan schemes from registered banks",
                "Upload required academic and income documents",
                "Submit application directly to preferred bank branch"
            ],
            "official_url": "https://www.vidyalakshmi.co.in"
        },
        "source": {
            "department": "Department of Higher Education",
            "source_url": "https://www.vidyalakshmi.co.in",
            "last_verified": "2026-02-15"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Post-Matric Scholarship for SC Students",
        "slug": "post-matric-scholarship-sc",
        "description": "Centrally Sponsored Scheme providing financial assistance to Scheduled Caste students studying at post-matrix or post-secondary stage to enable them to complete their education.",
        "category": ["education", "scholarship"],
        "government": {
            "level": "central",
            "department": "Ministry of Social Justice and Empowerment"
        },
        "eligibility": {
            "age": {"min": 15, "max": 30},
            "income": {"min": None, "max": 250000},
            "states": [],
            "districts": [],
            "occupations": ["student"],
            "education": ["11th_pass", "12th_pass", "undergraduate", "postgraduate"],
            "gender": [],
            "categories": ["sc"],
            "is_farmer": None,
            "is_student": True,
            "is_disabled": None
        },
        "benefits": [
            "Full compulsory non-refundable fees reimbursement charged by recognized institution",
            "Monthly maintenance allowance ranging from ₹2,500 to ₹13,500 per annum depending on academic course group"
        ],
        "documents": [
            "Cast Certificate (SC) issued by authorized state authority",
            "Income Certificate (family income ≤ ₹2.5 Lakh per annum)",
            "Aadhaar Card linked with active bank account",
            "Previous class mark sheet",
            "Fee receipt of current academic session"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Register on National Scholarship Portal (NSP at scholarships.gov.in)",
                "Complete e-KYC using Aadhaar number",
                "Select Post-Matric Scholarship Scheme for SC Students",
                "Upload caste, income, and fee documents",
                "Submit form for institutional and state verification"
            ],
            "official_url": "https://scholarships.gov.in"
        },
        "source": {
            "department": "Ministry of Social Justice and Empowerment",
            "source_url": "https://socialjustice.gov.in/schemes/26",
            "last_verified": "2026-02-15"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
        "slug": "ayushman-bharat-pmjay",
        "description": "World's largest health assurance scheme aiming to provide health cover of ₹5 lakh per family per year for secondary and tertiary care hospitalization to poor and vulnerable families.",
        "category": ["healthcare", "insurance"],
        "government": {
            "level": "central",
            "department": "Ministry of Health and Family Welfare"
        },
        "eligibility": {
            "age": {"min": 0, "max": 120},
            "income": {"min": None, "max": 300000},
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
            "Cashless and paperless access to healthcare services up to ₹5,000,000 per family per year",
            "Covers up to 3 days of pre-hospitalization and 15 days post-hospitalization expenses including diagnostics and medicines"
        ],
        "documents": [
            "Aadhaar Card or Ration Card",
            "Proof of identity and residential address",
            "PM-JAY Golden Card or Ayushman Card"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Check eligibility on official portal (pmjay.gov.in)",
                "Visit nearest Ayushman Mitra at empanelled hospital or Common Service Centre (CSC)",
                "Verify biometric identity via Aadhaar",
                "Generate Ayushman Bharat PVC Card"
            ],
            "official_url": "https://pmjay.gov.in"
        },
        "source": {
            "department": "National Health Authority (NHA)",
            "source_url": "https://pmjay.gov.in",
            "last_verified": "2026-02-15"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "PM MUDRA Yojana (PMMY)",
        "slug": "pm-mudra-yojana",
        "description": "Scheme to provide collateral-free microloans up to ₹10 lakh (and ₹20 lakh under Tarun Plus) to non-corporate, non-farm small/micro enterprises for income generating activities.",
        "category": ["business", "microfinance", "loan"],
        "government": {
            "level": "central",
            "department": "Ministry of Finance"
        },
        "eligibility": {
            "age": {"min": 18, "max": 65},
            "income": {"min": None, "max": None},
            "states": [],
            "districts": [],
            "occupations": ["artisan", "self_employed", "entrepreneur", "small_business_owner", "trader"],
            "education": [],
            "gender": [],
            "categories": [],
            "is_farmer": False,
            "is_student": None,
            "is_disabled": None
        },
        "benefits": [
            "Collateral-free loans categorized into Shishu (up to ₹50,000), Kishor (₹50,000 to ₹5 Lakh), and Tarun (₹5 Lakh to ₹10 Lakh)",
            "MUDRA Card issued for working capital credit facility"
        ],
        "documents": [
            "Self-attested identity proof (Aadhaar / Voter ID / PAN)",
            "Proof of business address and registration certificates",
            "Project report detailing proposed business activity and machinery required",
            "Bank account statements for last 6 months"
        ],
        "application": {
            "method": "hybrid",
            "steps": [
                "Prepare business plan and identify required MUDRA loan category",
                "Apply online via Udyami Mitra portal or visit nearest commercial/RRB bank branch",
                "Fill standard MUDRA application form and submit business documents",
                "Sanction of loan and issuance of MUDRA debit card"
            ],
            "official_url": "https://www.mudra.org.in"
        },
        "source": {
            "department": "Department of Financial Services",
            "source_url": "https://www.mudra.org.in",
            "last_verified": "2026-02-15"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "PM SVANidhi (Street Vendor's AtmaNirbhar Nidhi)",
        "slug": "pm-svanidhi",
        "description": "Special micro-credit facility for street vendors providing affordable working capital loans to resume livelihoods affected by economic disruptions.",
        "category": ["financial_assistance", "loan", "urban_development"],
        "government": {
            "level": "central",
            "department": "Ministry of Housing and Urban Affairs"
        },
        "eligibility": {
            "age": {"min": 18, "max": None},
            "income": {"min": None, "max": None},
            "states": [],
            "districts": [],
            "occupations": ["street_vendor", "trader"],
            "education": [],
            "gender": [],
            "categories": [],
            "is_farmer": False,
            "is_student": False,
            "is_disabled": None
        },
        "benefits": [
            "First tranche collateral-free loan up to ₹10,000/₹15,000, with enhanced limits of ₹20,000 and ₹50,000 on timely repayment",
            "Interest subsidy at 7% per annum credited quarterly on prompt repayment",
            "Cashback incentive up to ₹1,200 per year on digital transactions"
        ],
        "documents": [
            "Certificate of Vending (CoV) or Identity Card issued by Urban Local Bodies (ULB)",
            "Aadhaar Card linked to bank account",
            "Bank passbook copy"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Visit PM SVANidhi portal (pmsvanidhi.mohua.gov.in) or Mobile App",
                "Enter mobile number linked with Aadhaar",
                "Fill online loan application form and select lending institution",
                "Upload Vending Certificate or ULB recommendation letter",
                "Application processed and loan disbursed directly by bank"
            ],
            "official_url": "https://pmsvanidhi.mohua.gov.in"
        },
        "source": {
            "department": "Ministry of Housing and Urban Affairs",
            "source_url": "https://pmsvanidhi.mohua.gov.in",
            "last_verified": "2026-02-15"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "National Means-cum-Merit Scholarship Scheme (NMMSS)",
        "slug": "nmmss-scholarship",
        "description": "Scholarship awarded to meritorious students of economically weaker sections to arrest dropouts at class VIII and encourage them to continue study at secondary stage.",
        "category": ["education", "scholarship"],
        "government": {
            "level": "central",
            "department": "Ministry of Education"
        },
        "eligibility": {
            "age": {"min": 12, "max": 18},
            "income": {"min": None, "max": 350000},
            "states": [],
            "districts": [],
            "occupations": ["student"],
            "education": ["8th_pass"],
            "gender": [],
            "categories": [],
            "is_farmer": None,
            "is_student": True,
            "is_disabled": None
        },
        "benefits": [
            "Financial scholarship of ₹12,000 per annum (₹1,000 per month) for selected students studying in classes IX to XII in government/aided schools"
        ],
        "documents": [
            "Class VII mark sheet (minimum 55% marks or equivalent)",
            "Parental Income Certificate (annual income ≤ ₹3.5 Lakh)",
            "Caste / Disability certificate (if applicable)",
            "Aadhaar details and bank account passbook"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Appear for State level NMMSS selection test conducted for class VIII students",
                "Qualify merit list of the selection examination",
                "Register on National Scholarship Portal (NSP at scholarships.gov.in)",
                "Submit scholarship application and link bank account for Direct Benefit Transfer"
            ],
            "official_url": "https://scholarships.gov.in"
        },
        "source": {
            "department": "Department of School Education and Literacy",
            "source_url": "https://dsel.education.gov.in/scheme/nmmss",
            "last_verified": "2026-02-15"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "PM Vishwakarma Scheme",
        "slug": "pm-vishwakarma",
        "description": "Comprehensive scheme to provide end-to-end support to traditional artisans and craftspeople engaged in 18 traditional trades to enhance product quality and market reach.",
        "category": ["skill_development", "artisan", "financial_assistance"],
        "government": {
            "level": "central",
            "department": "Ministry of Micro, Small and Medium Enterprises"
        },
        "eligibility": {
            "age": {"min": 18, "max": 65},
            "income": {"min": None, "max": None},
            "states": [],
            "districts": [],
            "occupations": ["artisan", "craftsperson", "carpenter", "blacksmith", "goldsmith", "barber", "tailor", "cobbler"],
            "education": [],
            "gender": [],
            "categories": [],
            "is_farmer": False,
            "is_student": False,
            "is_disabled": None
        },
        "benefits": [
            "PM Vishwakarma Certificate and ID Card recognition",
            "Basic skill training of 5-7 days and Advanced training of 15 days with stipend of ₹500/day",
            "Toolkit incentive of ₹15,000",
            "Collateral-free credit support up to ₹3 Lakh (₹1 Lakh 1st tranche + ₹2 Lakh 2nd tranche) at concessional 5% interest rate"
        ],
        "documents": [
            "Aadhaar Card",
            "Active mobile number",
            "Bank Account details",
            "Proof of traditional trade occupation"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Visit Common Service Centre (CSC) or PM Vishwakarma portal (pmvishwakarma.gov.in)",
                "Complete Aadhaar biometric authentication",
                "Fill artisan profile form and select trade specialization",
                "Verification by Gram Panchayat / Urban Local Body",
                "Final approval by District Implementation Committee"
            ],
            "official_url": "https://pmvishwakarma.gov.in"
        },
        "source": {
            "department": "Ministry of MSME",
            "source_url": "https://pmvishwakarma.gov.in",
            "last_verified": "2026-02-15"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Stand Up India Scheme",
        "slug": "stand-up-india",
        "description": "Scheme to facilitate bank loans between ₹10 lakh and ₹1 crore to SC/ST and/or Woman entrepreneurs per bank branch for setting up a greenfield enterprise.",
        "category": ["business", "entrepreneurship", "loan"],
        "government": {
            "level": "central",
            "department": "Ministry of Finance"
        },
        "eligibility": {
            "age": {"min": 18, "max": 65},
            "income": {"min": None, "max": None},
            "states": [],
            "districts": [],
            "occupations": ["entrepreneur", "self_employed", "small_business_owner"],
            "education": [],
            "gender": ["female"],
            "categories": ["sc", "st", "general"],
            "is_farmer": False,
            "is_student": False,
            "is_disabled": None
        },
        "benefits": [
            "Bank loan from ₹10 Lakh to ₹1 Crore covering up to 75% of total project cost for manufacturing, services, or trading sector",
            "Credit Guarantee Scheme support through NCGTC"
        ],
        "documents": [
            "Proof of identity (Aadhaar / Passport / Voter ID)",
            "Caste certificate (for SC/ST category applicants)",
            "Project report for proposed greenfield business",
            "Proof of business premises address"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Visit Stand Up Mitra online portal (standupmitra.in)",
                "Register as a borrower and fill application form",
                "Select preference for handheld support or direct bank connection",
                "Upload business proposal and financial projections",
                "Bank evaluates proposal and sanctions loan"
            ],
            "official_url": "https://www.standupmitra.in"
        },
        "source": {
            "department": "Department of Financial Services",
            "source_url": "https://www.standupmitra.in",
            "last_verified": "2026-02-15"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
        "slug": "pmay-gramin",
        "description": "Flagship housing scheme aimed at providing a pucca house with basic amenities to all houseless households and those living in kutcha houses in rural India.",
        "category": ["housing", "infrastructure"],
        "government": {
            "level": "central",
            "department": "Ministry of Rural Development"
        },
        "eligibility": {
            "age": {"min": 18, "max": None},
            "income": {"min": None, "max": 300000},
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
            "Financial assistance of ₹120,000 in plain areas and ₹130,000 in hilly/difficult/IAP areas",
            "90/95 person-days of unskilled labor support under MGNREGS",
            "Assistance of ₹12,000 for toilet construction under Swachh Bharat Mission - Gramin"
        ],
        "documents": [
            "Aadhaar Card",
            "Job Card under MGNREGA",
            "Bank account passbook copy",
            "Consent document to use Aadhaar for DBT"
        ],
        "application": {
            "method": "hybrid",
            "steps": [
                "Beneficiaries identified through SECC 2011 data and verified by Gram Sabha",
                "Awaas+ survey carried out by local panchayat officials",
                "GEO-tagging of construction site before sanction",
                "Installments credited directly to beneficiary bank account upon milestone verification"
            ],
            "official_url": "https://pmayg.nic.in"
        },
        "source": {
            "department": "Ministry of Rural Development",
            "source_url": "https://pmayg.nic.in",
            "last_verified": "2026-02-15"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Sukanya Samriddhi Yojana (SSY)",
        "slug": "sukanya-samriddhi-yojana",
        "description": "Small deposit savings scheme backed by Government of India for the financial security and educational needs of girl children.",
        "category": ["savings", "women_empowerment", "financial_security"],
        "government": {
            "level": "central",
            "department": "Ministry of Finance"
        },
        "eligibility": {
            "age": {"min": 0, "max": 10},
            "income": {"min": None, "max": None},
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
            "Highest interest rate among small savings schemes (8.2% per annum, compounded annually)",
            "Tax exemption under Section 80C on deposit amount, interest earned, and maturity payout (EEE tax status)",
            "Partial withdrawal up to 50% allowed for higher education expenses after girl child turns 18"
        ],
        "documents": [
            "Birth Certificate of the girl child",
            "Identity proof and address proof of guardian (Aadhaar / Voter ID / Passport)",
            "Passport size photographs of guardian and child"
        ],
        "application": {
            "method": "offline",
            "steps": [
                "Visit nearest India Post Office or authorized commercial bank branch",
                "Fill Sukanya Samriddhi Account opening form (Form-1)",
                "Submit child's birth certificate and guardian's KYC documents",
                "Deposit initial opening amount (minimum ₹250)",
                "Receive SSY account passbook"
            ],
            "official_url": "https://www.indiapost.gov.in"
        },
        "source": {
            "department": "Department of Posts / Ministry of Finance",
            "source_url": "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=89",
            "last_verified": "2026-02-15"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Punjab Ashirwad Scheme (State Scheme)",
        "slug": "punjab-ashirwad-scheme",
        "description": "State welfare scheme by Govt of Punjab providing one-time financial assistance for the marriage of daughters belonging to SC, Backward Classes, and economically weaker families.",
        "category": ["social_welfare", "financial_assistance"],
        "government": {
            "level": "state",
            "department": "Department of Social Justice, Empowerment and Minorities, Govt of Punjab"
        },
        "eligibility": {
            "age": {"min": 18, "max": 45},
            "income": {"min": None, "max": 32790},
            "states": ["Punjab"],
            "districts": [],
            "occupations": [],
            "education": [],
            "gender": ["female"],
            "categories": ["sc", "bc", "christian", "ebc"],
            "is_farmer": None,
            "is_student": None,
            "is_disabled": None
        },
        "benefits": [
            "One-time financial grant of ₹51,000 transferred directly to the bride's bank account prior to or at the time of marriage"
        ],
        "documents": [
            "Punjab Domicile / Residence Certificate",
            "Caste / Category Certificate (SC/BC/EBC)",
            "Family Income Certificate issued by Tehsildar (annual income ≤ ₹32,790)",
            "Age proof of bride (Aadhaar Card / School certificate)",
            "Marriage Invitation Card / Marriage Certificate"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Visit Punjab e-District / Connect Punjab portal",
                "Register applicant account and choose Ashirwad Scheme service",
                "Fill bride personal details and bank account numbers",
                "Upload residence, income, and caste certificates at least 30 days prior to marriage",
                "Sanctioned by District Social Justice Officer"
            ],
            "official_url": "https://punjab.gov.in"
        },
        "source": {
            "department": "Department of Social Justice, Govt of Punjab",
            "source_url": "https://socialjustice.punjab.gov.in",
            "last_verified": "2026-02-15"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Haryana Post-Matric Scholarship Scheme (State Scheme)",
        "slug": "haryana-post-matric-scholarship",
        "description": "State level post-matric scholarship scheme for Scheduled Caste and Backward Class students domiciled in Haryana pursuing post-secondary education.",
        "category": ["education", "scholarship"],
        "government": {
            "level": "state",
            "department": "Department of Higher Education, Govt of Haryana"
        },
        "eligibility": {
            "age": {"min": 15, "max": 30},
            "income": {"min": None, "max": 250000},
            "states": ["Haryana"],
            "districts": [],
            "occupations": ["student"],
            "education": ["11th_pass", "12th_pass", "undergraduate", "postgraduate"],
            "gender": [],
            "categories": ["sc", "bc"],
            "is_farmer": None,
            "is_student": True,
            "is_disabled": None
        },
        "benefits": [
            "100% tuition fee and non-refundable institutional fee reimbursement",
            "Monthly maintenance stipend ranging from ₹300 to ₹1,200 per month"
        ],
        "documents": [
            "Haryana Resident / Domicile Certificate (Parivar Pehchan Patra PPP)",
            "Caste Certificate (SC/BC)",
            "Family Income Certificate",
            "Class 10th & 12th Board Mark sheets",
            "Fee receipt of current college session"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Log on to Har-Chhatravratti portal (harchhatravratti.highereduhry.ac.in)",
                "Enter Parivar Pehchan Patra (Family ID) to fetch member details",
                "Select Haryana Post-Matric Scholarship scheme",
                "Upload current academic admission documents and verify bank details",
                "Institute verifies and forwards to Nodal Officer"
            ],
            "official_url": "https://harchhatravratti.highereduhry.ac.in"
        },
        "source": {
            "department": "Department of Higher Education, Govt of Haryana",
            "source_url": "https://harchhatravratti.highereduhry.ac.in",
            "last_verified": "2026-02-15"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Mukhyamantri Kisan Sahay Yojana (State Scheme)",
        "slug": "mukhyamantri-kisan-sahay-yojana",
        "description": "State crop insurance replacement scheme by Govt of Gujarat offering financial assistance to farmers against crop loss due to drought, unseasonal rainfall, or heavy rains.",
        "category": ["agriculture", "disaster_relief"],
        "government": {
            "level": "state",
            "department": "Department of Agriculture, Farmers Welfare and Co-operation, Govt of Gujarat"
        },
        "eligibility": {
            "age": {"min": 18, "max": None},
            "income": {"min": None, "max": None},
            "states": ["Gujarat"],
            "districts": [],
            "occupations": ["farmer"],
            "education": [],
            "gender": [],
            "categories": [],
            "is_farmer": True,
            "is_student": False,
            "is_disabled": None
        },
        "benefits": [
            "Assistance of ₹20,000 per hectare for crop damage between 33% and 60% (up to max 4 hectares)",
            "Assistance of ₹25,000 per hectare for crop loss exceeding 60% (up to max 4 hectares)",
            "No premium payment required from farmers"
        ],
        "documents": [
            "Land 8-A revenue record and 7/12 land extract",
            "Aadhaar Card",
            "Bank passbook details",
            "Crop sowing certificate issued by Talati/Patwari"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Apply on e-Khedut portal (ikhedut.gujarat.gov.in) following disaster declaration",
                "Enter Aadhaar and land survey numbers",
                "Upload crop sowing proof",
                "Talati verifies field damage level",
                "Compensation transferred directly via DBT"
            ],
            "official_url": "https://ikhedut.gujarat.gov.in"
        },
        "source": {
            "department": "Department of Agriculture, Govt of Gujarat",
            "source_url": "https://ikhedut.gujarat.gov.in",
            "last_verified": "2026-02-15"
        },
        "status": "active",
        "is_demo_data": False
    },
    {
        "name": "Central Sector Scheme of Scholarship for College and University Students",
        "slug": "central-sector-scholarship-college",
        "description": "National scholarship scheme providing financial assistance to meritorious students from low-income families to meet day-to-day expenses while pursuing higher studies.",
        "category": ["education", "scholarship"],
        "government": {
            "level": "central",
            "department": "Department of Higher Education, Ministry of Education"
        },
        "eligibility": {
            "age": {"min": 17, "max": 25},
            "income": {"min": None, "max": 450000},
            "states": [],
            "districts": [],
            "occupations": ["student"],
            "education": ["12th_pass", "undergraduate"],
            "gender": [],
            "categories": [],
            "is_farmer": None,
            "is_student": True,
            "is_disabled": None
        },
        "benefits": [
            "Scholarship rate of ₹12,000 per annum at Graduation level for 1st three years of college",
            "Scholarship rate of ₹20,000 per annum at Post-Graduation level"
        ],
        "documents": [
            "Class 12th Board Examination Marksheet (top 80th percentile)",
            "Income certificate (family annual income ≤ ₹4.5 Lakh)",
            "Aadhaar Card linked with bank account",
            "Admission confirmation letter from recognized University/College"
        ],
        "application": {
            "method": "online",
            "steps": [
                "Register on National Scholarship Portal (NSP at scholarships.gov.in)",
                "Select Central Sector Scheme of Scholarship for College and University Students",
                "Enter Class 12 board roll number and year of passing",
                "Upload income certificate and bank details",
                "Application verified online by college and state nodal officer"
            ],
            "official_url": "https://scholarships.gov.in"
        },
        "source": {
            "department": "Department of Higher Education, Ministry of Education",
            "source_url": "https://education.gov.in/scholarships-education-loan-0",
            "last_verified": "2026-02-15"
        },
        "status": "active",
        "is_demo_data": False
    }
]

# Import and append 27 additional verified schemes
try:
    from scripts.additional_schemes import ADDITIONAL_SCHEMES
except ImportError:
    try:
        from additional_schemes import ADDITIONAL_SCHEMES
    except ImportError:
        ADDITIONAL_SCHEMES = []

SEED_SCHEMES.extend(ADDITIONAL_SCHEMES)

# Also import user repository to ensure user indexes are created during seeding
from app.repositories.user_repository import user_repository


def fetch_public_ip():
    try:
        req = urllib.request.Request("https://api.ipify.org?format=json", headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data.get("ip")
    except Exception:
        return "Unknown"


def seed_database():
    """Validate and seed verified schemes into MongoDB."""
    logger.info("Connecting to MongoDB...")
    try:
        db_manager.connect()
    except Exception as err:
        pub_ip = fetch_public_ip()
        logger.error(f"Could not connect to MongoDB database: {err}")
        return False

    logger.info("Creating database indexes for user and scheme collections...")
    scheme_repository.create_indexes()
    user_repository.create_indexes()

    success_count = 0
    logger.info(f"Validating and seeding {len(SEED_SCHEMES)} verified government schemes...")

    for raw_scheme in SEED_SCHEMES:
        try:
            # Validate through Pydantic model
            scheme_obj = SchemeCreate(**raw_scheme)
            scheme_dict = scheme_obj.model_dump()
            
            # Idempotent Upsert into MongoDB
            upserted = scheme_repository.upsert_scheme(scheme_dict)
            logger.info(f"Successfully seeded scheme: '{upserted['name']}' (slug: {upserted['slug']})")
            success_count += 1
        except Exception as e:
            logger.error(f"Failed to seed scheme '{raw_scheme.get('name')}': {e}")

    total_in_db = scheme_repository.count()
    logger.info(f"Seeding completed! {success_count}/{len(SEED_SCHEMES)} schemes verified & upserted. Total schemes in DB: {total_in_db}")
    return True


if __name__ == "__main__":
    seed_database()
