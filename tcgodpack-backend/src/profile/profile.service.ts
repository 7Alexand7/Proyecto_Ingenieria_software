import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Profile, UserRole } from './profile.model';

@Injectable()
export class ProfileService {
  private readonly dataDir = path.join(process.cwd(), 'data');
  private readonly filePath = path.join(this.dataDir, 'profile.json');
  private writeQueue: Promise<void> = Promise.resolve();

  private async obtenerTodos(): Promise<Profile[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data) as Profile[];
    } catch {
      return [];
    }
  }

  private async doAtomicWrite(usuarios: Profile[]): Promise<void> {
    await fs.mkdir(this.dataDir, { recursive: true });
    const tmp = this.filePath + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(usuarios, null, 2), 'utf-8');
    await fs.rename(tmp, this.filePath);
  }

  private enqueueWrite(usuarios: Profile[]): Promise<void> {
    this.writeQueue = this.writeQueue.then(
      () => this.doAtomicWrite(usuarios),
      () => this.doAtomicWrite(usuarios),
    );
    return this.writeQueue;
  }

  async obtenerTodosUsuarios(): Promise<Profile[]> {
    return this.obtenerTodos();
  }

  async obtenerPorUsuario(username: string): Promise<Profile | undefined> {
    const usuarios = await this.obtenerTodos();
    return usuarios.find((usuario) => usuario.username === username);
  }

  async crearUsuario(profile: Profile): Promise<Profile> {
    const username = String(profile.username ?? '').trim().toLowerCase();
    const password = String(profile.password ?? '').trim();
    const name = String(profile.name ?? '').trim();
    const role = profile.role ?? UserRole.CUSTOMER;
    const purchasedProducts = profile.purchasedProducts ?? [];

    if (!username) throw new Error('username is required');
    if (!password) throw new Error('password is required');
    if (!name) throw new Error('name is required');
    if (!Object.values(UserRole).includes(role))
      throw new Error('role must be admin or customer');

    const usuarios = await this.obtenerTodos();
    if (usuarios.some((usuario) => usuario.username === username)) {
      throw new Error('A user with that username already exists');
    }

    const nuevoUsuario = new Profile(
      username,
      password,
      name,
      role,
      purchasedProducts,
    );

    usuarios.push(nuevoUsuario);
    await this.enqueueWrite(usuarios);
    return nuevoUsuario;
  }
}
