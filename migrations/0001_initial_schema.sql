PRAGMA foreign_keys = ON;

-- =========================================================
-- Lash Record - Cloudflare D1 initial schema
--
-- 規則：
-- 1. 所有 Id 使用 TEXT UUID，由 Worker crypto.randomUUID() 產生。
-- 2. CreateDate / ModifiedDate / ServiceDate / ExpiresAt / UsedAt
--    皆由 Worker 以 Asia/Taipei 時區寫入 TEXT。
-- 3. 日期時間格式：YYYY-MM-DD HH:mm:ss。
-- 4. Boolean 使用 INTEGER 0 / 1。
-- 5. 金額使用 INTEGER，單位為新台幣元。
-- =========================================================

CREATE TABLE AppUser (
    UserId TEXT PRIMARY KEY,
    GoogleSubject TEXT UNIQUE,
    Email TEXT NOT NULL UNIQUE,
    DisplayName TEXT NOT NULL,
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    Creator TEXT,
    CreateDate TEXT NOT NULL,
    Modifier TEXT,
    ModifiedDate TEXT,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
) STRICT;

CREATE INDEX IX_AppUser_IsActive_Email
    ON AppUser(IsActive, Email);

CREATE TABLE SystemCode (
    SystemCodeId TEXT PRIMARY KEY,
    CodeType TEXT NOT NULL,
    Code TEXT NOT NULL,
    Name TEXT NOT NULL,
    SortOrder INTEGER NOT NULL CHECK (SortOrder >= 0),
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    Creator TEXT NOT NULL,
    CreateDate TEXT NOT NULL,
    Modifier TEXT,
    ModifiedDate TEXT,
    UNIQUE (CodeType, Code),
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
) STRICT;

CREATE INDEX IX_SystemCode_Type_Active_Sort
    ON SystemCode(CodeType, IsActive, SortOrder);

CREATE TABLE LashStyle (
    LashStyleId TEXT PRIMARY KEY,
    Name TEXT NOT NULL UNIQUE,
    SortOrder INTEGER NOT NULL CHECK (SortOrder >= 0),
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    Creator TEXT NOT NULL,
    CreateDate TEXT NOT NULL,
    Modifier TEXT,
    ModifiedDate TEXT,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
) STRICT;

CREATE INDEX IX_LashStyle_Active_Sort
    ON LashStyle(IsActive, SortOrder);

CREATE TABLE LashType (
    LashTypeId TEXT PRIMARY KEY,
    Position TEXT NOT NULL CHECK (Position IN ('UPPER', 'LOWER')),
    Name TEXT NOT NULL,
    SortOrder INTEGER NOT NULL CHECK (SortOrder >= 0),
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    Creator TEXT NOT NULL,
    CreateDate TEXT NOT NULL,
    Modifier TEXT,
    ModifiedDate TEXT,
    UNIQUE (Position, Name),
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
) STRICT;

CREATE INDEX IX_LashType_Position_Active_Sort
    ON LashType(Position, IsActive, SortOrder);

CREATE TABLE LashColor (
    LashColorId TEXT PRIMARY KEY,
    LashTypeId TEXT NOT NULL,
    Name TEXT NOT NULL,
    SortOrder INTEGER NOT NULL CHECK (SortOrder >= 0),
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    Creator TEXT NOT NULL,
    CreateDate TEXT NOT NULL,
    Modifier TEXT,
    ModifiedDate TEXT,
    UNIQUE (LashTypeId, Name),
    FOREIGN KEY (LashTypeId) REFERENCES LashType(LashTypeId) ON DELETE NO ACTION,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
) STRICT;

CREATE INDEX IX_LashColor_Type_Active_Sort
    ON LashColor(LashTypeId, IsActive, SortOrder);

CREATE TABLE LashCurl (
    LashCurlId TEXT PRIMARY KEY,
    Name TEXT NOT NULL UNIQUE,
    SortOrder INTEGER NOT NULL CHECK (SortOrder >= 0),
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    Creator TEXT NOT NULL,
    CreateDate TEXT NOT NULL,
    Modifier TEXT,
    ModifiedDate TEXT,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
) STRICT;

CREATE INDEX IX_LashCurl_Active_Sort
    ON LashCurl(IsActive, SortOrder);

CREATE TABLE LashLength (
    LashLengthId TEXT PRIMARY KEY,
    LengthMm REAL NOT NULL UNIQUE CHECK (LengthMm > 0),
    SortOrder INTEGER NOT NULL CHECK (SortOrder >= 0),
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    Creator TEXT NOT NULL,
    CreateDate TEXT NOT NULL,
    Modifier TEXT,
    ModifiedDate TEXT,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
) STRICT;

CREATE INDEX IX_LashLength_Active_Sort
    ON LashLength(IsActive, SortOrder);

