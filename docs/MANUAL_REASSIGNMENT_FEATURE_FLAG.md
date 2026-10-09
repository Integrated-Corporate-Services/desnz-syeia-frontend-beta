# Manual reassignment feature flag (SYEIA-2560)

`VITE_ENABLE_MANUAL_REASSIGNMENT` defaults to `false`. Set it to `true` only in
environments where manual reassignment should be visible. The corresponding backend
flag `MANUAL_REASSIGNMENT_ENABLED` must also be enabled; it is the authoritative API
gate.

The implementation follows the existing manage-user-role flag:
`generate-runtime-config.sh` -> `window._env_` -> `getRuntimeEnv` ->
`configService.getFeatureFlags().manualReassignment.enabled`.

## Deployment and SSM

Use an environment-specific SSM String parameter with value `true` or `false`, for
example `/syeia/dev/manual-reassignment-enabled`. Configure the frontend ECS task
definition to inject its resolved value as `VITE_ENABLE_MANUAL_REASSIGNMENT` using
SSM `valueFrom`. The browser must receive the boolean string, not a parameter ARN.
The backend can point `MANUAL_REASSIGNMENT_ENABLED` directly at the same parameter
ARN using its existing SSM configuration helper.

Developers can turn the feature on/off by updating that parameter. Restart/redeploy
frontend tasks and reload the browser to pick up the changed value. No frontend
image rebuild is needed. The backend reads ARN-backed values on each reassignment
request and blocks requests immediately once it reads `false`.

Task-definition and IAM wiring live outside this repository and still need to be
configured. No live AWS parameters or deployment resources were changed.

## Local development

Set `VITE_ENABLE_MANUAL_REASSIGNMENT=true` in the frontend Vite environment and
`MANUAL_REASSIGNMENT_ENABLED=true` in the backend environment, then restart both.
Set both to `false` to disable.

When disabled, S37/NWL reassignment pages are not registered, links and assignment
details are hidden, and summary pages do not request reassignment history or
eligibility. Completed assignments and their access rights are not rolled back.