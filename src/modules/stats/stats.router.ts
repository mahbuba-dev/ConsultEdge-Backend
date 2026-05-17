import express from 'express';
import { checkAuth } from '../../middleware/cheackAuth';
import { Role } from '../../generated/enums';
import { StatsController } from './stats.controler';

const router = express.Router();


// Existing dashboard route
router.get(
    '/',
    checkAuth(Role.ADMIN, Role.EXPERT, Role.CLIENT),
    StatsController.getDashboardStatsData
);

// New: GET /expert/:expertId (UUID or email)
router.get(
    '/expert/:expertId',
    checkAuth(Role.ADMIN, Role.EXPERT),
    StatsController.getStatsByExpertId
);


export const StatsRoutes = router;