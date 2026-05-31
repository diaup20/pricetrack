import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Category, Product, ExchangeRate, Unit, Package, Brand, ReportMeta, Governorate, District, Section, Review, AppVisit, AppNotification } from '../types';
import { OperationType, handleFirestoreError } from '../lib/utils';

interface DataContextType {
  sections: Section[];
  categories: Category[];
  products: Product[];
  exchangeRates: ExchangeRate[];
  units: Unit[];
  packages: Package[];
  brands: Brand[];
  reportTypes: ReportMeta[];
  governorates: Governorate[];
  districts: District[];
  reviews: Review[];
  visits: AppVisit[];
  notifications: AppNotification[];
  loading: boolean;
}

const DataContext = createContext<DataContextType>({
  sections: [],
  categories: [],
  products: [],
  exchangeRates: [],
  units: [],
  packages: [],
  brands: [],
  reportTypes: [],
  governorates: [],
  districts: [],
  reviews: [],
  visits: [],
  notifications: [],
  loading: true,
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [sections, setSections] = useState<Section[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [reportTypes, setReportTypes] = useState<ReportMeta[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [visits, setVisits] = useState<AppVisit[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubSections = onSnapshot(collection(db, 'sections'), 
      (s) => setSections(s.docs.map(d => ({ id: d.id, ...d.data() } as Section)).sort((a,b) => {
        const orderA = a.order !== undefined && a.order !== null ? Number(a.order) : 9999;
        const orderB = b.order !== undefined && b.order !== null ? Number(b.order) : 9999;
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name, 'ar');
      })),
      (e) => handleFirestoreError(e, OperationType.LIST, 'sections')
    );

    const unsubCategories = onSnapshot(collection(db, 'categories'), 
      (s) => setCategories(s.docs.map(d => ({ id: d.id, ...d.data() } as Category)).sort((a,b) => {
        const orderA = a.order !== undefined && a.order !== null ? Number(a.order) : 9999;
        const orderB = b.order !== undefined && b.order !== null ? Number(b.order) : 9999;
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name, 'ar');
      })),
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

    const unsubReportTypes = onSnapshot(collection(db, 'report_types'), 
      (s) => setReportTypes(s.docs.map(d => ({ id: d.id, ...d.data() } as ReportMeta))),
      (e) => handleFirestoreError(e, OperationType.LIST, 'report_types')
    );

    const unsubGovernorates = onSnapshot(collection(db, 'governorates'), 
      (s) => setGovernorates(s.docs.map(d => ({ id: d.id, ...d.data() } as Governorate))),
      (e) => handleFirestoreError(e, OperationType.LIST, 'governorates')
    );

    const unsubDistricts = onSnapshot(collection(db, 'districts'), 
      (s) => setDistricts(s.docs.map(d => ({ id: d.id, ...d.data() } as District))),
      (e) => handleFirestoreError(e, OperationType.LIST, 'districts')
    );

    const unsubReviews = onSnapshot(collection(db, 'reviews'), 
      (s) => setReviews(s.docs.map(d => ({ id: d.id, ...d.data() } as Review))),
      (e) => handleFirestoreError(e, OperationType.LIST, 'reviews')
    );

    const unsubVisits = onSnapshot(collection(db, 'visits'), 
      (s) => setVisits(s.docs.map(d => ({ id: d.id, ...d.data() } as AppVisit))),
      (e) => handleFirestoreError(e, OperationType.LIST, 'visits')
    );

    const unsubNotifications = onSnapshot(collection(db, 'notifications'), 
      (s) => setNotifications(s.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification)).sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      })),
      (e) => handleFirestoreError(e, OperationType.LIST, 'notifications')
    );

    setLoading(false);

    return () => {
      unsubSections();
      unsubCategories();
      unsubProducts();
      unsubRates();
      unsubUnits();
      unsubPackages();
      unsubBrands();
      unsubReportTypes();
      unsubGovernorates();
      unsubDistricts();
      unsubReviews();
      unsubVisits();
      unsubNotifications();
    };
  }, []);

  return (
    <DataContext.Provider value={{ sections, categories, products, exchangeRates, units, packages, brands, reportTypes, governorates, districts, reviews, visits, notifications, loading }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
