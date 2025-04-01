import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { User } from 'src/users/entities/user.entity';
import { UpdateOfferDto } from './dto/update-offer.dto';
@Injectable()
export class OffersService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async create(createOfferDto: CreateOfferDto, user: User): Promise<Offer> {
    const wish = await this.wishRepository.findOne({
      where: { id: createOfferDto.itemId },
      relations: {
        owner: true,
      },
    });

    if (!wish) {
      throw new NotFoundException('Такого подарка не существует');
    }

    if (wish.owner.id === user.id) {
      throw new BadRequestException('Нельзя скинуться на свои подарки');
    }

    const raised = +wish.raised + +createOfferDto.amount;

    if (raised > wish.price) {
      throw new BadRequestException('Слишком большая сумма');
    }

    wish.raised = raised;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const insertedOffer = await queryRunner.manager.insert(Offer, {
        amount: createOfferDto.amount,
        hidden: createOfferDto.hidden,
        user,
        item: wish,
      });
      await queryRunner.manager.save(wish);
      await queryRunner.commitTransaction();
      return await this.findOne(insertedOffer.identifiers[0].id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new Error('Что-то пошло не так');
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: number): Promise<Offer | undefined> {
    const offer = await this.offerRepository.findOne({ where: { id } });
    if (!offer) {
      throw new NotFoundException('Такого предложения не существует');
    }
    return offer;
  }

  async findAll(): Promise<Offer[]> {
    return await this.offerRepository.find();
  }

  async updateOne(id: number, updateOfferDto: UpdateOfferDto): Promise<Offer> {
    await this.offerRepository.update(id, updateOfferDto);
    return await this.offerRepository.findOne({ where: { id } });
  }

  async removeOne(id: number): Promise<void> {
    await this.offerRepository.delete(id);
  }
}
