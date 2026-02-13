import express from 'express';

import { currentContext } from '../../middleware/authentication.ts';
import { Initiative } from '../../utils/enums/application.ts';

import activityContact from './activityContact.ts';
import ats from './ats.ts';
import code from './code.ts';
import contact from './contact.ts';
import docs from './docs.ts';
import electrification from './electrification.ts';
import general from './general.ts';
import housing from './housing.ts';
import peach from './peach.ts';
import reporting from './reporting.ts';
import sso from './sso.ts';
import sourceSystemKind from './sourceSystemKind.ts';
import user from './user.ts';
import yars from './yars.ts';

const router = express.Router();
router.use(currentContext(Initiative.PCNS));

// Base v1 Responder
router.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: [
      '/activity',
      '/ats',
      '/code',
      '/contact',
      '/docs',
      '/electrification',
      '/general',
      '/housing',
      '/peach',
      '/reporting',
      '/sso',
      '/sourceSystemKind',
      '/user',
      '/yars'
    ]
  });
});

router.use('/activity/:activityId/contact', activityContact);
router.use('/ats', ats);
router.use('/code', code);
router.use('/contact', contact);
router.use('/docs', docs);
router.use('/electrification', electrification);
router.use('/general', general);
router.use('/housing', housing);
router.use('/peach', peach);
router.use('/reporting', reporting);
router.use('/sso', sso);
router.use('/sourceSystemKind', sourceSystemKind);
router.use('/user', user);
router.use('/yars', yars);

export default router;
