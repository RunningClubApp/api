---
name: Feature request
about: Suggest an idea for this project
title: ''
labels: ''
assignees: ''

---

# Description
The League API should expose routes for creating, joining, inviting, deleting, and updating routes.

# Requirements
- League Controller methods for
  - Creating Leagues from a title, owner and length
  - Joining leagues from a user id and league id
  - Inviting to leagues from a user id and league 
  - Inviting to leagues from a user id and league 
  - Inviting to leagues from a user id and league 
  - Inviting to leagues from a user id and league 
  - Inviting to leagues from a user id and league id
  - Updating leagues from a league id and any league fields.
- League Router routes for all of the above
   - Ensure all query params are validated to avoid mongo validation errors
- Tests
  - Integration tests need to be written for all API routes.
  - Security tests need to be written where user or admin data is made available.
