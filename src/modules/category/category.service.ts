import prisma from "../../lib/prisma.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import generateSlug from "../helpers/generateSlug.js";
import paginate from "../helpers/pagination.js";
import { CategoryInput } from "./category.validation.js";

export interface GetCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: "asc" | "desc";
  sortBy?: string;
  isActive?: boolean;
}

export default class CategoryService {
  public static getCategories = async (params: GetCategoriesParams) => {
    const {
      page = 1,
      limit = 10,
      isActive = true,
      search,
      sortOrder = "asc",
    } = params;

    try {
      const skip = (page - 1) * limit;

      // Count total categories for pagination meta
      const total = await prisma.category.count({
        where: {
          isActive,
          ...(search && {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }),
        },
      });

      // Fetch paginated categories
      const categories = await prisma.category.findMany({
        where: {
          isActive,
          ...(search && {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }),
        },
        orderBy: {
          name: sortOrder,
        },
        skip,
        take: limit,
      });

      // Return structured response with pagination meta
      return ApiResponse.success("Categories fetched successfully", {
        data: categories,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      return ApiResponse.error("Get categories error",error);
    }
  };

  public static updateCategory = async (
    categoryId: string,
    data: Partial<CategoryInput>,
  ) => {
    try {
      const category = await prisma.category.update({
        where: {
          id: categoryId,
        },
        data: {
          ...data,
        },
      });

      return ApiResponse.success("Category updated successfully", category);
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new ApiError(404, "Category not found");
      }

      if (error.code === "P2002") {
        throw new ApiError(409, "Category name already exists");
      }

      throw error;
    }
  };

  public static createCategory = async (
    data: CategoryInput,
    userId: string,
  ) => {
    const slug = generateSlug(data.name);
    try {
      const category = await prisma.category.create({
        data: {
          ...data,
          slug,
          createdBy: userId,
        },
      });

      return ApiResponse.created(category, "Category created successfully");
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new ApiError(409, "Category already exists");
      }

      throw error;
    }
  };

  public static async deleteCategory(categoryId: string) {
    try {
      const category = await prisma.category.update({
        where: { id: categoryId },
        data: {
          isActive: false,
        },
      });

      return ApiResponse.success("Category deleted successfully", category);
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new ApiError(404, "Category not found");
      }

      throw error;
    }
  }

  public static async hardDeleteCategory(categoryId: string) {
    try {
      await prisma.category.delete({
        where: { id: categoryId },
      });

      return ApiResponse.success("Category permanently deleted", null);
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new ApiError(404, "Category not found");
      }

      throw error;
    }
  }
}
