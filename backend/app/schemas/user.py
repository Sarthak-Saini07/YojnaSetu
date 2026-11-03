from datetime import datetime, date, timezone
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict, model_validator


class UserProfile(BaseModel):
    """Structured User Profile for scheme eligibility evaluation and persistent storage."""

    date_of_birth: Optional[str] = Field(None, description="Date of birth in YYYY-MM-DD format")
    age: Optional[int] = Field(None, ge=0, le=120, description="Age in years (calculated from DOB if provided)")
    gender: Optional[str] = Field(None, description="Gender (e.g., Male, Female, Other, All)")
    state: Optional[str] = Field(None, description="State of residence (e.g., Punjab, Haryana)")
    district: Optional[str] = Field(None, description="District of residence")
    annual_income: Optional[float] = Field(None, ge=0, description="Annual family income in INR")
    occupation: Optional[str] = Field(None, description="Primary occupation (e.g., student, farmer, artisan, employed, unemployed)")
    education: Optional[str] = Field(None, description="Education level (e.g., 10th_pass, 12th_pass, undergraduate, postgraduate)")
    category: Optional[str] = Field(None, description="Social category (e.g., General, OBC, SC, ST, EWS)")
    employment_status: Optional[str] = Field(None, description="Employment status (e.g., employed, unemployed, self_employed)")
    marital_status: Optional[str] = Field(None, description="Marital status (e.g., single, married, widowed, divorced)")
    family_members: Optional[int] = Field(None, ge=1, le=50, description="Number of family members")
    disability_status: Optional[str] = Field(None, description="Disability description/status if any")
    is_student: Optional[bool] = Field(None, description="Whether user is currently a student")
    is_farmer: Optional[bool] = Field(None, description="Whether user is a registered/practicing farmer")
    is_disabled: Optional[bool] = Field(None, description="Whether user has a recognized disability")
    profile_completion_percentage: Optional[int] = Field(None, description="Calculated profile completion percentage")

    @model_validator(mode="after")
    def calculate_age_and_completion(self):
        # Calculate age from date_of_birth if dob is provided and age is not explicitly set
        if self.date_of_birth and self.age is None:
            try:
                dob = datetime.strptime(self.date_of_birth.strip(), "%Y-%m-%d").date()
                today = date.today()
                calc_age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
                self.age = max(0, calc_age)
            except Exception:
                pass

        # Calculate profile completion percentage based on core eligibility fields
        core_fields = [
            self.age,
            self.gender,
            self.state,
            self.district,
            self.annual_income,
            self.occupation,
            self.education,
            self.category,
        ]
        filled = sum(1 for f in core_fields if f is not None and f != "")
        self.profile_completion_percentage = round((filled / len(core_fields)) * 100)
        return self


class UserBase(BaseModel):
    name: Optional[str] = Field(None, description="Citizen full name")
    full_name: Optional[str] = Field(None, description="Citizen full name alias")
    email: EmailStr
    phone: Optional[str] = Field(None, description="Contact phone number")
    role: str = Field("user", description="Role: user or admin")


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Raw password to be hashed")
    profile: Optional[UserProfile] = Field(default_factory=UserProfile)

    @model_validator(mode="after")
    def normalize_name(self):
        if not self.name and self.full_name:
            self.name = self.full_name
        elif not self.full_name and self.name:
            self.full_name = self.name
        return self


class UserResponse(UserBase):
    id: str = Field(..., alias="_id")
    profile: UserProfile = Field(default_factory=UserProfile)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(populate_by_name=True)


class UserInDB(UserBase):
    id: str = Field(..., alias="_id")
    password_hash: str
    profile: UserProfile
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(populate_by_name=True)

