/* eslint-disable @typescript-eslint/no-explicit-any */
import contact from './contact';
import user from './user';

export default {
  fromPrismaModelWithContact(input: any): any {
    const electrificationProject = input;
    if (electrificationProject && input.activity.activity_contact) {
      input.activity.activity_contact = input.activity.activity_contact.map((x: any) => ({
        ...x,
        contact: contact.fromPrismaModel(x.contact)
      }));
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
