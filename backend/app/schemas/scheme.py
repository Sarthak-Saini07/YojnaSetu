from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class AgeRule(BaseModel):
    min: Optional[int] = Field(None, ge=0, le=120, description="Minimum required age (inclusive)")
    max: Optional[int] = Field(None, ge=0, le=120, description="Maximum allowed age (inclusive)")


class IncomeRule(BaseModel):
    min: Optional[float] = Field(None, ge=0, description="Minimum income threshold")
    max: Optional[float] = Field(None, ge=0, description="Maximum annual income threshold (inclusive)")


class EligibilityRules(BaseModel):
    """Structured eligibility rule criteria evaluated by the deterministic engine."""

    age: Optional[AgeRule] = Field(default_factory=AgeRule)
    income: Optional[IncomeRule] = Field(default_factory=IncomeRule)
    states: List[str] = Field(default_factory=list, description="Accepted states. Empty list means ALL India")
    districts: List[str] = Field(default_factory=list, description="Accepted districts. Empty means ALL districts")
    occupations: List[str] = Field(default_factory=list, description="Accepted occupations. Empty means ALL")
    education: List[str] = Field(default_factory=list, description="Accepted education levels. Empty means ALL")
    gender: List[str] = Field(default_factory=list, description="Accepted genders. Empty means ALL")
    categories: List[str] = Field(default_factory=list, description="Accepted social categories. Empty means ALL")
    is_farmer: Optional[bool] = Field(None, description="True if mandatory farmer status, False if non-farmer, None if irrelevant")
    is_student: Optional[bool] = Field(None, description="True if mandatory student status, False if non-student, None if irrelevant")
    is_disabled: Optional[bool] = Field(None, description="True if mandatory disability status, None if irrelevant")


class GovernmentInfo(BaseModel):
    level: str = Field(..., description="central or state")
    department: str = Field(..., min_length=1, description="Name of Ministry or Department")


class ApplicationInfo(BaseModel):
    method: str = Field("online", description="online, offline, or hybrid")
    steps: List[str] = Field(default_factory=list, description="Step by step application guide")
    official_url: str = Field(..., min_length=5, description="Official portal/application URL")


class SourceInfo(BaseModel):
    department: str = Field(..., min_length=1, description="Authoritative source department name")
    source_url: str = Field(..., min_length=5, description="Official documentation source URL")
    last_verified: str = Field(..., min_length=4, description="Verification date in YYYY-MM-DD format")


class SchemeBase(BaseModel):
    name: str = Field(..., min_length=3, description="Official scheme name")
    slug: str = Field(..., min_length=2, description="Unique URL friendly identifier")
    description: str = Field(..., min_length=5, description="Comprehensive description of scheme purpose")
    category: List[str] = Field(..., description="Categories e.g. education, agriculture, scholarship")
    government: GovernmentInfo
    eligibility: EligibilityRules
    benefits: List[str] = Field(default_factory=list, description="List of benefits provided")
    documents: List[str] = Field(default_factory=list, description="Required application documents")
    application: ApplicationInfo
    source: SourceInfo
    status: str = Field("active", description="active, inactive, or archived")
    is_demo_data: bool = Field(False, description="True if marked as synthetic demo scheme")


class SchemeCreate(SchemeBase):
    pass


class SchemeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[List[str]] = None
    government: Optional[GovernmentInfo] = None
    eligibility: Optional[EligibilityRules] = None
    benefits: Optional[List[str]] = None
    documents: Optional[List[str]] = None
    application: Optional[ApplicationInfo] = None
    source: Optional[SourceInfo] = None
    status: Optional[str] = None
    is_demo_data: Optional[bool] = None


class SchemeResponse(SchemeBase):
    id: str = Field(..., alias="_id")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(populate_by_name=True)
