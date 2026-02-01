

export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | "desc";
}

export interface PaginatedResult <T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }
}


export const paginate = async <T>(
  model: any,
  params: PaginationParams = {},
  filter: Partial<{ where: any; orderBy: any }> = {},
): Promise<PaginatedResult<T>> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  const orderBy =
    params.sortBy && params.sortOrder
      ? { [params.sortBy]: params.sortOrder }
      : { createdAt: "desc" };

  // Count total items
  const total = await model.count({ where: filter.where });

  // Get paginated items
  const data = await model.findMany({
    where: filter.where,
    orderBy: filter.orderBy ?? orderBy,
    skip,
    take: limit,
  });

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export default paginate