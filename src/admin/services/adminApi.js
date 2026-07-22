import { API_BASE } from '../../config/api';

// 真实管理接口是默认数据源；仅显式设置为 true 时才启用演示数据回退。
const DEMO_ENABLED = process.env.REACT_APP_ADMIN_DEMO_MODE === 'true';
const DEMO_KEY = 'bookstore_admin_demo_v1';

const seed = {
  books: [
    { id: 1, title: '百年孤独', author: '加西亚·马尔克斯', isbn: '9787532738374', category_name: '文学', price: 59, stock: 18, sale: 326, status: 1, cover_url: '' },
    { id: 2, title: '三体', author: '刘慈欣', isbn: '9787536692930', category_name: '科幻', price: 46, stock: 7, sale: 518, status: 1, cover_url: '' },
    { id: 3, title: '人类简史', author: '尤瓦尔·赫拉利', isbn: '9787508647357', category_name: '历史', price: 68, stock: 0, sale: 241, status: 0, cover_url: '' },
    { id: 4, title: '深入理解计算机系统', author: 'Randal E. Bryant', isbn: '9787111544937', category_name: '计算机', price: 139, stock: 26, sale: 164, status: 1, cover_url: '' }
  ],
  categories: [
    { id: 1, name: '文学', icon: '📖', book_count: 12, sort: 10, is_active: true },
    { id: 2, name: '科幻', icon: '🚀', book_count: 8, sort: 20, is_active: true },
    { id: 3, name: '历史', icon: '📜', book_count: 6, sort: 30, is_active: true },
    { id: 4, name: '计算机', icon: '💻', book_count: 9, sort: 40, is_active: true }
  ],
  orders: [
    { id: 1001, order_no: 'BX202607200001', username: 'lin', total_amount: 118, status: 1, item_count: 2, created_at: '2026-07-20T09:18:00+08:00' },
    { id: 1002, order_no: 'BX202607200002', username: 'momo', total_amount: 46, status: 0, item_count: 1, created_at: '2026-07-20T10:42:00+08:00' },
    { id: 1003, order_no: 'BX202607190008', username: 'reader88', total_amount: 207, status: 2, item_count: 3, created_at: '2026-07-19T18:24:00+08:00' }
  ],
  users: [
    { id: 1, username: 'admin', email: 'admin@boxue.test', phone: '13800000001', is_admin: true, created_at: '2026-06-01T08:00:00+08:00' },
    { id: 2, username: 'lin', email: 'lin@example.com', phone: '13800000002', is_admin: false, created_at: '2026-06-18T12:30:00+08:00' },
    { id: 3, username: 'momo', email: 'momo@example.com', phone: '13800000003', is_admin: false, created_at: '2026-07-02T16:10:00+08:00' }
  ],
  carousel: [
    { id: 1, title: '盛夏阅读季', description: '精选好书，陪你度过悠长夏日', image_url: '', link_url: '/', sort_order: 10, is_active: true },
    { id: 2, title: '科幻新世界', description: '探索想象力的边界', image_url: '', link_url: '/category/科幻', sort_order: 20, is_active: true }
  ]
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const readDemo = () => {
  try {
    const saved = localStorage.getItem(DEMO_KEY);
    return saved ? { ...clone(seed), ...JSON.parse(saved) } : clone(seed);
  } catch {
    return clone(seed);
  }
};

const writeDemo = (data) => localStorage.setItem(DEMO_KEY, JSON.stringify(data));

const request = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.code !== 0) {
    throw new Error(payload.message || `请求失败（${response.status}）`);
  }
  return payload.data;
};

const fallback = async (real, demo) => {
  try {
    return { data: await real(), isDemo: false };
  } catch (error) {
    if (!DEMO_ENABLED) throw error;
    return { data: demo(), isDemo: true, warning: error.message };
  }
};

const normalizeList = (value, key) => {
  if (Array.isArray(value)) return value;
  return value?.[key] || value?.items || value?.list || [];
};

const demoList = (key, filters = {}) => {
  let items = readDemo()[key] || [];
  const keyword = (filters.keyword || '').trim().toLowerCase();
  if (keyword) {
    items = items.filter((item) => JSON.stringify(item).toLowerCase().includes(keyword));
  }
  if (filters.status !== '' && filters.status !== undefined) {
    if (key === 'categories' || key === 'carousel') {
      items = items.filter((item) => String(item.is_active) === String(filters.status));
    } else {
      items = items.filter((item) => String(item.status) === String(filters.status));
    }
  }
  return clone(items);
};

