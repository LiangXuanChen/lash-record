PRAGMA foreign_keys = ON;

-- =========================================================
-- Lash Record - Cloudflare D1 master data seed
--
-- 重要：
-- 1. 執行本 migration 前，AppUser 必須至少已有 1 筆 IsActive = 1 的正式使用者。
-- 2. 本檔不建立假 SYSTEM 帳號；所有主檔 Creator 取第一筆有效 AppUser。
-- 3. Seed 建立時間為 migration 執行當下的 Asia/Taipei 時間。
-- 4. 本檔只建立 V1 預設主檔，不建立 Customer / LashRecord 等交易資料。
-- =========================================================

-- 若 AppUser 尚未建立，第一筆 INSERT 會因 Creator NOT NULL 而失敗，避免產生無建立者的主檔。

-- ---------------------------------------------------------
-- SystemCode：眼型
-- ---------------------------------------------------------
INSERT INTO SystemCode (SystemCodeId, CodeType, Code, Name, SortOrder, IsActive, Creator, CreateDate)
VALUES
('44912610-0662-4f55-91e5-c2ef43876832', 'EYE_TYPE', 'SINGLE',       '單眼皮', 1, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('f99ed815-e5ed-4806-96db-29efde4e188f', 'EYE_TYPE', 'DOUBLE',       '雙眼皮', 2, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('d15b7eef-e2f4-4bf8-aa27-c290d3dddef0', 'EYE_TYPE', 'INNER_DOUBLE', '內雙',   3, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('37c64097-2109-47cc-80fd-cc19522200f5', 'EYE_TYPE', 'OTHER',        '其他',   4, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours'));

-- ---------------------------------------------------------
-- SystemCode：如何得知本店
-- ---------------------------------------------------------
INSERT INTO SystemCode (SystemCodeId, CodeType, Code, Name, SortOrder, IsActive, Creator, CreateDate)
VALUES
('cf9560be-8d36-4e48-bd79-16895f00c489', 'SOURCE', 'FB',         'FB',       1, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('c5603ea9-678d-4702-a3d4-8d459b6652bb', 'SOURCE', 'IG',         'IG',       2, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('7664e9a2-d694-4476-a86c-98be1b843549', 'SOURCE', 'REFERRAL',   '親友介紹', 3, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('49a6b5ff-899e-4271-b37a-6e6d9145e7f6', 'SOURCE', 'WEB_SEARCH', '網路搜尋', 4, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('2f59bd2b-6928-4031-ba31-74b60bb147ca', 'SOURCE', 'OTHER',      '其他',     5, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours'));

-- ---------------------------------------------------------
-- SystemCode：睫毛狀況
-- ---------------------------------------------------------
INSERT INTO SystemCode (SystemCodeId, CodeType, Code, Name, SortOrder, IsActive, Creator, CreateDate)
VALUES
('f3412eeb-f959-47fe-941d-dede52e40986', 'LASH_CONDITION', 'SPARSE',   '稀疏', 1, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('fed1ba39-fa1a-4066-a277-881df8f02e1a', 'LASH_CONDITION', 'GAPS',     '空洞', 2, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('7828504f-8e69-4ed9-bd2d-c03dcb75e41c', 'LASH_CONDITION', 'DENSE',    '濃密', 3, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('bb9f6f33-0a5b-4a8e-9b09-7ae4cca4d1cd', 'LASH_CONDITION', 'HEALTHY',  '健康', 4, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('5df72e1b-512a-4761-b734-b5a5ee00c4d0', 'LASH_CONDITION', 'DAMAGED',  '受損', 5, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('c81fb9ba-8d1d-46b7-ac8a-8dad1f5c6124', 'LASH_CONDITION', 'FINE',     '細毛', 6, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('cb2f7680-ca53-409f-acfe-97d65497618d', 'LASH_CONDITION', 'SHORT',    '短毛', 7, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours'));

-- ---------------------------------------------------------
-- SystemCode：毛流
-- ---------------------------------------------------------
INSERT INTO SystemCode (SystemCodeId, CodeType, Code, Name, SortOrder, IsActive, Creator, CreateDate)
VALUES
('8cd094fe-a8f7-44db-8182-c5a477c4fd02', 'LASH_FLOW', 'STRAIGHT',     '直',     1, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('a3826486-a8ce-4d65-8f75-69b112b9a30a', 'LASH_FLOW', 'NEAT',         '整齊',   2, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('04a42abb-04dc-41a0-afcc-df8321c7ed0a', 'LASH_FLOW', 'MESSY',        '亂',     3, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('32ad5e9e-e49a-45df-b80f-c2e1356ba5be', 'LASH_FLOW', 'CROOKED',      '歪',     4, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('df4f07d3-2516-490f-8a3e-fc8aa4f7777a', 'LASH_FLOW', 'NATURAL_CURL', '自然捲', 5, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours'));

-- ---------------------------------------------------------
-- SystemCode：左右眼翹的位置
-- ---------------------------------------------------------
INSERT INTO SystemCode (SystemCodeId, CodeType, Code, Name, SortOrder, IsActive, Creator, CreateDate)
VALUES
('85b12c4e-1529-451b-b377-225e803158e0', 'RIGHT_EYE_LIFT', 'INNER', '眼頭', 1, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('ed51d325-f312-43e2-b3ac-a37d383b3645', 'RIGHT_EYE_LIFT', 'OUTER', '眼尾', 2, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('596b704c-7c63-405e-8196-fc3ac07d8614', 'LEFT_EYE_LIFT',  'INNER', '眼頭', 1, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('276d37b2-5aad-424e-91aa-caf57a5a3a9d', 'LEFT_EYE_LIFT',  'OUTER', '眼尾', 2, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours'));

-- ---------------------------------------------------------
-- 接睫樣式
-- ---------------------------------------------------------
INSERT INTO LashStyle (LashStyleId, Name, SortOrder, IsActive, Creator, CreateDate)
VALUES
('dbeeb53b-15ca-45c9-a11b-9bdbd8f5b95d', '性感型', 1, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('888b87e3-4ad0-4027-8aea-4d6aed15a27e', '無辜型', 2, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('40b9c34e-b580-4304-99dd-97610be969fb', '華麗型', 3, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('eeaf31b0-df05-41f6-ba31-20b619301563', '可愛型', 4, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours'));

-- ---------------------------------------------------------
-- 上／下睫毛種類
-- ---------------------------------------------------------
INSERT INTO LashType (LashTypeId, Position, Name, SortOrder, IsActive, Creator, CreateDate)
VALUES
('590cfd6c-aa8f-48f4-8d7e-1e31612cb029', 'UPPER', '松風', 1, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('ce152eda-8adf-4f4e-a1fb-6a03e18ab9f5', 'UPPER', '赫本', 2, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('0d8910fd-2a67-471f-acec-b11918060608', 'UPPER', '芭比', 3, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('c516633a-6a9f-448e-aafb-8e1d915bf8e4', 'LOWER', 'M',    1, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours'));

-- ---------------------------------------------------------
-- 睫毛顏色
-- ---------------------------------------------------------
INSERT INTO LashColor (LashColorId, LashTypeId, Name, SortOrder, IsActive, Creator, CreateDate)
VALUES
('4caf074b-c4b6-4ffa-a576-50fa13fb9f2f', '590cfd6c-aa8f-48f4-8d7e-1e31612cb029', 'matte black',  1, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('45d0d2b5-3f08-4802-81f0-14a35ed534ce', '590cfd6c-aa8f-48f4-8d7e-1e31612cb029', 'herbal brown', 2, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('d06505f8-d7cf-46d4-bdfd-b7688531dbbc', '590cfd6c-aa8f-48f4-8d7e-1e31612cb029', 'ice mauve',    3, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('b9fe223c-1163-4dac-96bd-59b0744425f4', '590cfd6c-aa8f-48f4-8d7e-1e31612cb029', 'sodalite',     4, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('9d82737d-c9dc-43fe-b353-5e59e6716cb0', '590cfd6c-aa8f-48f4-8d7e-1e31612cb029', 'mode khaki',   5, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('43953b66-dcfa-47f4-86dd-92f07265e65a', '590cfd6c-aa8f-48f4-8d7e-1e31612cb029', 'sand beige',   6, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('3beecdc6-2aca-4066-86e9-db4fd297706b', '590cfd6c-aa8f-48f4-8d7e-1e31612cb029', 'ecru',         7, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('84c3816b-b173-4d29-9291-3b413ee3e7cd', '590cfd6c-aa8f-48f4-8d7e-1e31612cb029', 'ice white',    8, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('fdafd779-5483-4aab-b158-0d04d8991e2a', 'ce152eda-8adf-4f4e-a1fb-6a03e18ab9f5', 'black',        1, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('8112ac69-5e4d-499b-bb10-007b967318a0', 'ce152eda-8adf-4f4e-a1fb-6a03e18ab9f5', 'dark mocha',   2, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('4d11ad4c-ffd9-4129-b566-315587ed1954', 'ce152eda-8adf-4f4e-a1fb-6a03e18ab9f5', 'leaf',         3, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('c27c6bf1-d0e7-4851-bf77-1615ed07f3d2', 'ce152eda-8adf-4f4e-a1fb-6a03e18ab9f5', 'ash blue',     4, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('21dd4845-6a8c-4086-a0d8-5398bb4e3994', '0d8910fd-2a67-471f-acec-b11918060608', 'black',        1, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('9d4c99b5-7120-45cd-b633-54d48737a076', '0d8910fd-2a67-471f-acec-b11918060608', 'dark mocha',   2, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('92fb08b7-ae1f-47fd-beaf-fdbb19d5e849', 'c516633a-6a9f-448e-aafb-8e1d915bf8e4', '黑色',         1, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('18c90214-206d-424b-a81a-9c70b0a60107', 'c516633a-6a9f-448e-aafb-8e1d915bf8e4', '棕色',         2, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours'));

-- ---------------------------------------------------------
-- 上睫毛捲度
-- ---------------------------------------------------------
INSERT INTO LashCurl (LashCurlId, Name, SortOrder, IsActive, Creator, CreateDate)
VALUES
('f68e22fd-f8ce-4968-ac53-55e55c627976', 'J',  1, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('1deefe05-cb8a-48cf-8939-47bd8824811f', 'JC', 2, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('e21f8433-339d-4219-b48f-22562fcfcf91', 'C',  3, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('f033afb0-f2a6-4854-a661-25d248b32dc5', 'SC', 4, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('b791b167-dccd-410f-a542-53daefdfd3e3', 'CC', 5, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('5613d46d-de91-4fd0-bd7f-92e9eb8b6d5b', 'L',  6, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('ca4718e6-5258-4daf-b246-24acba98d4f1', 'LD', 7, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours'));

-- ---------------------------------------------------------
-- 上／下睫毛長度
-- 上睫毛沿用目前設定頁順序；下睫毛為目前紀錄表 4~7 mm。
-- ---------------------------------------------------------
INSERT INTO LashLength (LashLengthId, Position, LengthMm, SortOrder, IsActive, Creator, CreateDate)
VALUES
('169b1a5f-3e80-4afc-9469-d7c9d12aa505', 'UPPER', 7,  1, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('5797ad0a-8d26-452f-9964-3cec17590e70', 'UPPER', 8,  2, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('e3172e59-bb90-4271-a22d-5955015d1c0e', 'UPPER', 9,  3, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('72501f88-2bff-42f5-a550-e781bd5e222a', 'UPPER', 11, 4, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('735bd5c2-4174-46b0-a8e1-ad4dbd9e95f2', 'UPPER', 10, 5, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('c49f2016-59ea-4216-aeb2-b364b9630590', 'UPPER', 12, 6, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('72100230-ac7e-4c29-9087-585407419654', 'UPPER', 13, 7, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('26e1105d-8aa2-49fe-807f-8b4f99dd99ca', 'LOWER', 4, 1, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('74d52293-96c2-4fdc-a3ca-ebf71fe4858c', 'LOWER', 5, 2, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('f201eb90-579b-4cfe-a39b-9d5ce10acc76', 'LOWER', 6, 3, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('fbefc20e-7cde-446b-9c18-0f15f1a78177', 'LOWER', 7, 4, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours'));

-- ---------------------------------------------------------
-- 上／下睫毛本數與價格
-- 價格依目前確認的正式價目建立。
-- ---------------------------------------------------------
INSERT INTO LashCountOption (LashCountOptionId, Position, Count, Price, SortOrder, IsActive, Creator, CreateDate)
VALUES
('acf697ed-189a-40cf-bdb0-616891b1cce5', 'UPPER', 80,  1000, 1, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('b9f81e31-47d4-4828-86fe-b9b8125c5252', 'UPPER', 100, 1150, 2, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('92342950-88dc-4cff-b882-0df85070c799', 'UPPER', 120, 1300, 3, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('c6d3d80c-c497-467c-8ebe-a96b8d4653de', 'UPPER', 140, 1450, 4, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('1e736aeb-e4c6-40e2-a153-1351c1a77e84', 'LOWER', 20,   200, 1, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours')),
('4effa2a5-0b67-4fa4-9ed0-279710035400', 'LOWER', 30,   300, 2, 1, (SELECT UserId FROM AppUser WHERE IsActive = 1 ORDER BY CreateDate, UserId LIMIT 1), strftime('%Y-%m-%d %H:%M:%S','now','+8 hours'));
