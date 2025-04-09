import express from 'express';

import { currentContext } from '../../middleware/authentication';
import { Initiative } from '../../utils/enums/application';

import ats from './ats';
import contact from './contact';
import docs from './docs';
import electrification from './electrification';
import housing from './housing';
import reporting from './reporting';
import sso from './sso';
import user from './user';
import yars from './yars';

const router = express.Router();
router.use(currentContext(Initiative.PCNS));

// Base v1 Responder
router.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: ['/ats', '/contact', '/docs', '/electrification', '/housing', '/reporting', '/sso', '/user', '/yars']
  });
});

router.use('/ats', ats);
router.use('/contact', contact);
router.use('/docs', docs);
router.use('/electrification', electrification);
router.use('/housing', housing);
router.use('/reporting', reporting);
router.use('/sso', sso);
router.use('/user', user);
router.use('/yars', yars);

export default router;
