-- Insert a default active season
INSERT INTO leaderboard_seasons (name, description, start_date, end_date, is_active)
VALUES 
('Summer 2023', 'Summer ice cream season', '2023-06-01', '2023-09-30', false),
('Fall 2023', 'Fall ice cream season', '2023-10-01', '2023-12-31', false),
('Winter 2024', 'Winter ice cream season', '2024-01-01', '2024-03-31', false),
('Spring 2024', 'Spring ice cream season', '2024-04-01', '2024-06-30', true)
ON CONFLICT DO NOTHING;