CREATE TABLE LashCountOption (
    LashCountOptionId TEXT PRIMARY KEY,
    Position TEXT NOT NULL CHECK (Position IN ('UPPER', 'LOWER')),
    Count INTEGER NOT NULL CHECK (Count > 0),
    Price INTEGER NOT NULL CHECK (Price >= 0),
    SortOrder INTEGER NOT NULL CHECK (SortOrder >= 0),
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    Creator TEXT NOT NULL,
    CreateDate TEXT NOT NULL,
    Modifier TEXT,
    ModifiedDate TEXT,
    UNIQUE (Position, Count),
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
) STRICT;

CREATE INDEX IX_LashCountOption_Position_Active_Sort
    ON LashCountOption(Position, IsActive, SortOrder);

CREATE TABLE Customer (
    CustomerId TEXT PRIMARY KEY,
    Name TEXT NOT NULL,
    Birthday TEXT NOT NULL,
    Phone TEXT NOT NULL,
    IsPregnant INTEGER NOT NULL CHECK (IsPregnant IN (0, 1)),
    PregnancyWeeks INTEGER CHECK (
        PregnancyWeeks IS NULL OR PregnancyWeeks BETWEEN 1 AND 45
    ),
    HasHadExtensions INTEGER NOT NULL CHECK (HasHadExtensions IN (0, 1)),
    HasFalseLashHabit INTEGER NOT NULL CHECK (HasFalseLashHabit IN (0, 1)),
    EyeTypeSystemCodeId TEXT NOT NULL,
    EyeTypeOtherText TEXT,
    HasMaskAllergy INTEGER NOT NULL CHECK (HasMaskAllergy IN (0, 1)),
    HasAgreedToConsent INTEGER NOT NULL CHECK (HasAgreedToConsent IN (0, 1)),
    SignatureFileKey TEXT NOT NULL,
    SignedDate TEXT NOT NULL,
    CreatedSource TEXT NOT NULL CHECK (
        CreatedSource IN ('CUSTOMER_FORM', 'BACKOFFICE')
    ),
    IsDeleted INTEGER NOT NULL DEFAULT 0 CHECK (IsDeleted IN (0, 1)),
    Creator TEXT,
    CreateDate TEXT NOT NULL,
    Modifier TEXT,
    ModifiedDate TEXT,
    CHECK (
        (IsPregnant = 0 AND PregnancyWeeks IS NULL)
        OR
        (IsPregnant = 1 AND PregnancyWeeks IS NOT NULL)
    ),
    FOREIGN KEY (EyeTypeSystemCodeId) REFERENCES SystemCode(SystemCodeId) ON DELETE NO ACTION,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
) STRICT;

CREATE INDEX IX_Customer_Deleted_Name
    ON Customer(IsDeleted, Name);

CREATE INDEX IX_Customer_Deleted_Phone
    ON Customer(IsDeleted, Phone);

CREATE INDEX IX_Customer_EyeType
    ON Customer(EyeTypeSystemCodeId);

CREATE TABLE CustomerProfileCode (
    CustomerProfileCodeId TEXT PRIMARY KEY,
    CustomerId TEXT NOT NULL,
    SystemCodeId TEXT NOT NULL,
    DetailText TEXT,
    Creator TEXT,
    CreateDate TEXT NOT NULL,
    Modifier TEXT,
    ModifiedDate TEXT,
    UNIQUE (CustomerId, SystemCodeId),
    FOREIGN KEY (CustomerId) REFERENCES Customer(CustomerId) ON DELETE CASCADE,
    FOREIGN KEY (SystemCodeId) REFERENCES SystemCode(SystemCodeId) ON DELETE NO ACTION,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
) STRICT;

CREATE INDEX IX_CustomerProfileCode_SystemCode
    ON CustomerProfileCode(SystemCodeId);

CREATE TABLE LashRecord (
    LashRecordId TEXT PRIMARY KEY,
    CustomerId TEXT NOT NULL,
    ServiceDate TEXT NOT NULL,
    LashStyleId TEXT NOT NULL,
    UpperLashTypeId TEXT NOT NULL,
    UpperLashColorId TEXT NOT NULL,
    UpperLashCountOptionId TEXT NOT NULL,
    Amount INTEGER NOT NULL CHECK (Amount >= 0),
    Note TEXT,
    IsDeleted INTEGER NOT NULL DEFAULT 0 CHECK (IsDeleted IN (0, 1)),
    Creator TEXT NOT NULL,
    CreateDate TEXT NOT NULL,
    Modifier TEXT,
    ModifiedDate TEXT,
    FOREIGN KEY (CustomerId) REFERENCES Customer(CustomerId) ON DELETE NO ACTION,
    FOREIGN KEY (LashStyleId) REFERENCES LashStyle(LashStyleId) ON DELETE NO ACTION,
    FOREIGN KEY (UpperLashTypeId) REFERENCES LashType(LashTypeId) ON DELETE NO ACTION,
    FOREIGN KEY (UpperLashColorId) REFERENCES LashColor(LashColorId) ON DELETE NO ACTION,
    FOREIGN KEY (UpperLashCountOptionId) REFERENCES LashCountOption(LashCountOptionId) ON DELETE NO ACTION,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (Modifier) REFERENCES AppUser(UserId) ON DELETE NO ACTION
) STRICT;

