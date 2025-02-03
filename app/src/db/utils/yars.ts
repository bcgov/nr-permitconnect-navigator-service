import { Action, GroupName, Initiative, Resource } from '../../utils/enums/application';

import type { Knex } from 'knex';

// TODO: Changed a lot of knex calls to `first`
// This will probably break a lot of things
// See deletePolicies() for a proper impl
export async function addGroups(knex: Knex, initiative: Initiative, groups: Array<{ name: GroupName; label: string }>) {
  const initiativeId = await getInitiativeId(knex, initiative);

  const items: Array<{ initiative_id: number; name: GroupName; label: string }> = [];
  for (const group of groups) {
    items.push({
      initiative_id: initiativeId,
      ...group
    });
  }

  return knex('yars.group').insert(items);
}

export function addResources(knex: Knex, resources: Array<Resource>) {
  const items: Array<{ name: string }> = [];
  for (const resource of resources) {
    items.push({
      name: `${resource.toUpperCase()}`
    });
  }

  return knex('yars.resource').insert(items);
}

export async function addPolicies(knex: Knex, resources: Array<Resource>, actions: Array<Action>) {
  const items = [];
  for (const resource of resources) {
    for (const action of actions) {
      items.push({
        resource_id: knex('yars.resource').where({ name: resource }).select('resource_id'),
        action_id: knex('yars.action').where({ name: action }).select('action_id')
      });
    }
  }

  return knex('yars.policy').insert(items);
}

export function addRoles(knex: Knex, resources: Array<Resource>, actions: Array<Action>) {
  const items: Array<{ name: string; description: string }> = [];
  for (const resource of resources) {
    if (actions.includes(Action.CREATE)) {
      items.push({
        name: `${resource.toUpperCase()}_CREATOR`,
        description: `Can create ${resource.toLowerCase()}s`
      });
    }
    if (actions.includes(Action.READ)) {
      items.push({
        name: `${resource.toUpperCase()}_VIEWER`,
        description: `Can view ${resource.toLowerCase()}s`
      });
    }
    if (actions.includes(Action.UPDATE) || actions.includes(Action.DELETE)) {
      items.push({
        name: `${resource.toUpperCase()}_EDITOR`,
        description: `Can edit ${resource.toLowerCase()}s`
      });
    }
  }

  return knex('yars.role').insert(items);
}

export async function addRolePolicies(knex: Knex, resources: Array<Resource>, actions: Array<Action>) {
  const policies = await knex
    .select('p.policy_id', 'r.name as resource_name', 'a.name as action_name')
    .from({ p: 'yars.policy' })
    .innerJoin({ r: 'yars.resource' }, 'p.resource_id', '=', 'r.resource_id')
    .innerJoin({ a: 'yars.action' }, 'p.action_id', '=', 'a.action_id');

  const items: Array<{ role_id: number; policy_id: number }> = [];

  const addRolePolicies = async (resourceName: string) => {
    const creatorId = await knex('yars.role')
      .where({ name: `${resourceName.toUpperCase()}_CREATOR` })
      .first('role_id');
    console.log(creatorId);
    const viewerId = await knex('yars.role')
      .where({ name: `${resourceName.toUpperCase()}_VIEWER` })
      .first('role_id');
    console.log(viewerId);
    const editorId = await knex('yars.role')
      .where({ name: `${resourceName.toUpperCase()}_EDITOR` })
      .first('role_id');
    console.log(editorId);

    const resourcePolicies = policies.filter((x) => x.resource_name === resourceName);

    if (actions.includes(Action.CREATE)) {
      items.push({
        role_id: creatorId.role_id,
        policy_id: resourcePolicies.find((x) => x.action_name == Action.CREATE).policy_id
      });
    }
    if (actions.includes(Action.READ)) {
      items.push({
        role_id: viewerId.role_id,
        policy_id: resourcePolicies.find((x) => x.action_name == Action.READ).policy_id
      });
    }
    if (actions.includes(Action.UPDATE)) {
      items.push({
        role_id: editorId.role_id,
        policy_id: resourcePolicies.find((x) => x.action_name == Action.UPDATE).policy_id
      });
    }
    if (actions.includes(Action.DELETE)) {
      items.push({
        role_id: editorId.role_id,
        policy_id: resourcePolicies.find((x) => x.action_name == Action.DELETE).policy_id
      });
    }
  };

  await Promise.all(resources.map((x) => addRolePolicies(x)));

  return knex('yars.role_policy').insert(items);
}

