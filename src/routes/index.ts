import { Router } from 'express';
import categoriesRouter    from './categories.routes';
import authorsRouter       from './authors.routes';
import monksRouter         from './monks.routes';
import activitiesRouter    from './activities.routes';
import activityPhotosRouter from './activityPhotos.routes';
import articlesRouter      from './articles.routes';
import templeHistoryRouter from './templeHistory.routes';
import headerNavRouter     from './headerNav.routes';
import footerRouter        from './footer.routes';
import contactInfoRouter   from './contactInfo.routes';

const router = Router();

router.use('/categories',       categoriesRouter);
router.use('/authors',          authorsRouter);
router.use('/monks',            monksRouter);
router.use('/activities',       activitiesRouter);
router.use('/activity-photos',  activityPhotosRouter);
router.use('/articles',         articlesRouter);
router.use('/temple-history',   templeHistoryRouter);
router.use('/header-nav',       headerNavRouter);
router.use('/footer',           footerRouter);
router.use('/contact-info',     contactInfoRouter);

export default router;
