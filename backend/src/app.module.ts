import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./users/users.module";
import { WishesModule } from "./wishes/wishes.module";
import { WishlistsModule } from "./wishlists/wishlists.module";
import { OffersModule } from "./offers/offers.module";
import { User } from "./users/entities/user.entity";
import { Offer } from "./offers/entities/offer.entity";
import { Wish } from "./wishes/entities/wish.entity";
import { Wishlist } from "./wishlists/entities/wishlist.entity";
import { AuthModule } from "./auth/auth.module";

const {
  POSTGRES_HOST = "database",
  POSTGRES_PORT,
  POSTGRES_USER = "postgres",
  POSTGRES_PASSWORD = "123qweQWE",
  POSTGRES_DB = "postgres",
} = process.env;

console.log(POSTGRES_PASSWORD);

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: POSTGRES_HOST,
      port: parseInt(POSTGRES_PORT, 10) || 5432,
      username: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      database: POSTGRES_DB,
      entities: [User, Offer, Wish, Wishlist],
      synchronize: true,
    }),
    UsersModule,
    WishesModule,
    WishlistsModule,
    OffersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
