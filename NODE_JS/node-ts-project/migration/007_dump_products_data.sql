begin;

-- Staging table: one row per dummy product plus its listing
create temp table seed_rows (
    id          uuid,
    owner_id    uuid,
    name        varchar(200),
    description text,
    category    varchar(100),
    brand       varchar(100),
    price       numeric(10, 2),
    stock       integer,
    condition   varchar(20)
) on commit drop;

insert into seed_rows (id, owner_id, name, description, category, brand, price, stock, condition) values
    -- admin: electronics and office
    ('d1000000-0000-4000-8000-000000000001', '5b6c129b-3706-4958-bd7e-80bdfb35973d', 'USB-C Charging Hub', '7-in-1 USB-C hub with HDMI, SD card reader and 100W power delivery', 'Electronics', 'PortMax', 39.99, 25, 'new'),
    ('d1000000-0000-4000-8000-000000000002', '5b6c129b-3706-4958-bd7e-80bdfb35973d', 'Laptop Stand', 'Adjustable aluminum laptop stand for desks', 'Electronics', 'ErgoLift', 34.50, 14, 'new'),
    ('d1000000-0000-4000-8000-000000000003', '5b6c129b-3706-4958-bd7e-80bdfb35973d', '4K Webcam', 'Ultra HD webcam with autofocus and built-in microphone', 'Electronics', 'ClearView', 79.00, 9, 'new'),
    ('d1000000-0000-4000-8000-000000000004', '5b6c129b-3706-4958-bd7e-80bdfb35973d', 'Portable SSD 1TB', 'Pocket sized solid state drive with USB 3.2 connection', 'Electronics', 'DataVault', 109.99, 6, 'new'),
    ('d1000000-0000-4000-8000-000000000005', '5b6c129b-3706-4958-bd7e-80bdfb35973d', 'Wireless Charger Pad', '15W fast wireless charging pad with LED indicator', 'Electronics', 'ChargeWell', 22.99, 0, 'new'),
    ('d1000000-0000-4000-8000-000000000006', '5b6c129b-3706-4958-bd7e-80bdfb35973d', 'Gaming Monitor 27 inch', '27 inch QHD monitor with 144Hz refresh rate', 'Electronics', 'ViewMax', 249.00, 4, 'refurbished'),
    ('d1000000-0000-4000-8000-000000000007', '5b6c129b-3706-4958-bd7e-80bdfb35973d', 'Bluetooth Speaker', 'Waterproof portable speaker with 12 hour battery life', 'Electronics', 'BoomTone', 45.00, 30, 'new'),
    ('d1000000-0000-4000-8000-000000000008', '5b6c129b-3706-4958-bd7e-80bdfb35973d', 'Smart Fitness Watch', 'Fitness tracker with heart rate monitor and sleep tracking', 'Electronics', 'FitPulse', 59.99, 18, 'new'),
    ('d1000000-0000-4000-8000-000000000009', '5b6c129b-3706-4958-bd7e-80bdfb35973d', 'Ethernet Cable 10m', 'Cat6 network cable with gold plated connectors', 'Electronics', 'NetLink', 8.75, 120, 'new'),
    ('d1000000-0000-4000-8000-000000000010', '5b6c129b-3706-4958-bd7e-80bdfb35973d', 'USB Desk Lamp', 'LED desk lamp with five brightness levels and USB charging port', 'Office Supplies', 'LumiDesk', 27.50, 12, 'used'),
    -- admin2: home and kitchen
    ('d1000000-0000-4000-8000-000000000011', '774fa359-fd2d-44db-97b9-0dae3d6323da', 'Non-Stick Frying Pan', '28 cm non-stick frying pan with heat resistant handle', 'Home & Kitchen', 'ChefRight', 24.99, 40, 'new'),
    ('d1000000-0000-4000-8000-000000000012', '774fa359-fd2d-44db-97b9-0dae3d6323da', 'Electric Kettle', '1.7 litre kettle with auto shut-off and boil-dry protection', 'Home & Kitchen', 'BoilQuick', 32.00, 22, 'new'),
    ('d1000000-0000-4000-8000-000000000013', '774fa359-fd2d-44db-97b9-0dae3d6323da', 'Cotton Bath Towel Set', 'Set of four quick-dry cotton bath towels', 'Home & Living', 'SoftNest', 28.50, 35, 'new'),
    ('d1000000-0000-4000-8000-000000000014', '774fa359-fd2d-44db-97b9-0dae3d6323da', 'Ceramic Coffee Mug Set', 'Set of four 350 ml ceramic mugs with matte finish', 'Home & Kitchen', 'Brewhouse', 18.75, 60, 'new'),
    ('d1000000-0000-4000-8000-000000000015', '774fa359-fd2d-44db-97b9-0dae3d6323da', 'Knife Set with Block', 'Eight piece stainless steel knife set with wooden block', 'Home & Kitchen', 'EdgeMaster', 64.99, 8, 'new'),
    ('d1000000-0000-4000-8000-000000000016', '774fa359-fd2d-44db-97b9-0dae3d6323da', 'Glass Food Storage Containers', 'Set of ten airtight glass containers with lids', 'Home & Kitchen', 'KeepFresh', 36.00, 15, 'new'),
    ('d1000000-0000-4000-8000-000000000017', '774fa359-fd2d-44db-97b9-0dae3d6323da', 'Bamboo Cutting Board', 'Large reversible bamboo cutting board with juice groove', 'Home & Kitchen', 'GreenBlock', 21.00, 27, 'new'),
    ('d1000000-0000-4000-8000-000000000018', '774fa359-fd2d-44db-97b9-0dae3d6323da', 'Memory Foam Pillow', 'Contour memory foam pillow for neck support', 'Home & Living', 'RestWell', 39.90, 19, 'new'),
    ('d1000000-0000-4000-8000-000000000019', '774fa359-fd2d-44db-97b9-0dae3d6323da', 'Scented Candle Trio', 'Set of three soy wax candles in lavender, vanilla and cedar', 'Home & Living', 'Lumen & Co', 22.00, 0, 'new'),
    ('d1000000-0000-4000-8000-000000000020', '774fa359-fd2d-44db-97b9-0dae3d6323da', 'Stainless Steel Pressure Cooker', '6 litre pressure cooker with safety valve', 'Home & Kitchen', 'PressPro', 89.00, 5, 'refurbished'),
    -- newuser: clothing and footwear
    ('d1000000-0000-4000-8000-000000000021', '5375aa4c-980d-4ae1-9b0e-500a1a453330', 'Denim Jacket', 'Classic blue denim jacket with button front', 'Clothing', 'UrbanThread', 49.99, 22, 'new'),
    ('d1000000-0000-4000-8000-000000000022', '5375aa4c-980d-4ae1-9b0e-500a1a453330', 'Running Shoes', 'Lightweight road running shoes with cushioned sole', 'Footwear', 'StrideLab', 74.95, 17, 'new'),
    ('d1000000-0000-4000-8000-000000000023', '5375aa4c-980d-4ae1-9b0e-500a1a453330', 'Wool Blend Sweater', 'Crew neck sweater in a soft wool blend', 'Clothing', 'NorthKnit', 42.00, 11, 'new'),
    ('d1000000-0000-4000-8000-000000000024', '5375aa4c-980d-4ae1-9b0e-500a1a453330', 'Canvas Backpack', 'Water resistant canvas backpack with laptop sleeve', 'Accessories', 'TrailCarry', 35.50, 26, 'new'),
    ('d1000000-0000-4000-8000-000000000025', '5375aa4c-980d-4ae1-9b0e-500a1a453330', 'Leather Belt', 'Genuine leather belt with brushed metal buckle', 'Accessories', 'Harbor & Co', 19.99, 40, 'new'),
    ('d1000000-0000-4000-8000-000000000026', '5375aa4c-980d-4ae1-9b0e-500a1a453330', 'Cotton Hoodie', 'Pullover hoodie with kangaroo pocket', 'Clothing', 'CozyStyle', 29.00, 3, 'used'),
    ('d1000000-0000-4000-8000-000000000027', '5375aa4c-980d-4ae1-9b0e-500a1a453330', 'Chino Trousers', 'Slim fit cotton chino trousers', 'Clothing', 'UrbanThread', 38.00, 14, 'new'),
    ('d1000000-0000-4000-8000-000000000028', '5375aa4c-980d-4ae1-9b0e-500a1a453330', 'Sports Cap', 'Adjustable cotton baseball cap', 'Accessories', 'CapStar', 12.50, 55, 'new'),
    ('d1000000-0000-4000-8000-000000000029', '5375aa4c-980d-4ae1-9b0e-500a1a453330', 'Touchscreen Winter Gloves', 'Knit gloves with touchscreen fingertips', 'Accessories', 'WarmGrip', 14.99, 0, 'new'),
    ('d1000000-0000-4000-8000-000000000030', '5375aa4c-980d-4ae1-9b0e-500a1a453330', 'Floral Summer Dress', 'Floral print midi dress with adjustable straps', 'Clothing', 'BloomWear', 45.00, 9, 'used'),
    -- redistest: sports and outdoors
    ('d1000000-0000-4000-8000-000000000031', 'd47bf271-e4f5-4816-a183-e3164f6046b8', 'Yoga Mat', 'Non-slip 6 mm yoga mat with carry strap', 'Sports & Outdoors', 'ZenFlex', 26.99, 30, 'new'),
    ('d1000000-0000-4000-8000-000000000032', 'd47bf271-e4f5-4816-a183-e3164f6046b8', 'Adjustable Dumbbell Pair', 'Pair of adjustable dumbbells from 2 to 20 kg', 'Sports & Outdoors', 'IronCore', 129.00, 6, 'new'),
    ('d1000000-0000-4000-8000-000000000033', 'd47bf271-e4f5-4816-a183-e3164f6046b8', 'Two Person Camping Tent', 'Lightweight dome tent for two people with rain fly', 'Sports & Outdoors', 'PeakCamp', 89.99, 4, 'used'),
    ('d1000000-0000-4000-8000-000000000034', 'd47bf271-e4f5-4816-a183-e3164f6046b8', 'Insulated Hiking Flask', '500 ml vacuum insulated flask for hiking', 'Sports & Outdoors', 'TrailSip', 17.50, 48, 'new'),
    ('d1000000-0000-4000-8000-000000000035', 'd47bf271-e4f5-4816-a183-e3164f6046b8', 'Cycling Helmet', 'Ventilated road cycling helmet with adjustable fit', 'Sports & Outdoors', 'RideSafe', 54.00, 10, 'new'),
    ('d1000000-0000-4000-8000-000000000036', 'd47bf271-e4f5-4816-a183-e3164f6046b8', 'Speed Skipping Rope', 'Skipping rope with ball bearing handles', 'Sports & Outdoors', 'IronCore', 9.99, 70, 'new'),
    ('d1000000-0000-4000-8000-000000000037', 'd47bf271-e4f5-4816-a183-e3164f6046b8', 'Resistance Bands Set', 'Set of five latex resistance bands', 'Sports & Outdoors', 'FlexBand', 16.00, 0, 'new'),
    ('d1000000-0000-4000-8000-000000000038', 'd47bf271-e4f5-4816-a183-e3164f6046b8', 'Football Size 5', 'Match standard football with hand stitched panels', 'Sports & Outdoors', 'KickOff', 24.00, 21, 'new'),
    ('d1000000-0000-4000-8000-000000000039', 'd47bf271-e4f5-4816-a183-e3164f6046b8', 'Trekking Poles', 'Pair of collapsible carbon trekking poles', 'Sports & Outdoors', 'PeakCamp', 42.50, 7, 'refurbished'),
    ('d1000000-0000-4000-8000-000000000040', 'd47bf271-e4f5-4816-a183-e3164f6046b8', 'Swimming Goggles', 'Anti fog swimming goggles with UV protection', 'Sports & Outdoors', 'AquaEdge', 11.25, 33, 'new'),
    -- newuser1: stationery and books
    ('d1000000-0000-4000-8000-000000000041', '8be5f0a6-bc3c-411f-9c79-61e3e329d968', 'Dotted Notebook A5', 'A5 dotted notebook with 200 numbered pages', 'Stationery', 'PaperLine', 6.50, 90, 'new'),
    ('d1000000-0000-4000-8000-000000000042', '8be5f0a6-bc3c-411f-9c79-61e3e329d968', 'Fountain Pen', 'Medium nib fountain pen in matte black', 'Stationery', 'InkCraft', 28.00, 14, 'new'),
    ('d1000000-0000-4000-8000-000000000043', '8be5f0a6-bc3c-411f-9c79-61e3e329d968', 'Hardcover Novel Bundle', 'Set of three bestselling hardcover novels', 'Books', 'ReadMore', 39.90, 8, 'used'),
    ('d1000000-0000-4000-8000-000000000044', '8be5f0a6-bc3c-411f-9c79-61e3e329d968', 'Weekly Desk Planner', 'Week to view desk planner with monthly overview', 'Stationery', 'PaperLine', 12.99, 0, 'new'),
    ('d1000000-0000-4000-8000-000000000045', '8be5f0a6-bc3c-411f-9c79-61e3e329d968', 'Mechanical Pencil Set', 'Set of three 0.5 mm mechanical pencils', 'Stationery', 'InkCraft', 9.49, 60, 'new'),
    ('d1000000-0000-4000-8000-000000000046', '8be5f0a6-bc3c-411f-9c79-61e3e329d968', 'Sticky Notes Pack', 'Pack of twelve pastel sticky note pads', 'Stationery', 'PaperLine', 7.25, 75, 'new'),
    ('d1000000-0000-4000-8000-000000000047', '8be5f0a6-bc3c-411f-9c79-61e3e329d968', 'Programming Handbook', 'Practical guide to clean code and software design', 'Books', 'ReadMore', 34.00, 12, 'new'),
    ('d1000000-0000-4000-8000-000000000048', '8be5f0a6-bc3c-411f-9c79-61e3e329d968', 'Magnetic Whiteboard 60x90', 'Dry erase whiteboard with aluminum frame', 'Office Supplies', 'BoardPro', 58.00, 5, 'new'),
    ('d1000000-0000-4000-8000-000000000049', '8be5f0a6-bc3c-411f-9c79-61e3e329d968', 'Cross Cut Shredder', 'Shredder for up to ten sheets with cross cut blades', 'Office Supplies', 'SecureCut', 69.99, 3, 'refurbished'),
    ('d1000000-0000-4000-8000-000000000050', '8be5f0a6-bc3c-411f-9c79-61e3e329d968', 'Leather Journal', 'Handmade leather journal with cotton paper', 'Stationery', 'InkCraft', 24.00, 17, 'new');

insert into products (id, name, description, category, brand, created_by)
select id, name, description, category, brand, owner_id
from seed_rows
on conflict (id) do nothing;

insert into product_listings (product_id, seller_id, price, stock, condition)
select id, owner_id, price, stock, condition
from seed_rows
on conflict (product_id, seller_id) do nothing;

commit;