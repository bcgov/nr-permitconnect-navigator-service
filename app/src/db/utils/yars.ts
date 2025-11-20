import { Action, GroupName, Initiative, Resource } from '../../utils/enums/application';

import type { Knex } from 'knex';

/**
 * Adds a new attribute_group row
 * @param knex Knex instance
 * @param initiative Initiative of the group
 * @param groupName The name of the group the attribute is attached to
 * @param attributeName The name of the attribute to add
 * @returns The generated Knex function to insert the new data
 */
export async function addAttributeGroup(
  knex: Knex,
  initiative: Initiative,
  groupName: GroupName,
  attributeName: string
) {
  const initiativeId = await getInitiativeId(knex, initiative);
  const groupId = await getGroupId(knex, initiativeId, groupName);
  return knex('yars.attribute_group').insert([
    {
      attribute_id: await getAttributeId(knex, attributeName),
      group_id: groupId
    }
  ]);
}

/**
 * Adds new group rows
 * @param knex Knex instance
 * @param initiative Initiative of the groups
 * @param groups Array of group names and their associated label
 * @returns The generated Knex function to insert the new data
 */
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

/**
 * Adds new resource rows
 * @param knex Knex instance
 * @param resources Array of resource names to add
 * @returns The generated Knex function to insert the new data
 */
export function addResources(knex: Knex, resources: Array<Resource>) {
  const items: Array<{ name: string }> = [];
  for (const resource of resources) {
    items.push({
      name: `${resource.toUpperCase()}`
    });
  }

  return knex('yars.resource').insert(items);
}

/**
 * Adds new policy rows
 * @param knex Knex instance
 * @param resources Array of resource names to add
 * @param actions Array of actions to associated with each resource
 * @returns The generated Knex function to insert the new data
 */
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

/**
 * Adds new policy_attribute rows
 * @param knex Knex instance
 * @param resource Resource names to add to
 * @param actions Array of actions to associated with each resource
 * @param attributes Array of attributes to associated with each action
 * @returns The generated Knex function to insert the new data
 */
export async function addPolicyAttributes(knex: Knex, resource: Resource, actions: Action[], attributes: string[]) {
  const actionIds = (await knex('yars.action').whereIn('name', actions).select('action_id')).map((x) => x.action_id);

  const { resource_id: resourceId } = await knex('yars.resource').where({ name: resource }).first('resource_id');

  const attributeIds = (
    await Promise.all(
      attributes.map(async (x) => {
        return await knex('yars.attribute').where({ name: x }).first('attribute_id');
      })
    )
  ).map((x) => x.attribute_id);

  const policies = await knex('yars.policy')
    .where({ resource_id: resourceId })
    .whereIn('action_id', actionIds)
    .select('policy_id');

  const items: Array<{ policy_id: number; attribute_id: number }> = [];

  for (const policy of policies) {
    for (const attr of attributeIds) {
      items.push({ policy_id: policy.policy_id, attribute_id: attr });
    }
  }

  return knex('yars.policy_attribute').insert(items);
}

/**
 * Adds new role rows
 * @param knex Knex instance
 * @param resources Array of resource names
 * @param actions Array of actions
 * @returns The generated Knex function to insert the new data
 */
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

/**
 * Adds new role_policy rows
 * @param knex Knex instance
 * @param resources Array of resource names to add
 * @param actions Array of actions to associated with each resource
 * @returns The generated Knex function to insert the new data
 */
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

    const viewerId = await knex('yars.role')
      .where({ name: `${resourceName.toUpperCase()}_VIEWER` })
      .first('role_id');

    const editorId = await knex('yars.role')
      .where({ name: `${resourceName.toUpperCase()}_EDITOR` })
      .first('role_id');

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

/**
 * Adds new group_role rows
 * @param knex Knex instance
 * @param initiative Name of the initiative to add to
 * @param group Name of the group to add to
 * @param resource Resource name to add
 * @param actions Array of actions to associated with each resource
 * @returns The generated Knex function to insert the new data
 */
