-- Insert default leaderboard metrics
INSERT INTO leaderboard_metrics (name, description, icon) VALUES
('flavors_logged', 'Total number of flavors logged by the user', 'iceCream'),
('shops_visited', 'Number of unique ice cream shops visited', 'store'),
('average_rating', 'Average rating given to ice cream flavors', 'star'),
('badges_earned', 'Total number of badges earned', 'award'),
('reviews_written', 'Number of reviews written for shops or flavors', 'messageSquare'),
('consecutive_days', 'Maximum consecutive days with activity', 'calendar')
ON CONFLICT DO NOTHING;
