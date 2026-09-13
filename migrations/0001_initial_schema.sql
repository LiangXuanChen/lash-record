-- lash-record / Cloudflare D1
-- V1 initial schema
-- 日期時間欄位由 Worker 以 Asia/Taipei 產生；不要依賴 CURRENT_TIMESTAMP。

PRAGMA foreign_keys = ON;

CREATE TABLE AppUser (
    UserId TEXT PRIMARY KEY,
    GoogleSubject TEXT NULL UNIQUE,
    Email TEXT NOT NULL UNIQUE,
    DisplayName TEXT NOT NULL,
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    Creator TEXT NULL,
    CreateDate TEXT NOT NULL,
    Modifier TEXT NULL,
    ModifiedDate TEXT NULL,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
);

CREATE TABLE SystemCode (
    SystemCodeId TEXT PRIMARY KEY,
    CodeType TEXT NOT NULL,
    Code TEXT NOT NULL,
    Name TEXT NOT NULL,
    SortOrder INTEGER NOT NULL,
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    Creator TEXT NOT NULL,
    CreateDate TEXT NOT NULL,
    Modifier TEXT NULL,
    ModifiedDate TEXT NULL,
    UNIQUE (CodeType, Code),
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
);

CREATE TABLE LashStyle (
    LashStyleId TEXT PRIMARY KEY,
    Name TEXT NOT NULL UNIQUE,
    SortOrder INTEGER NOT NULL,
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    Creator TEXT NOT NULL,
    CreateDate TEXT NOT NULL,
    Modifier TEXT NULL,
    ModifiedDate TEXT NULL,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
);

CREATE TABLE LashType (
    LashTypeId TEXT PRIMARY KEY,
    Name TEXT NOT NULL UNIQUE,
    SortOrder INTEGER NOT NULL,
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    Creator TEXT NOT NULL,
    CreateDate TEXT NOT NULL,
    Modifier TEXT NULL,
    ModifiedDate TEXT NULL,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
);

CREATE TABLE LashColor (
    LashColorId TEXT PRIMARY KEY,
    LashTypeId TEXT NOT NULL,
    Name TEXT NOT NULL,
    SortOrder INTEGER NOT NULL,
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    Creator TEXT NOT NULL,
    CreateDate TEXT NOT NULL,
    Modifier TEXT NULL,
    ModifiedDate TEXT NULL,
    UNIQUE (LashTypeId, Name),
    FOREIGN KEY (LashTypeId) REFERENCES LashType(LashTypeId) ON DELETE NO ACTION,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
);

CREATE TABLE LashCurl (
    LashCurlId TEXT PRIMARY KEY,
    Name TEXT NOT NULL UNIQUE,
    SortOrder INTEGER NOT NULL,
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    Creator TEXT NOT NULL,
    CreateDate TEXT NOT NULL,
    Modifier TEXT NULL,
    ModifiedDate TEXT NULL,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
);

CREATE TABLE LashLength (
    LashLengthId TEXT PRIMARY KEY,
    LengthMm REAL NOT NULL UNIQUE CHECK (LengthMm > 0),
    SortOrder INTEGER NOT NULL,
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    Creator TEXT NOT NULL,
    CreateDate TEXT NOT NULL,
    Modifier TEXT NULL,
    ModifiedDate TEXT NULL,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
);

CREATE TABLE LashCountOption (
    LashCountOptionId TEXT PRIMARY KEY,
    Position TEXT NOT NULL CHECK (Position IN ('UPPER', 'LOWER')),
    Count INTEGER NOT NULL CHECK (Count > 0),
    SortOrder INTEGER NOT NULL,
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    Creator TEXT NOT NULL,
    CreateDate TEXT NOT NULL,
    Modifier TEXT NULL,
    ModifiedDate TEXT NULL,
    UNIQUE (Position, Count),
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
);

CREATE TABLE Customer (
    CustomerId TEXT PRIMARY KEY,
    Name TEXT NOT NULL,
    Birthday TEXT NOT NULL,
    Phone TEXT NOT NULL,
    IsPregnant INTEGER NOT NULL CHECK (IsPregnant IN (0, 1)),
    PregnancyWeeks INTEGER NULL CHECK (PregnancyWeeks IS NULL OR (PregnancyWeeks BETWEEN 1 AND 45)),
    HasHadExtensions INTEGER NOT NULL CHECK (HasHadExtensions IN (0, 1)),
    HasFalseLashHabit INTEGER NOT NULL CHECK (HasFalseLashHabit IN (0, 1)),
    EyeTypeSystemCodeId TEXT NOT NULL,
    EyeTypeOtherText TEXT NULL,
    HasMaskAllergy INTEGER NOT NULL CHECK (HasMaskAllergy IN (0, 1)),
    HasAgreedToConsent INTEGER NOT NULL CHECK (HasAgreedToConsent IN (0, 1)),
    SignatureFileKey TEXT NOT NULL,
    SignedDate TEXT NOT NULL,
    CreatedSource TEXT NOT NULL CHECK (CreatedSource IN ('CUSTOMER_FORM', 'BACKOFFICE')),
    IsDeleted INTEGER NOT NULL DEFAULT 0 CHECK (IsDeleted IN (0, 1)),
    Creator TEXT NULL,
    CreateDate TEXT NOT NULL,
    Modifier TEXT NULL,
    ModifiedDate TEXT NULL,
    FOREIGN KEY (EyeTypeSystemCodeId) REFERENCES SystemCode(SystemCodeId) ON DELETE NO ACTION,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
);

