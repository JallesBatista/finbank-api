import AppDataSource from "../../data-source";
import User from "../../entities/user.entity";
import AppError from "../../errors/AppError";
import { IUserRequestUpdate, IUserResponse } from "../../interfaces/users.interfaces";
import { returnUserSchema } from "../../serializers/users.serializers";

const updateUserService = async (payload: IUserRequestUpdate, userId: string): Promise<IUserResponse> => {
  const keys = Object.keys(payload);

  if (!keys.length) {
    throw new AppError("No filed allowed to be updated sent");
  }

  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({
    where: {
      id: userId,
    },
    relations: {
      account: true,
    },
  });

  let updatedUser;

  if (!payload.password) {
    updatedUser = userRepo.create({
      ...payload,
      ...user,
    });
  } else {
    updatedUser = userRepo.create({
      ...user,
      ...payload,
    });
  }
  await userRepo.save(updatedUser);

  const updatedUserResponse: IUserResponse = await returnUserSchema.validate(updatedUser, {
    stripUnknown: true,
  });

  return updatedUserResponse;
};

export default updateUserService;
