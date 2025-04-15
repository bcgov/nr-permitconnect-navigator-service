/* eslint-disable @typescript-eslint/no-explicit-any */
import activity from './activity';
import activity_contact from './activity_contact';
import contact from './contact';
import user from './user';

export default {
  fromPrismaModelWithContact(input: any): any {
    const electrificationProject = { ...input };
    if (electrificationProject && input.activity) {
      electrificationProject.activity = activity.fromPrismaModel(input.activity);

      if (input.activity.activity_contact) {
        electrificationProject.activity.activityContact = input.activity.activity_contact.map((x: any) => ({
          ...activity_contact.fromPrismaModel(x),
          contact: x.contact ? contact.fromPrismaModel(x.contact) : undefined
        }));
      }
    }

    return electrificationProject;
  },

  fromPrismaModelWithUser(input: any): any {
    const electrificationProject = input as any;
    if (electrificationProject && input.user) {
      electrificationProject.user = user.fromPrismaModel(input.user);
    }

    return electrificationProject;
  }
};
