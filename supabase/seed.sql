-- ==============================================================================
-- LOCAL LEGEND: Seed Data for Supabase
-- ==============================================================================

-- 1. Insert Sample Places
INSERT INTO public.places (id, name, address, latitude, longitude)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'Caffe Reggio', '119 MacDougal St, New York, NY 10012', 40.7301, -73.9996),
  ('11111111-1111-1111-1111-111111111102', 'Shakespeare and Company', '37 Rue de la Bûcherie, 75005 Paris, France', 48.8526, 2.3470),
  ('11111111-1111-1111-1111-111111111103', 'Tatsumi Bridge, Gion', 'Gion Shirakawa, Higashiyama Ward, Kyoto 605-0087', 35.0062, 135.7738),
  ('11111111-1111-1111-1111-111111111104', 'Miradouro de Santa Luzia', 'Largo Santa Luzia, 1100-487 Lisboa, Portugal', 38.7118, -9.1306),
  ('11111111-1111-1111-1111-111111111105', 'City Lights Booksellers & Publishers', '261 Columbus Ave, San Francisco, CA 94133', 37.7976, -122.4066),
  ('11111111-1111-1111-1111-111111111106', 'Marine Drive Promenade', 'Marine Drive, Nariman Point, Mumbai, Maharashtra 400020', 18.9438, 72.8234)
ON CONFLICT (id) DO NOTHING;