export async function addGroupRoles(knex: Knex, groupId: number, resource: Resource, actions: Array<Action>) {
  const items: Array<{ group_id: number; role_id: number }> = [];

  if (actions.includes(Action.CREATE)) {
    items.push({
      group_id: groupId,
      role_id: (
        await knex('yars.role')
          .where({ name: `${resource.toUpperCase()}_CREATOR` })
          .select('role_id')
      )[0].role_id
    });
  }

  if (actions.includes(Action.READ)) {
    items.push({
      group_id: groupId,
      role_id: (
        await knex('yars.role')
          .where({ name: `${resource.toUpperCase()}_VIEWER` })
          .select('role_id')
      )[0].role_id
    });
  }

  if (actions.includes(Action.UPDATE) || actions.includes(Action.DELETE)) {
    items.push({
      group_id: groupId,
      role_id: (
        await knex('yars.role')
          .where({ name: `${resource.toUpperCase()}_EDITOR` })
          .select('role_id')
      )[0].role_id
    });
  }

  return knex('yars.group_role').insert(items);
}

export async function getInitiativeId(knex: Knex, initiative: Initiative) {
  const result = await knex('initiative')
    .where({
      code: initiative
    })
    .first('initiative_id');

  return result.initiative_id;
}

export async function getGroupId(knex: Knex, initiativeId: number, group: GroupName) {
  const result = await knex('yars.group').where({ initiative_id: initiativeId, name: group }).first('group_id');

  return result.group_id;
}

export async function deleteGroups(knex: Knex, initiative: Initiative, groups: Array<GroupName>) {
  const initiativeId = await getInitiativeId(knex, initiative);

  groups.map(async (group) => await knex('yars.group').where({ initiative_id: initiativeId, name: group }).del());
}

export async function deleteGroupRoles(knex: Knex, resource: Resource, actions: Array<Action>) {
  let creatorRole, viewerRole, editorRole;

  if (actions.includes(Action.CREATE)) {
    creatorRole = await knex('yars.role')
      .where({ name: `${resource}_CREATOR` })
      .first('role_id');
  }

  if (actions.includes(Action.READ)) {
    viewerRole = await knex('yars.role')
      .where({ name: `${resource}_VIEWER` })
      .first('role_id');
  }

  if (actions.includes(Action.UPDATE) || actions.includes(Action.DELETE)) {
    editorRole = await knex('yars.role')
      .where({ name: `${resource}_EDITOR` })
      .first('role_id');
  }

  if (creatorRole) {
    await knex('yars.group_role').where({ role_id: creatorRole.role_id }).del();
  }
  if (viewerRole) {
    await knex('yars.group_role').where({ role_id: viewerRole.role_id }).del();
  }
  if (editorRole) {
    await knex('yars.group_role').where({ role_id: editorRole.role_id }).del();
  }
}

export async function deleteRolePolicies(knex: Knex, resource: Resource, actions: Array<Action>) {
  let creatorRole, viewerRole, editorRole;

  if (actions.includes(Action.CREATE)) {
    creatorRole = await knex('yars.role')
      .where({ name: `${resource}_CREATOR` })
      .first('role_id');
  }

  if (actions.includes(Action.READ)) {
    viewerRole = await knex('yars.role')
      .where({ name: `${resource}_VIEWER` })
      .first('role_id');
  }

  if (actions.includes(Action.UPDATE) || actions.includes(Action.DELETE)) {
    editorRole = await knex('yars.role')
      .where({ name: `${resource}_EDITOR` })
      .first('role_id');
  }

  if (creatorRole) {
    await knex('yars.role_policy').where({ role_id: creatorRole.role_id }).del();
  }
  if (viewerRole) {
    await knex('yars.role_policy').where({ role_id: viewerRole.role_id }).del();
  }
  if (editorRole) {
    await knex('yars.role_policy').where({ role_id: editorRole.role_id }).del();
  }
}

export async function deleteRoles(knex: Knex, resource: Resource, actions: Array<Action>) {
  if (actions.includes(Action.CREATE)) {
    await knex('yars.role')
      .where({ name: `${resource}_CREATOR` })
      .del();
  }

  if (actions.includes(Action.READ)) {
    await knex('yars.role')
      .where({ name: `${resource}_VIEWER` })
      .del();
  }

  if (actions.includes(Action.UPDATE) || actions.includes(Action.DELETE)) {
    await knex('yars.role')
      .where({ name: `${resource}_EDITOR` })
      .del();
  }
}

export async function deletePolicies(knex: Knex, resource: Array<Resource>) {
  resource.map(async (resource) => {
    const resourceRow = await knex('yars.resource').where({ name: resource }).first('resource_id');
    if (resourceRow) {
      return knex('yars.policy').where({ resource_id: resourceRow.resource_id }).del();
    }
  });
}

export async function deleteResources(knex: Knex, resources: Array<Resource>) {
  resources.map(async (resource) => await knex('yars.resource').where({ name: resource }).del());
}
