Task Management performance tests (Artillery)

Contents:

- `basic-load.yml` — light NGO-focused scenarios: login, list assigned tasks, get task detail, lifecycle ops (accept/in-progress/complete).
- `stress-test.yml` — sustained higher load for list and lifecycle endpoints.
- `spike-test.yml` — spike/peak patterns to simulate emergencies.
- `ngo-test-users.csv` — placeholder NGO credentials used by the tests.
- `admin-test-users.csv` — placeholder admin credentials (if you extend admin tests).
- `task-ids.csv` — placeholder Request/NGO IDs for targeted operations.

Notes / Running
- Populate `ngo-test-users.csv`, `admin-test-users.csv` and `task-ids.csv` with valid JWT tokens and object IDs from your development DB before running the tests. Each CSV now expects a `token` column containing a valid JWT (no login step is performed by these scripts).
- The task lifecycle endpoints will mutate data (accept/complete). Run against a disposable test environment or use IDs created specifically for load testing.

Run examples from the server folder:

```bash
# basic
npm run perf:task:basic

# stress
npm run perf:task:stress

# spike
npm run perf:task:spike
```

If you need admin-level tests (assign/unassign), add an admin scenario that uses `admin-test-users.csv` and the admin routes (`/api/admin/help-requests/:id/assign`).
