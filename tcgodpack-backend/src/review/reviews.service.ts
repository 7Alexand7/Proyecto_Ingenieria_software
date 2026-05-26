import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Review } from './review.model';

@Injectable()
export class ReviewsService {
  private readonly dataDir = path.join(process.cwd(), 'data');
  private readonly filePath = path.join(this.dataDir, 'reviews.json');
  private writeQueue: Promise<void> = Promise.resolve();

  private async obtenerTodas(): Promise<Review[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data) as Review[];
    } catch {
      return [];
    }
  }

  private async doAtomicWrite(reviews: Review[]): Promise<void> {
    await fs.mkdir(this.dataDir, { recursive: true });
    const tmp = this.filePath + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(reviews, null, 2), 'utf-8');
    await fs.rename(tmp, this.filePath);
  }

  private enqueueWrite(reviews: Review[]): Promise<void> {
    this.writeQueue = this.writeQueue.then(
      () => this.doAtomicWrite(reviews),
      () => this.doAtomicWrite(reviews),
    );
    return this.writeQueue;
  }

  async obtenerTodasReviews(): Promise<Review[]> {
    return this.obtenerTodas();
  }

  async obtenerPorProducto(productName: string): Promise<Review[]> {
    const reviews = await this.obtenerTodas();
    return reviews.filter(
      (review) => review.productName.toLowerCase() === productName.toLowerCase(),
    );
  }

  async obtenerPorUsuario(username: string): Promise<Review[]> {
    const reviews = await this.obtenerTodas();
    return reviews.filter(
      (review) => review.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async crearReview(review: Review): Promise<Review> {
    const productName = String(review.productName ?? '').trim();
    const username = String(review.username ?? '').trim();
    const comment = String(review.comment ?? '').trim();
    const rating = Number(review.rating);

    if (!productName) throw new Error('productName is required');
    if (!username) throw new Error('username is required');
    if (!comment) throw new Error('comment is required');
    if (!Number.isFinite(rating) || rating < 1 || rating > 5)
      throw new Error('rating must be a number between 1 and 5');

    const nuevaReview = new Review(productName, username, comment, rating);
    const reviews = await this.obtenerTodas();
    reviews.push(nuevaReview);
    await this.enqueueWrite(reviews);
    return nuevaReview;
  }
}
