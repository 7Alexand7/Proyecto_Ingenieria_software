import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';

interface Product {
  name: string;
  number: number;
  price: number;
  available: number;
  imageUrl: string;
}

@Component({
  selector: 'app-catalog-list-page',
  standalone: true,
  imports: [],
  templateUrl: './catalog-list-page.html',
  styleUrl: './catalog-list-page.css',
})
export class CatalogListPage implements OnInit {
  products = signal<Product[]>([]);
  currentUser = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser.set(this.authService.getCurrentUser());

    this.http.get<Product[]>('http://localhost:3000/products').subscribe({
      next: (data) => {
        this.products.set(data);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
      }
    });
  }
}
