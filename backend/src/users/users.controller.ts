import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { WishesService } from 'src/wishes/wishes.service';
import { PasswordService } from 'src/password/password.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { User } from './entities/user.entity';
import { PasswordInterceptor } from 'src/interceptors/password.interceptor';
@UseInterceptors(PasswordInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
    private readonly passwordService: PasswordService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch('me')
  async updateMe(
    @Req() req: { user: User },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if ('password' in updateUserDto) {
      updateUserDto.password = await this.passwordService.hashPassword(
        updateUserDto.password,
      );
    }

    return this.usersService.updateOne(req.user.id, updateUserDto);
  }

  @Patch(':id')
  updateOne(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateOne(+id, updateUserDto);
  }

  @Delete(':id')
  removeOne(@Param('id') id: string) {
    return this.usersService.removeOne(+id);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  findMe(@Req() req: { user: User }) {
    return req.user;
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.usersService.findOneByUsername(username);
  }

  @Get('me/wishes')
  async findMeWishes(@Req() req: { user: User }) {
    return this.wishesService.findUserWishes(req.user);
  }

  @Get(':username/wishes')
  async findOneWithWishes(@Param('username') username: string) {
    const user = await this.usersService.findOneByUsername(username);
    return this.wishesService.findUserWishes(user);
  }

  @Post('find')
  async find(@Body() body: { query: string }) {
    return this.usersService.findManyByQuery(body.query);
  }
}
