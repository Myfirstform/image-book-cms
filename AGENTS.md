# Project decisions

- Persist faculty ordering in `faculties.display_order`, save reorder requests through an admin-checked database function, and sort the admin and public lists by that field; this keeps ordering durable and authorization server-enforced while limiting reordering to faculty.