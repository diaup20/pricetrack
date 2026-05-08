import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Category, Product, ExchangeRate, Unit, Package, Brand } from '../types';
import { OperationType, handleFirestoreError } from '../lib/utils';

interface DataContextType {
  categories: Category[];
  products: Product[];
  exchangeRates: ExchangeRate[];
  units: Unit[];
  packages: Package[];
  brands: Brand[];
  loading: boolean;
}

const DataContext = createContext<DataContextType>({
  categories: [],
  products: [],
  exchangeRates: [],
  units: [],
  packages: [],
  brands: [],
  loading: true,
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubCategories = onSnapshot(collection(db, 'categories'), 
      (s) => setCategories(s.docs.map(d => ({ id: d.id, ...d.data() } as Category))),
      (e) => handleFirestoreError(e, OperationType.LIST, 'categories')
    );

    const unsubProducts = onSnapshot(collection(db, 'products'), 
      (s) => setProducts(s.docs.map(d => ({ id: d.id, ...d.data() } as Product))),
      (e) => handleFirestoreError(e, OperationType.LIST, 'products')
    );

    const unsubRates = onSnapshot(collection(db, 'exchangeRates'), 
      (s) => setExchangeRates(s.docs.map(d => ({ id: d.id, ...d.data() } as ExchangeRate))),
      (e) => handleFirestoreError(e, OperationType.LIST, 'exchangeRates')
    );

    const unsubUnits = onSnapshot(collection(db, 'units'), 
      (s) => setUnits(s.docs.map(d => ({ id: d.id, ...d.data() } as Unit))),
      (e) => handleFirestoreError(e, OperationType.LIST, 'units')
    );

    const unsubPackages = onSnapshot(collection(db, 'packages'), 
      (s) => setPackages(s.docs.map(d => ({ id: d.id, ...d.data() } as Package))),
      (e) => handleFirestoreError(e, OperationType.LIST, 'packages')
    );

    const unsubBrands = onSnapshot(collection(db, 'brands'), 
      (s) => setBrands(s.docs.map(d => ({ id: d.id, ...d.data() } as Brand))),
      (e) => handleFirestoreError(e, OperationType.LIST, 'brands')
    );

    setLoading(false);

    return () => {
      unsubCategories();
      unsubProducts();
      unsubRates();
      unsubUnits();
      unsubPackages();
      unsubBrands();
    };
  }, []);

  return (
    <DataContext.Provider value={{ categories, products, exchangeRates, units, packages, brands, loading }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
