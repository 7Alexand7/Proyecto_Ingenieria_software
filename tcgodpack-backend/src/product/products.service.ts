import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Product } from './product.model';

@Injectable()
export class ProductsService {
  private readonly dataDir = path.join(process.cwd(), 'data');
  private readonly filePath = path.join(this.dataDir, 'product.json');
  private writeQueue: Promise<void> = Promise.resolve();

  private async obtenerTodos(): Promise<Product[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data) as Product[];
    } catch {
      return [];
    }
  }

  private async doAtomicWrite(products: Product[]): Promise<void> {
    await fs.mkdir(this.dataDir, { recursive: true });
    const tmp = this.filePath + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(products, null, 2), 'utf-8');
    await fs.rename(tmp, this.filePath);
  }

  private enqueueWrite(products: Product[]): Promise<void> {
    this.writeQueue = this.writeQueue.then(
      () => this.doAtomicWrite(products),
      () => this.doAtomicWrite(products),
    );
    return this.writeQueue;
  }

  async obtenerTodosProductos(): Promise<Product[]> {
    return this.obtenerTodos();
  }

  async obtenerPorNumero(number: number): Promise<Product | undefined> {
    const productos = await this.obtenerTodos();
    return productos.find((producto) => producto.number === number);
  }

  async buscarPorNombre(name: string): Promise<Product[]> {
    const productos = await this.obtenerTodos();
    return productos.filter((producto) =>
      producto.name.toLowerCase().includes(name.toLowerCase()),
    );
  }

  async crearProducto(product: Product): Promise<Product> {
    const name = String(product.name ?? '').trim();
    const number = Number(product.number);
    const price = Number(product.price);
    const available = Number(product.available);
    const imageUrl = String(product.imageUrl ?? '').trim();

    if (!name) throw new Error('name is required');
    if (!Number.isFinite(number) || number <= 0)
      throw new Error('number must be a positive number');
    if (!Number.isFinite(price) || price < 0)
      throw new Error('price must be a non-negative number');
    if (!Number.isFinite(available) || available < 0)
      throw new Error('available must be a non-negative number');
    if (!imageUrl) throw new Error('imageUrl is required');

    const productos = await this.obtenerTodos();
    if (productos.some((item) => item.number === number)) {
      throw new Error('A product with that number already exists');
    }

    const nuevoProducto = new Product(
      name,
      Math.floor(number),
      price,
      Math.floor(available),
      imageUrl,
    );

    productos.push(nuevoProducto);
    await this.enqueueWrite(productos);
    return nuevoProducto;
  }
}
