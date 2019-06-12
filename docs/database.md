# Basic database design

### Database used: 
- `MongoDB 4.0.10`

### Documents

|Documents|
|-------|
|[users](#users)|
|[reviews](#reviews)|
|[feedbacks](#feedbacks)|
|[assignees](#assignees)|

### Users:

| Field | Type |
| ----- | ------ |
| firstName | String |
| lastName | String |
| userName | String |
| sex | String |
| role | String |
| password | String |
| createdDate | String |
| createdBy | String |
| updatedDate | String |
| updatedBy | String |

### Reviews:

| Field | Type |
| ----- | ------ |
| description | String |
| employeeId | String |
| createdDate | String |
| createdBy | String |
| updatedDate | String |
| updatedBy | String |

### Feedbacks:

| Field | Type |
| ----- | ------ |
| feedback | String |
| reviewId | String |
| employeeId | String |
| createdDate | String |
| createdBy | String |
| updatedDate | String |
| updatedBy | String |

### Assignees:

| Field | Type |
| ----- | ------ |
| assigneeId | String |
| assignedEmployeeId | String |
| createdDate | String |
| createdBy | String |
| updatedDate | String |
| updatedBy | String |