CREATE INDEX IX_LashRecord_Customer_Deleted_ServiceDate
    ON LashRecord(CustomerId, IsDeleted, ServiceDate);

CREATE INDEX IX_LashRecord_Style
    ON LashRecord(LashStyleId);

CREATE INDEX IX_LashRecord_UpperType
    ON LashRecord(UpperLashTypeId);

CREATE INDEX IX_LashRecord_UpperColor
    ON LashRecord(UpperLashColorId);

CREATE INDEX IX_LashRecord_UpperCount
    ON LashRecord(UpperLashCountOptionId);

CREATE TABLE UpperLashRecordDetail (
    UpperLashRecordDetailId TEXT PRIMARY KEY,
    LashRecordId TEXT NOT NULL,
    EyeSide TEXT NOT NULL CHECK (EyeSide IN ('LEFT', 'RIGHT')),
    SegmentOrder INTEGER NOT NULL CHECK (SegmentOrder > 0),
    LashCurlId TEXT NOT NULL,
    LashLengthId TEXT NOT NULL,
    Creator TEXT NOT NULL,
    CreateDate TEXT NOT NULL,
    UNIQUE (LashRecordId, EyeSide, SegmentOrder),
    FOREIGN KEY (LashRecordId) REFERENCES LashRecord(LashRecordId) ON DELETE CASCADE,
    FOREIGN KEY (LashCurlId) REFERENCES LashCurl(LashCurlId) ON DELETE NO ACTION,
    FOREIGN KEY (LashLengthId) REFERENCES LashLength(LashLengthId) ON DELETE NO ACTION,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION
) STRICT;

CREATE INDEX IX_UpperLashRecordDetail_Record_Eye
    ON UpperLashRecordDetail(LashRecordId, EyeSide, SegmentOrder);

CREATE INDEX IX_UpperLashRecordDetail_Curl
    ON UpperLashRecordDetail(LashCurlId);

CREATE INDEX IX_UpperLashRecordDetail_Length
    ON UpperLashRecordDetail(LashLengthId);

CREATE TABLE LowerLashRecordDetail (
    LowerLashRecordDetailId TEXT PRIMARY KEY,
    LashRecordId TEXT NOT NULL UNIQUE,
    LashTypeId TEXT NOT NULL,
    LashColorId TEXT NOT NULL,
    LashLengthId TEXT NOT NULL,
    LashCountOptionId TEXT NOT NULL,
    Creator TEXT NOT NULL,
    CreateDate TEXT NOT NULL,
    FOREIGN KEY (LashRecordId) REFERENCES LashRecord(LashRecordId) ON DELETE CASCADE,
    FOREIGN KEY (LashTypeId) REFERENCES LashType(LashTypeId) ON DELETE NO ACTION,
    FOREIGN KEY (LashColorId) REFERENCES LashColor(LashColorId) ON DELETE NO ACTION,
    FOREIGN KEY (LashLengthId) REFERENCES LashLength(LashLengthId) ON DELETE NO ACTION,
    FOREIGN KEY (LashCountOptionId) REFERENCES LashCountOption(LashCountOptionId) ON DELETE NO ACTION,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION
) STRICT;

CREATE INDEX IX_LowerLashRecordDetail_Type
    ON LowerLashRecordDetail(LashTypeId);

CREATE INDEX IX_LowerLashRecordDetail_Color
    ON LowerLashRecordDetail(LashColorId);

CREATE INDEX IX_LowerLashRecordDetail_Length
    ON LowerLashRecordDetail(LashLengthId);

CREATE INDEX IX_LowerLashRecordDetail_Count
    ON LowerLashRecordDetail(LashCountOptionId);

CREATE TABLE CustomerFormToken (
    CustomerFormTokenId TEXT PRIMARY KEY,
    TokenHash TEXT NOT NULL UNIQUE,
    ExpiresAt TEXT NOT NULL,
    UsedAt TEXT,
    Creator TEXT NOT NULL,
    CreateDate TEXT NOT NULL,
    FOREIGN KEY (Creator) REFERENCES AppUser(UserId) ON DELETE NO ACTION
) STRICT;

CREATE INDEX IX_CustomerFormToken_Expires_Used
    ON CustomerFormToken(ExpiresAt, UsedAt);

-- 跨資料表商業規則由 Worker 驗證：
-- 1. UpperLashTypeId 的 Position 必須為 UPPER。
-- 2. UpperLashColorId 必須隸屬 UpperLashTypeId。
-- 3. UpperLashCountOptionId 的 Position 必須為 UPPER。
-- 4. LowerLashRecordDetail.LashTypeId 的 Position 必須為 LOWER。
-- 5. 下睫毛 LashColorId 必須隸屬其 LashTypeId。
-- 6. 下睫毛 LashCountOptionId 的 Position 必須為 LOWER。
-- 7. CUSTOMER_FORM 建立 Customer 時 Creator 應為 NULL；
--    BACKOFFICE 建立時 Creator 應為有效 AppUser.UserId。
-- 8. EyeType 選 OTHER 時 EyeTypeOtherText 必填，否則應清空。