CREATE TABLE CustomerProfileCode (
    CustomerProfileCodeId TEXT PRIMARY KEY,
    CustomerId TEXT NOT NULL,
    SystemCodeId TEXT NOT NULL,
    DetailText TEXT NULL,
    Creator TEXT NULL,
    CreateDate TEXT NOT NULL,
    Modifier TEXT NULL,
    ModifiedDate TEXT NULL,
    UNIQUE (CustomerId, SystemCodeId),
    FOREIGN KEY (CustomerId) REFERENCES Customer(CustomerId) ON DELETE CASCADE,
    FOREIGN KEY (SystemCodeId) REFERENCES SystemCode(SystemCodeId) ON DELETE NO ACTION,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
);

CREATE TABLE LashRecord (
    LashRecordId TEXT PRIMARY KEY,
    CustomerId TEXT NOT NULL,
    ServiceDate TEXT NOT NULL,
    LashStyleId TEXT NOT NULL,
    LashTypeId TEXT NOT NULL,
    LashColorId TEXT NOT NULL,
    UpperLashCountOptionId TEXT NOT NULL,
    LowerLashCountOptionId TEXT NULL,
    Amount INTEGER NOT NULL CHECK (Amount >= 0),
    Note TEXT NULL,
    IsDeleted INTEGER NOT NULL DEFAULT 0 CHECK (IsDeleted IN (0, 1)),
    Creator TEXT NOT NULL,
    CreateDate TEXT NOT NULL,
    Modifier TEXT NULL,
    ModifiedDate TEXT NULL,
    FOREIGN KEY (CustomerId) REFERENCES Customer(CustomerId) ON DELETE NO ACTION,
    FOREIGN KEY (LashStyleId) REFERENCES LashStyle(LashStyleId) ON DELETE NO ACTION,
    FOREIGN KEY (LashTypeId) REFERENCES LashType(LashTypeId) ON DELETE NO ACTION,
    FOREIGN KEY (LashColorId) REFERENCES LashColor(LashColorId) ON DELETE NO ACTION,
    FOREIGN KEY (UpperLashCountOptionId) REFERENCES LashCountOption(LashCountOptionId) ON DELETE NO ACTION,
    FOREIGN KEY (LowerLashCountOptionId) REFERENCES LashCountOption(LashCountOptionId) ON DELETE NO ACTION,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
);

CREATE TABLE LashRecordDetail (
    LashRecordDetailId TEXT PRIMARY KEY,
    LashRecordId TEXT NOT NULL,
    EyeSide TEXT NOT NULL CHECK (EyeSide IN ('LEFT', 'RIGHT')),
    SegmentOrder INTEGER NOT NULL CHECK (SegmentOrder > 0),
    LashCurlId TEXT NOT NULL,
    LashLengthId TEXT NOT NULL,
    Creator TEXT NOT NULL,
    CreateDate TEXT NOT NULL,
    Modifier TEXT NULL,
    ModifiedDate TEXT NULL,
    UNIQUE (LashRecordId, EyeSide, SegmentOrder),
    FOREIGN KEY (LashRecordId) REFERENCES LashRecord(LashRecordId) ON DELETE CASCADE,
    FOREIGN KEY (LashCurlId) REFERENCES LashCurl(LashCurlId) ON DELETE NO ACTION,
    FOREIGN KEY (LashLengthId) REFERENCES LashLength(LashLengthId) ON DELETE NO ACTION,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
);

CREATE TABLE CustomerFormToken (
    CustomerFormTokenId TEXT PRIMARY KEY,
    TokenHash TEXT NOT NULL UNIQUE,
    ExpiresAt TEXT NOT NULL,
    UsedAt TEXT NULL,
    Creator TEXT NOT NULL,
    CreateDate TEXT NOT NULL,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION
);

-- 查詢與排序索引
CREATE INDEX IX_Customer_IsDeleted_Name
    ON Customer (IsDeleted, Name);

CREATE INDEX IX_Customer_IsDeleted_Phone
    ON Customer (IsDeleted, Phone);

CREATE INDEX IX_LashRecord_CustomerId_IsDeleted_ServiceDate
    ON LashRecord (CustomerId, IsDeleted, ServiceDate);

CREATE INDEX IX_SystemCode_CodeType_IsActive_SortOrder
    ON SystemCode (CodeType, IsActive, SortOrder);

CREATE INDEX IX_LashColor_LashTypeId_IsActive_SortOrder
    ON LashColor (LashTypeId, IsActive, SortOrder);

CREATE INDEX IX_LashCountOption_Position_IsActive_SortOrder
    ON LashCountOption (Position, IsActive, SortOrder);

CREATE INDEX IX_CustomerFormToken_ExpiresAt
    ON CustomerFormToken (ExpiresAt);
