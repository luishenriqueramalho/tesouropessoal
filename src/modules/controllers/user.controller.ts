import { FastifyReply, FastifyRequest } from "fastify";
import { createUsers, deleteUsers, findLoginByUser, getUsers } from "../services/use.service";
import { CreateUserInput } from "../schemas/user.schema";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { verifyPassword } from "../../config/hash";

export async function getUserHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const users = await getUsers();
    const data = {
      success: true,
      message: null,
      status: 200,
      data: users,
    };
    return reply.code(200).send(data);
  } catch (error) {
    const data = {
      success: false,
      message: "Ocorreu um erro ao consultar os usuários",
      error: error,
      status: 500,
      data: null,
    };
    return reply.code(500).send(data);
  }
}

export async function loginHandler(
  request: FastifyRequest<{
    Body: {
      email: string;
      password: string;
    }
  }>,
  reply: FastifyReply
) {
  try {
    const { email, password } = request.body;

    const user = await findLoginByUser(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return reply.code(401).send({
        success: false,
        message: "Credenciais inválidas!"
      });
    } else {}

    const token = jwt.sign({userId: user.id}, 'sua_chave_secreta', {expiresIn: '1h'})

    const data = {
      success: true,
      message: "Login bem-sucedido",
      status: 200,
      data: token,
    };

    verifyTokenn(token)

    // Configurar o cabeçalho "Authorization" com o token
    reply.header('Authorization', `Bearer ${token}`);

    return reply.code(200).header('Authorization', `Bearer ${token}`).send(data)
  } catch (error) {
    return reply.code(500).send({success: false, message: 'Ocorreu um erro ao fazer login', error});
  }
}

export async function createUserHandler(
  request: FastifyRequest<{
    Body: CreateUserInput;
  }>
) {
  try {
    const {password, ...userData} = request.body;

    // Gerar um hash seguro para a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUsers({
      ...userData,
      password: hashedPassword,
    });
    const data = {
      success: true,
      message: "Usuário adicionado com sucesso!",
      status: 201,
      data: user,
    };
    return data;
  } catch (error) {
    const data = {
      success: false,
      message: "Ocorreu um erro ao criar o usuário",
      error: error,
      status: 500,
      data: null,
    };
    return data;
  }
}

export async function deleteUserHandler(
  request: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request?.params;

    await deleteUsers(id);
    return reply.code(204).send();
  } catch (error) {
    const data = {
      success: false,
      message: "Ocorreu um erro ao deletar o usuário",
      error: error,
      status: 500,
      data: null,
    };
    return reply.code(500).send(data);
  }
}