export async function addGroupRoles(
  knex: Knex,
  initiative: Initiative,
  group: GroupName,
  resource: Resource,
  actions: Array<Action>
) {
  const initiativeId = await getInitiativeId(knex, initiative);
  const groupId = await getGroupId(knex, initiativeId, group);

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

/**
 * Gets an attribute ID
 * @param knex Knex instance
 * @param attributeName Name of the attribute to look for
 * @returns The attribute ID
 */
export async function getAttributeId(knex: Knex, attributeName: string) {
  const result = await knex('yars.attribute').where({ name: attributeName }).first('attribute_id');
  return result.attribute_id;
}

/**
 * Gets an initiative ID
 * @param knex Knex instance
 * @param initiative Name of the initiative to look for
 * @returns The initiative ID
 */
export async function getInitiativeId(knex: Knex, initiative: Initiative) {
  const result = await knex('initiative')
    .where({
      code: initiative
    })
    .first('initiative_id');

  return result.initiative_id;
}

/**
 * Gets an group ID
 * @param knex Knex instance
 * @param initiative Name of the initiative to look under
 * @param group Name of the group to look for
 * @returns The group ID
 */
export async function getGroupId(knex: Knex, initiativeId: number, group: GroupName) {
  const result = await knex('yars.group').where({ initiative_id: initiativeId, name: group }).first('group_id');
  return result.group_id;
}

/**
 * Deletes an attribute_group row
 * @param knex Knex instance
 * @param initiativeId Name of the initiative to look under
 * @param groupId Name of the group to look for
 * @param attributeName Name of the attribute to look for
 * @returns The generated Knex function to delete data
 */
export async function deleteAttributeGroup(
  knex: Knex,
  initiative: Initiative,
  groupName: GroupName,
  attributeName: string
) {
  const initiativeId = await getInitiativeId(knex, initiative);
  const groupId = await getGroupId(knex, initiativeId, groupName);
  const attributeId = await getAttributeId(knex, attributeName);

  return knex('yars.attribute_group').where({ group_id: groupId, attribute_id: attributeId }).del();
}

/**
 * Deletes groups rows
 * @param knex Knex instance
 * @param initiativeId Name of the initiative to look under
 * @param groups Array of group names to delete
 * @returns The generated Knex function to delete data
 */
export async function deleteGroups(knex: Knex, initiative: Initiative, groups: Array<GroupName>) {
  const initiativeId = await getInitiativeId(knex, initiative);

  return groups.map(
    async (group) => await knex('yars.group').where({ initiative_id: initiativeId, name: group }).del()
  );
}

/**
 * Deletes group_role rows
 * @param knex Knex instance
 * @param resource Name of the resource
 * @param actions Array of actions to delete
 * @returns A promise that resolves when the database calls are complete
 */
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

/**
 * Deletes role_policy rows
 * @param knex Knex instance
 * @param resource Name of the resource
 * @param actions Array of actions to delete
 * @returns A promise that resolves when the database calls are complete
 */
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

/**
 * Deletes role rows
 * @param knex Knex instance
 * @param resource Name of the resource
 * @param actions Array of actions to delete
 * @returns A promise that resolves when the database calls are complete
 */
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

/**
 * Deletes policy rows
 * @param knex Knex instance
 * @param resource Array of resource names to delete
 * @returns The generated Knex function to delete data
 */
export async function deletePolicies(knex: Knex, resource: Array<Resource>) {
  resource.map(async (resource) => {
    const resourceRow = await knex('yars.resource').where({ name: resource }).first('resource_id');
    if (resourceRow) {
      return knex('yars.policy').where({ resource_id: resourceRow.resource_id }).del();
    }
  });
}

/**
 * Deletes resource rows
 * @param knex Knex instance
 * @param resource Array of resource names to delete
 * @returns The generated Knex function to delete data
 */
export async function deleteResources(knex: Knex, resources: Array<Resource>) {
  return resources.map(async (resource) => await knex('yars.resource').where({ name: resource }).del());
}
