-- Associate features with subscription tiers using the existing IDs
-- Free tier features
INSERT INTO subscription_tier_features (subscription_tier_id, feature_id)
VALUES
  -- Free tier (e157c4a7-f1b9-408a-a77c-7b88970654f0)
  ('e157c4a7-f1b9-408a-a77c-7b88970654f0', '5593771f-0f38-4e2c-8250-d30dca1a1c41'), -- Basic Shop Profile
  ('e157c4a7-f1b9-408a-a77c-7b88970654f0', '456a3f20-911e-44a9-97e3-771944deb32c'), -- Basic Analytics
  ('e157c4a7-f1b9-408a-a77c-7b88970654f0', '162b49c2-a463-42d8-a57e-09422847019c'), -- Basic Notifications
  ('e157c4a7-f1b9-408a-a77c-7b88970654f0', '917e5ced-cb71-4039-993f-3900ab177883'), -- Email Support

  -- Standard tier (aa86c618-e38a-49d3-ae30-eb46271b6712)
  ('aa86c618-e38a-49d3-ae30-eb46271b6712', '5593771f-0f38-4e2c-8250-d30dca1a1c41'), -- Basic Shop Profile
  ('aa86c618-e38a-49d3-ae30-eb46271b6712', '9ad55c31-dce2-448e-aab1-d8e1237de521'), -- Enhanced Shop Profile
  ('aa86c618-e38a-49d3-ae30-eb46271b6712', '456a3f20-911e-44a9-97e3-771944deb32c'), -- Basic Analytics
  ('aa86c618-e38a-49d3-ae30-eb46271b6712', 'b6f31302-4032-4c70-b31a-7618565a8516'), -- Advanced Analytics
  ('aa86c618-e38a-49d3-ae30-eb46271b6712', '162b49c2-a463-42d8-a57e-09422847019c'), -- Basic Notifications
  ('aa86c618-e38a-49d3-ae30-eb46271b6712', '200565fb-0031-4bba-b541-41e3123ba36a'), -- Menu Management
  ('aa86c618-e38a-49d3-ae30-eb46271b6712', '608e561a-4628-4a39-9efd-66dc610a90bd'), -- Flavor Tracking
  ('aa86c618-e38a-49d3-ae30-eb46271b6712', '917e5ced-cb71-4039-993f-3900ab177883'), -- Email Support
  ('aa86c618-e38a-49d3-ae30-eb46271b6712', '34e9f99d-70cb-416e-8c7b-a9f7819aa7b0'), -- Priority Support

  -- Premium tier (54fd5962-49b6-4cf7-b653-963bbe941e8f)
  ('54fd5962-49b6-4cf7-b653-963bbe941e8f', '5593771f-0f38-4e2c-8250-d30dca1a1c41'), -- Basic Shop Profile
  ('54fd5962-49b6-4cf7-b653-963bbe941e8f', '9ad55c31-dce2-448e-aab1-d8e1237de521'), -- Enhanced Shop Profile
  ('54fd5962-49b6-4cf7-b653-963bbe941e8f', '5ed82a51-c6ea-4dc5-be4e-239199e9b0b5'), -- Premium Shop Profile
  ('54fd5962-49b6-4cf7-b653-963bbe941e8f', '456a3f20-911e-44a9-97e3-771944deb32c'), -- Basic Analytics
  ('54fd5962-49b6-4cf7-b653-963bbe941e8f', 'b6f31302-4032-4c70-b31a-7618565a8516'), -- Advanced Analytics
  ('54fd5962-49b6-4cf7-b653-963bbe941e8f', '8c2497bc-dc7e-4611-9960-02003e8e23a5'), -- Real-time Analytics
  ('54fd5962-49b6-4cf7-b653-963bbe941e8f', '162b49c2-a463-42d8-a57e-09422847019c'), -- Basic Notifications
  ('54fd5962-49b6-4cf7-b653-963bbe941e8f', '81d558fc-e43d-4573-864f-9bd6aa5e91d3'), -- Advanced Notifications
  ('54fd5962-49b6-4cf7-b653-963bbe941e8f', '200565fb-0031-4bba-b541-41e3123ba36a'), -- Menu Management
  ('54fd5962-49b6-4cf7-b653-963bbe941e8f', 'cb1e2365-cedd-4ab4-9cc2-d550c61fd747'), -- Advanced Menu Management
  ('54fd5962-49b6-4cf7-b653-963bbe941e8f', '608e561a-4628-4a39-9efd-66dc610a90bd'), -- Flavor Tracking
  ('54fd5962-49b6-4cf7-b653-963bbe941e8f', '06f0efb7-910c-48e1-af41-ed44aedf3bcd'), -- Advanced Flavor Analytics
  ('54fd5962-49b6-4cf7-b653-963bbe941e8f', '917e5ced-cb71-4039-993f-3900ab177883'), -- Email Support
  ('54fd5962-49b6-4cf7-b653-963bbe941e8f', '34e9f99d-70cb-416e-8c7b-a9f7819aa7b0'), -- Priority Support
  ('54fd5962-49b6-4cf7-b653-963bbe941e8f', '9a87f0f8-75c1-4d98-b004-9e60d4949ef7'), -- Phone Support

  -- Enterprise tier - all features
  ('3626a358-9314-47a6-8f14-e26b9842a036', '5593771f-0f38-4e2c-8250-d30dca1a1c41'), -- Basic Shop Profile
  ('3626a358-9314-47a6-8f14-e26b9842a036', '9ad55c31-dce2-448e-aab1-d8e1237de521'), -- Enhanced Shop Profile
  ('3626a358-9314-47a6-8f14-e26b9842a036', '5ed82a51-c6ea-4dc5-be4e-239199e9b0b5'), -- Premium Shop Profile
  ('3626a358-9314-47a6-8f14-e26b9842a036', '456a3f20-911e-44a9-97e3-771944deb32c'), -- Basic Analytics
  ('3626a358-9314-47a6-8f14-e26b9842a036', 'b6f31302-4032-4c70-b31a-7618565a8516'), -- Advanced Analytics
  ('3626a358-9314-47a6-8f14-e26b9842a036', '8c2497bc-dc7e-4611-9960-02003e8e23a5'), -- Real-time Analytics
  ('3626a358-9314-47a6-8f14-e26b9842a036', 'b91142c7-6b3d-474c-acc8-07784803a30f'), -- Customer Management
  ('3626a358-9314-47a6-8f14-e26b9842a036', '07eaa6c9-c453-4b7d-adf6-703e092924f8'), -- Advanced Customer Insights
  ('3626a358-9314-47a6-8f14-e26b9842a036', '162b49c2-a463-42d8-a57e-09422847019c'), -- Basic Notifications
  ('3626a358-9314-47a6-8f14-e26b9842a036', '81d558fc-e43d-4573-864f-9bd6aa5e91d3'), -- Advanced Notifications
  ('3626a358-9314-47a6-8f14-e26b9842a036', '200565fb-0031-4bba-b541-41e3123ba36a'), -- Menu Management
  ('3626a358-9314-47a6-8f14-e26b9842a036', 'cb1e2365-cedd-4ab4-9cc2-d550c61fd747'), -- Advanced Menu Management
  ('3626a358-9314-47a6-8f14-e26b9842a036', '608e561a-4628-4a39-9efd-66dc610a90bd'), -- Flavor Tracking
  ('3626a358-9314-47a6-8f14-e26b9842a036', '06f0efb7-910c-48e1-af41-ed44aedf3bcd'), -- Advanced Flavor Analytics
  ('3626a358-9314-47a6-8f14-e26b9842a036', '917e5ced-cb71-4039-993f-3900ab177883'), -- Email Support
  ('3626a358-9314-47a6-8f14-e26b9842a036', '34e9f99d-70cb-416e-8c7b-a9f7819aa7b0'), -- Priority Support
  ('3626a358-9314-47a6-8f14-e26b9842a036', '9a87f0f8-75c1-4d98-b004-9e60d4949ef7')  -- Phone Support
ON CONFLICT (subscription_tier_id, feature_id) DO NOTHING;
