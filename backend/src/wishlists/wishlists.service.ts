import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { User } from 'src/users/entities/user.entity';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async create(
    createWishlistDto: CreateWishlistDto,
    user: User,
  ): Promise<Wishlist> {
    const items = await this.wishRepository.find({
      where: {
        id: In(createWishlistDto.itemsId),
        owner: { id: user.id },
      },
    });

    if (items.length !== createWishlistDto.itemsId.length) {
      throw new BadRequestException(
        'Некоторые из выбранных пожеланий не принадлежат пользователю',
      );
    }

    const wishlist = this.wishlistRepository.create({
      owner: user,
      name: createWishlistDto.name,
      image: createWishlistDto.image,
      items,
    });
    await this.wishlistRepository.save(wishlist);
    return wishlist;
  }

  async findOne(id: number): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        items: true,
      },
    });

    if (!wishlist) {
      throw new NotFoundException('Такого списка не существует');
    }

    return wishlist;
  }

  findAll(): Promise<Wishlist[]> {
    return this.wishlistRepository.find({
      relations: {
        owner: true,
        items: true,
      },
    });
  }

  async updateOne(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    user: User,
  ): Promise<Wishlist> {
    const wishlist = await this.findOne(id);

    if (!wishlist) {
      throw new NotFoundException('Такого списка не существует');
    }

    if (wishlist.owner.id !== user.id) {
      throw new BadRequestException('Недостаточно прав');
    }

    const items = updateWishlistDto.itemsId?.length
      ? await this.wishRepository.find({
          where: { id: In(updateWishlistDto.itemsId) },
        })
      : [];
    return await this.wishlistRepository.save({
      ...wishlist,
      name: updateWishlistDto.name,
      image: updateWishlistDto.image,
      items: items.length === 0 ? wishlist.items : items,
    });
  }

  async removeOne(id: number, user: User): Promise<Wishlist> {
    const wishlist = await this.findOne(id);

    if (!wishlist) {
      throw new NotFoundException('Такого списка не существует');
    }

    if (wishlist.owner.id !== user.id) {
      throw new BadRequestException('Недостаточно прав');
    }

    await this.wishlistRepository.delete(id);
    return wishlist;
  }
}
