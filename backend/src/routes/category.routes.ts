import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/category.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createCategorySchema } from '../validators/type';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticate, validate(createCategorySchema), createCategory);

export default router;
