# API Specification

Very basic api specification and brief details about each endpoint covered here.

## Overall API endpoints
| endpoint | description |
| -------- | ----------- |
| [/users/](#endpoint-users)  | Endpoint for user/employee related routs |
| [/reviews/](#endpoint-reviews) | Endpoint for giving review related routes |
| [/feedbacks/](#endpoint-feedbacks) | Endpoint for feedback of review related routes |
| [/assignees/](#endpoint-assignees) | Endpoint for assignment related routes |

### endpoint: /users/

| Functionality | Request body | Method | Route | Collection | Token need ? |
| ------------- | ---------- | -------| ------| -----------| -------------|
| Get all users/employees | `<none>` | GET | /users/ | users | Y |
| Get user by id | `id` | GET | /users/:id | users | Y |
| Register new user/employee | `userName, firstName, lastName, password, role, sex` | POST | /users/register | users | N |
| Authenticate user | `userName, password` | POST | /users/authenticate | users | N |
| Update user | `_id` and either of `userName, firstName, lastName, password, role, sex` | PUT | /users | users | Y |
| Delete user | `_id` | DELETE | /users | users | Y |
| Log out and invalidate token | `<none>` | POST | /users/logout | users | N |

### endpoint: /reviews/

| Functionality | Request body | Method | Route | Collection | Token need ? |
| ------------- | ---------- | -------| ------| -----------| -------------| 
| To give reivew to some employee | `description`, `employeeId` | POST | /reviews/create | reviews | Y |
| Get reviews of someone | `employeeId` | POST | /reviews/ | reviews | Y |
| Get review by id | `_id` | GET | /reviews/:_id | reviews | Y |
| Delete review | `_id` | DELETE | /reviews/ | reviews/ | Y |
| Update review | `_id` and either of `description`, `employeeId` | PUT | /reviews/ | reviews | Y |

### endpoint: /feedbacks/

| Functionality | Request body | Method | Route | Collection | Token need ? |
| ------------- | ---------- | -------| ------| -----------| -------------| 
| To give feedback to some review | `feedback`, `employeeId`, `reviewId` | POST | /feedbacks/create | feedbacks | Y |
| Get feedbacks of some review | `reviewId` | POST | /feedbacks/ | feedbacks | Y |
| Get feedback by id | `_id` | GET | /feedbacks/:_id | feedbacks | Y |
| Delete feedback | `_id` | DELETE | /feedbacks/ | feedbacks/ | Y |
| Update feedback | `_id` and either of `feedback`, `employeeId`, `reviewId` | PUT | /feedbacks/ | feedbacks | Y |

### endpoint: /assignees/

| Functionality | Request body | Method | Route | Collection | Token need ? |
| ------------- | ---------- | -------| ------| -----------| -------------| 
| To assigne someone to some employee | `assigneeId`, `assignedEmployeeId` | POST | /assignees/create | assignees | Y |
| Get all assignees of some employee | `assignedEmployeeId` | POST | /assignees/ | assignees | Y |
| Get assigned employees of some assignee | `assigneeId` | POST | /assignees/assigned | assignees | Y |
| Get record by id | `_id` | GET | /assignees/:_id | assignees/ | Y |
| Delete assignee by record id | `_id` | DELETE | /assignees/ | assignees | Y |