const demoSave = (key, item) => {
  const data = readDemo();
  const list = data[key] || [];
  if (item.id) {
    data[key] = list.map((current) => current.id === item.id ? { ...current, ...item } : current);
  } else {
    const nextId = Math.max(0, ...list.map((current) => Number(current.id))) + 1;
    data[key] = [{ ...item, id: nextId }, ...list];
  }
  writeDemo(data);
  return clone(item.id ? data[key].find((current) => current.id === item.id) : data[key][0]);
};

const demoUpdate = (key, id, patch) => demoSave(key, { id, ...patch });

const adminApi = {
  dashboard: () => fallback(
    () => request('/admin/dashboard'),
    () => {
      const data = readDemo();
      const paidOrders = data.orders.filter((order) => order.status === 1);
      return {
        book_count: data.books.length,
        user_count: data.users.length,
        order_count: data.orders.length,
        revenue: paidOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
        low_stock_count: data.books.filter((book) => book.stock < 10).length,
        pending_order_count: data.orders.filter((order) => order.status === 0).length,
        recent_orders: data.orders.slice(0, 5),
        top_books: [...data.books].sort((a, b) => b.sale - a.sale).slice(0, 5),
        sales_trend: [32, 48, 41, 63, 58, 72, 86]
      };
    }
  ),
  books: (filters = {}) => fallback(
    () => request(`/admin/books?keyword=${encodeURIComponent(filters.keyword || '')}&status=${filters.status ?? ''}`),
    () => demoList('books', filters)
  ).then((result) => ({ ...result, data: normalizeList(result.data, 'books') })),
  saveBook: (book) => fallback(
    () => request(book.id ? `/admin/books/${book.id}` : '/admin/books', { method: book.id ? 'PUT' : 'POST', body: JSON.stringify(book) }),
    () => demoSave('books', book)
  ),
  setBookStatus: (id, status) => fallback(
    () => request(`/admin/books/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    () => demoUpdate('books', id, { status })
  ),
  categories: (filters = {}) => fallback(
    () => request('/admin/categories'),
    () => demoList('categories', filters)
  ).then((result) => ({ ...result, data: normalizeList(result.data, 'categories') })),
  saveCategory: (category) => fallback(
    () => request(category.id ? `/admin/categories/${category.id}` : '/admin/categories', { method: category.id ? 'PUT' : 'POST', body: JSON.stringify(category) }),
    () => demoSave('categories', category)
  ),
  setCategoryStatus: (id, is_active) => fallback(
    () => request(`/admin/categories/${id}/status`, { method: 'PATCH', body: JSON.stringify({ is_active }) }),
    () => demoUpdate('categories', id, { is_active })
  ),
  orders: (filters = {}) => fallback(
    () => request(`/admin/orders?keyword=${encodeURIComponent(filters.keyword || '')}&status=${filters.status ?? ''}`),
    () => demoList('orders', filters)
  ).then((result) => ({ ...result, data: normalizeList(result.data, 'orders') })),
  setOrderStatus: (id, status) => fallback(
    () => request(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    () => demoUpdate('orders', id, { status })
  ),
  users: (filters = {}) => fallback(
    () => request(`/admin/users?keyword=${encodeURIComponent(filters.keyword || '')}`),
    () => demoList('users', filters)
  ).then((result) => ({ ...result, data: normalizeList(result.data, 'users') })),
  setUserAdmin: (id, is_admin) => fallback(
    () => request(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ is_admin }) }),
    () => demoUpdate('users', id, { is_admin })
  ),
  carousel: () => fallback(
    () => request('/admin/carousel'),
    () => demoList('carousel')
  ).then((result) => ({ ...result, data: normalizeList(result.data, 'carousel') })),
  saveCarousel: (item) => fallback(
    () => request(item.id ? `/admin/carousel/${item.id}` : '/admin/carousel', { method: item.id ? 'PUT' : 'POST', body: JSON.stringify(item) }),
    () => demoSave('carousel', item)
  ),
  setCarouselStatus: (id, is_active) => fallback(
    () => request(`/admin/carousel/${id}/status`, { method: 'PATCH', body: JSON.stringify({ is_active }) }),
    () => demoUpdate('carousel', id, { is_active })
  )
};

export default adminApi;
