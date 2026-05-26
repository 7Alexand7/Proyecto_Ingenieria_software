import { Body, Controller, Get, NotFoundException, Post, Query } from '@nestjs/common';
import { Profile } from './profile.model';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post('register')
  async crearUsuario(@Body() perfil: Profile): Promise<Profile> {
    return this.profileService.crearUsuario(perfil);
  }

  @Get()
  async obtenerPorUsuario(
    @Query('username') username: string,
  ): Promise<Profile> {
    const usuario = await this.profileService.obtenerPorUsuario(username);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }
}
