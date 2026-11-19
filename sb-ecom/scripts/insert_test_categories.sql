-- Inserts 100 test rows into the "category" table (PostgreSQL, database: e-commerce).
-- Names are unique ("Test Category 001" ... "Test Category 100") because
-- CategoryRepository.findByCategoryName expects one match per name.
-- IDs come from the Hibernate sequence so the app can keep inserting without key clashes.

INSERT INTO category (category_id, category_name)
SELECT nextval('category_seq'), 'Test Category ' || lpad(n::text, 3, '0')
FROM generate_series(1, 100) AS n;

SELECT count(*) AS total_categories FROM category;
