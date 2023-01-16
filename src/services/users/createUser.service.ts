import AppDataSource from "../../data-source";
import Account from "../../entities/account.entity";
import User from "../../entities/user.entity";
import AppError from "../../errors/AppError";
import { IUserRequest, IUserResponse } from "../../interfaces/users.interfaces";
import { returnUserSchema } from "../../serializers/users.serializers";

const createUserService = async (body: IUserRequest): Promise<IUserResponse> => {
  const userRepo = AppDataSource.getRepository(User);

  const foundEmail = await userRepo.find({
    where: { email: body.email },
    withDeleted: true,
  });

  const foundCPF = await userRepo.find({
    where: { CPF: body.CPF },
    withDeleted: true,
  });

  if (foundEmail[0]) {
    throw new AppError("Email already exists", 409);
  }

  if (foundCPF[0]) {
    throw new AppError("CPF already exists", 409);
  }

  const accountRepo = AppDataSource.getRepository(Account);
  const accountCreate = accountRepo.create();
  await accountRepo.save(accountCreate);

  // const [month, day, year] = body.birthdate.split("/").map(Number);

  // let birthday = ``;

  // if (
  //   process.env.NODE_ENV === "production" ||
  //   process.env.NODE_ENV === "test"
  // ) {
  //   birthday = `${month}-${day}-${year}`;
  // } else {
  //   birthday = `${day}-${month}-${year}`;
  // }

  const userCreation = userRepo.create({
    ...body,
    account: accountCreate,
  });

  await userRepo.save(userCreation);

  const validateUserReturn = await returnUserSchema.validate(userCreation, {
    abortEarly: false,
    stripUnknown: true,
  });

  return validateUserReturn;
};

export default createUserService;
