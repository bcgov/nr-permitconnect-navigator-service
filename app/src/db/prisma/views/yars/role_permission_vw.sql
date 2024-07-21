SELECT
  (
    (
      (
        (
          (
            (
              (
                (lower(initiative.label) || '.' :: text) || role.user_type
              ) || '.' :: text
            ) || policy.name
          ) || '.' :: text
        ) || resource.name
      ) || '.' :: text
    ) || ACTION.name
  ) AS pid,
  role.role_id,
  lower(initiative.label) AS initiative_name,
  role.user_type,
  policy.name AS policy_name,
  scope.name AS scope_name,
  scope.priority AS scope_priority,
  resource.name AS resource_name,
  ACTION.name AS action_name
FROM
  (
    (
      (
        (
          (
            (
              (
                (
                  yars.role
                  JOIN initiative ON ((role.initiative_id = initiative.initiative_id))
                )
                JOIN yars.role_policy ON ((role_policy.role_id = role.role_id))
              )
              JOIN yars.policy ON ((policy.policy_id = role_policy.policy_id))
            )
            LEFT JOIN yars.scope ON ((policy.scope_id = scope.scope_id))
          )
          JOIN yars.policy_permission ON ((policy_permission.policy_id = policy.policy_id))
        )
        JOIN yars.permission ON (
          (
            permission.permission_id = policy_permission.permission_id
          )
        )
      )
      JOIN yars.resource ON ((resource.resource_id = permission.resource_id))
    )
    JOIN yars.action ON ((ACTION.action_id = permission.action_id))
  );