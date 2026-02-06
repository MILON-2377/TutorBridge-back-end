import ApiError from "../../utils/ApiError.js";

export default class StudentService {
  public static getStudents = async () => {
    try {
    } catch (error) {
      console.error("Get students error");
      throw ApiError.error("");
    }
  };
}
