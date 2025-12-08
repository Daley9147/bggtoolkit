alter table mission_metrics_reports 
add constraint mission_metrics_reports_user_contact_key unique (user_id, contact_id);
