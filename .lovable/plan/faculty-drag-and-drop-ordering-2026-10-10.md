# Faculty drag-and-drop ordering

Add an administrator-controlled order to the existing faculty list and reflect it on the public Faculty page, without changing its visual design or other admin sections.

## User-facing changes
- Add a draggable handle and clear drag/placeholder feedback to faculty cards in the Faculties manager.
- Save the complete order securely, show a success/error notification, and restore the prior order if saving fails.
- Sort the public Faculty page by the saved order; keep existing add, edit, delete, upload, and display behavior.

## Technical approach
- Add and backfill an integer `display_order` field on the existing faculty table; assign new records to the end.
- Add a narrowly scoped database reorder function that accepts the ordered faculty IDs and permits only authenticated admins; preserve the table's existing RLS and grants.
- Use a touch-capable drag-and-drop library, update the admin manager and public query, and validate the build and resulting interaction.
