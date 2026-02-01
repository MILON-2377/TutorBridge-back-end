import { Request, Response } from "express";
import asyncHandler from "../../utils/AsyncHandler.js";
import { CategorySchema } from "./category.validation.js";
import CategoryService, { GetCategoriesParams } from "./category.service.js";
import ApiError from "../../utils/ApiError.js";

export default class CategoryController {
  public static createCategory = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req?.user?.id;
      const rawData = req.body;

      if (!userId) {
        throw ApiError.badRequest("UserId is missing");
      }
      const validatedCategoryData = CategorySchema.parse(rawData);

      const response = await CategoryService.createCategory(
        validatedCategoryData,
        userId,
      );

      return res.status(response.statusCode).json(response);
    },
  );

  public static getCategories = asyncHandler(
    async (req: Request, res: Response) => {
      const params: GetCategoriesParams = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as "asc" | "desc") ?? "asc",
        isActive:
          req.query.isActive !== undefined
            ? req.query.isActive === "true"
            : true,
      };

      const response = await CategoryService.getCategories(params);
      return res.status(response.statusCode).json(response);
    },
  );

  // Update Category
  public static updateCategory = asyncHandler(
    async (req: Request, res: Response) => {
      const categoryId = req.params.id;
      const rawData = req.body;

      if (!categoryId) {
        throw ApiError.badRequest("Category ID is required");
      }

      const validatedData = CategorySchema.partial().parse(rawData); 

      const response = await CategoryService.updateCategory(
        categoryId as string,
        validatedData,
      );
      return res.status(response.statusCode).json(response);
    },
  );

  // Delete Category
  public static deleteCategory = asyncHandler(
    async (req: Request, res: Response) => {
      const categoryId = req.params.id;

      if (!categoryId) {
        throw ApiError.badRequest("Category ID is required");
      }

      const response = await CategoryService.deleteCategory(categoryId as string);
      return res.status(response.statusCode).json(response);
    },
  );
}
