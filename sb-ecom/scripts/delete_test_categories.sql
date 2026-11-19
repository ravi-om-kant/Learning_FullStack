-- Removes only the rows created by insert_test_categories.sql.
-- The original categories (Bathroom, Travel Updated, Sports & Fitness, ...) are not touched.

DELETE FROM category WHERE category_name LIKE 'Test Category %';

SELECT count(*) AS total_categories FROM category;
