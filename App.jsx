import React, { useState, useEffect, createContext, useContext } from "react";

// SAMPLE PRODUCTS
const SAMPLE_PRODUCTS = [
  { id: "SR-001", title: "Handloom Silk Saree - Sunset", category: "saree", price: 79.0, currency: "USD", image: "https://images.unsplash.com/photo-1520975918318-3a4e6cd0f8f3", sizes: ["Free Size"], description: "Elegant handloom silk saree with a subtle zari border.", stock: 8 },
  { id: "SR-002", title: "Chiffon Floral Saree", category: "saree", price: 49.0, currency: "USD", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246", sizes: ["Free Size"], description: "Lightweight chiffon saree with an all-over floral print.", stock: 12 },
  { id: "KT-001", title: "Embroidered Kurti - Asha", category: "kurti", price: 29.0, currency: "USD", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c", sizes: ["S","M","L","XL"], description: "Comfortable cotton kurti with delicate embroidery.", stock: 25 },
  { id: "KT-002", title: "Summer Kurti - Mina", category: "kurti", price: 24.0, currency: "USD", image: "https://images.unsplash.com/photo-1520975681918-7a0f0b6e9b35", sizes: ["S","M","L"], description: "Breathable linen blend kurti for casual days.", stock: 18 },
  { id: "CD-001", title: "Co-ord Set - Breeze", category: "co-ords", price: 45.0, currency: "USD", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246", sizes: ["S","M","L"], description: "Relaxed co-ord set (top + pants) in soft fabric.", stock: 16 },
  { id: "CD-002", title: "Co-ord Set - Urban", category: "co-ords", price: 55.0, currency: "USD", image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f", sizes: ["S","M","L","XL"], description: "Chic co-ord set with tailored fit and modern lines.", stock: 9 },
];

// simple localStorage wrapper
const storage = {
  get(k, def){ try{ const r = localStorage.getItem(k); return r?JSON.parse(r):def }catch(e){return def} },
  set(k,v){ localStorage.setItem(k, JSON.stringify(v)) }
}

const ShopContext = createContext(null);
function useShop(){ return useContext(ShopContext); }

function ShopProvider({children}){
  const [products,setProducts] = useState(()=>storage.get('ft_products', SAMPLE_PRODUCTS));
  const [cart,setCart] = useState(()=>storage.get('ft_cart', {}));
  const [wishlist,setWishlist] = useState(()=>storage.get('ft_wishlist', []));
  const [orders,setOrders] = useState(()=>storage.get('ft_orders', []));

  useEffect(()=>storage.set('ft_products', products), [products]);
  useEffect(()=>storage.set('ft_cart', cart), [cart]);
  useEffect(()=>storage.set('ft_wishlist', wishlist), [wishlist]);
  useEffect(()=>storage.set('ft_orders', orders), [orders]);

  const addToCart = (id, opts={qty:1}) => {
    setCart(prev=>{ const c={...prev}; if(c[id]) c[id].qty+=opts.qty; else c[id]={qty:opts.qty}; return c });
  };
  const updateCartItem = (id, patch) => setCart(prev=>{ const c={...prev}; if(!c[id]) return prev; c[id]={...c[id],...patch}; if(c[id].qty<=0) delete c[id]; return c });
  const removeFromCart = id => setCart(prev=>{ const c={...prev}; delete c[id]; return c });
  const toggleWishlist = id => setWishlist(prev=> prev.includes(id)? prev.filter(p=>p!==id) : [...prev, id]);
  const placeOrder = (order) => {
    setProducts(prev=> prev.map(p=>{ const o = order.items.find(it=>it.id===p.id); if(!o) return p; return {...p, stock: Math.max(0, p.stock - o.qty)} }));
    setOrders(prev=>[order,...prev]); setCart({}); return true;
  };

  return <ShopContext.Provider value={{products,cart,wishlist,orders,addToCart,updateCartItem,removeFromCart,toggleWishlist,placeOrder}}>{children}</ShopContext.Provider>;
}

// small UI helpers
function Badge({children}){ return <span className="inline-block badge-peach text-xs px-2 py-0.5 rounded-full">{children}</span> }

export default function App(){
  return <ShopProvider><Main /></ShopProvider>
}

function Main(){
  const [route,setRoute] = useState({page:'home', meta:{}});

  useEffect(()=>{
    const onHash = ()=>{ const hash = location.hash.replace(/^#/,''); if(!hash) return setRoute({page:'home',meta:{}}); const [p, param] = hash.split('/'); if(p==='category') setRoute({page:'category',meta:{category:param}}); else if(p==='product') setRoute({page:'product',meta:{id:param}}); else if(p==='cart') setRoute({page:'cart',meta:{}}); else if(p==='wishlist') setRoute({page:'wishlist',meta:{}}); else if(p==='checkout') setRoute({page:'checkout',meta:{}}); else setRoute({page:'home',meta:{}}) };
    onHash(); window.addEventListener('hashchange', onHash); return ()=> window.removeEventListener('hashchange', onHash);
  },[]);

  return (
    <div className="min-h-screen bg-[#FFE5D9] text-[#5A3E36]">
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        {route.page==='home' && <Home />}
        {route.page==='category' && <CategoryView category={route.meta.category} />}
        {route.page==='product' && <ProductDetail id={route.meta.id} />}
        {route.page==='cart' && <CartView />}
        {route.page==='wishlist' && <WishlistView />}
        {route.page==='checkout' && <CheckoutView />}
      </div>
      <Footer />
    </div>
  )
}

function Header(){
  const {cart,wishlist} = useShop();
  const cartCount = Object.values(cart).reduce((s,it)=>s + it.qty, 0);
  return (
    <header className="bg-white shadow sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-6">
          <a href="#" className="text-2xl font-extrabold">Fabric Theory</a>
          <nav className="hidden md:flex gap-4 text-sm text-[#5A3E36]">
            <a href="#category/saree" className="hover:underline">Saree</a>
            <a href="#category/kurti" className="hover:underline">Kurti</a>
            <a href="#category/co-ords" className="hover:underline">Co-ords</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <a href="#wishlist" className="relative">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M20.8 4.6a4.5 4.5 0 00-6.4 0L12 7l-2.4-2.4a4.5 4.5 0 10-6.4 6.4L12 22l8.8-11a4.5 4.5 0 000-6.4z" /></svg>
            {wishlist.length>0 && <Badge>{wishlist.length}</Badge>}
          </a>
          <a href="#cart" className="relative">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4" /><circle cx="7" cy="20" r="1" /><circle cx="20" cy="20" r="1" /></svg>
            {cartCount>0 && <Badge>{cartCount}</Badge>}
          </a>
        </div>
      </div>
    </header>
  )
}

function Footer(){ return <footer className="bg-white border-t mt-12"><div className="max-w-7xl mx-auto p-6 text-sm text-[#5A3E36] text-center">© {new Date().getFullYear()} Fabric Theory — Made with care</div></footer> }

function Home(){
  const {products} = useShop();
  const featured = products.slice(0,4);
  return (
    <div>
      <section className="grid md:grid-cols-2 gap-8 items-center bg-white rounded-xl p-8 shadow">
        <div>
          <h2 className="text-4xl font-bold">Fabric Theory</h2>
          <p className="mt-4 text-[#5A3E36]">Curated textiles — sarees, kurtis and co-ords made with love. Shop conscious fashion crafted for everyday and special moments.</p>
          <div className="mt-6">
            <a href="#category/saree" className="inline-block rounded-full px-4 py-2 border">Shop Sarees</a>
            <a href="#category/kurti" className="inline-block ml-3 rounded-full px-4 py-2 btn-peach">Shop Kurtis</a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {featured.map(p=>(
            <a key={p.id} href={`#product/${p.id}`} className="block rounded-xl overflow-hidden shadow">
              <img src={p.image} alt={p.title} className="w-full h-44 object-cover" />
            </a>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Explore Categories</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Saree", link: "saree", desc: "Traditional & handloom sarees" },
            { name: "Kurti", link: "kurti", desc: "Everyday kurtis and tops" },
            { name: "Co-ords", link: "co-ords", desc: "Co-ordinate sets for easy styling" },
          ].map((c)=>(
            <a key={c.link} href={`#category/${c.link}`} className="p-6 bg-white rounded-xl shadow hover:shadow-lg">
              <h4 className="font-semibold">{c.name}</h4>
              <p className="text-sm text-[#5A3E36]">{c.desc}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-xl font-semibold mb-4">New Arrivals</h3>
        <ProductGrid />
      </section>
    </div>
  )
}

function CategoryView({category}){
  const {products} = useShop();
  const list = products.filter(p=>p.category===category);
  return (<div><h2 className="text-2xl font-bold capitalize">{category}</h2><p className="text-sm text-[#5A3E36] mt-1">{list.length} items</p><div className="mt-6"><ProductGrid products={list} /></div></div>)
}

function ProductDetail({id}){
  const {products, addToCart, toggleWishlist, wishlist} = useShop();
  const product = products.find(p=>p.id===id); if(!product) return <div>Product not found</div>;
  const inWishlist = wishlist.includes(id);
  return (
    <div className="grid md:grid-cols-2 gap-8 bg-white p-6 rounded-xl shadow">
      <div><img src={product.image} alt={product.title} className="w-full h-96 object-cover rounded-xl" /></div>
      <div>
        <h1 className="text-2xl font-bold">{product.title}</h1>
        <p className="text-[#FF8A65] font-semibold mt-2">{product.currency} {product.price.toFixed(2)}</p>
        <p className="text-sm text-[#5A3E36] mt-4">{product.description}</p>
        <p className="mt-4 text-sm">Stock: {product.stock}</p>
        <div className="mt-6 flex items-center gap-3">
          <button onClick={()=>addToCart(product.id,{qty:1})} className="px-4 py-2 btn-peach rounded">Add to cart</button>
          <button onClick={()=>toggleWishlist(product.id)} className="px-4 py-2 border rounded">{inWishlist?"Remove":"Add to wishlist"}</button>
        </div>
      </div>
    </div>
  )
}

function ProductGrid({products:maybe}){
  const {products, addToCart, toggleWishlist, wishlist} = useShop(); const list = maybe||products;
  return (<div className="grid md:grid-cols-3 gap-6">{list.map(p=>(
    <div key={p.id} className="bg-white rounded-xl p-4 shadow hover:shadow-md">
      <a href={`#product/${p.id}`}><img src={p.image} alt={p.title} className="w-full h-44 object-cover rounded" /></a>
      <div className="mt-3 flex justify-between items-start">
        <div><h4 className="font-semibold">{p.title}</h4><p className="text-sm text-[#5A3E36]">{p.currency} {p.price.toFixed(2)}</p></div>
        <div className="flex flex-col items-end gap-2"><button title="Add to cart" onClick={()=>addToCart(p.id,{qty:1})} className="px-3 py-1 rounded btn-peach text-sm">Add</button><button title="Wishlist" onClick={()=>toggleWishlist(p.id)} className="px-2 py-1 border rounded text-sm">{wishlist.includes(p.id)?"❤":"♡"}</button></div>
      </div>
    </div>
  ))}</div>)
}

function CartView(){
  const {cart, products, updateCartItem, removeFromCart} = useShop();
  const items = Object.entries(cart).map(([id,meta])=>({...products.find(p=>p.id===id), qty: meta.qty}));
  const subtotal = items.reduce((s,it)=>s + (it.price||0)*it.qty,0);
  return (<div className="bg-white p-6 rounded-xl shadow"><h2 className="text-2xl font-bold">Your Cart</h2>{items.length===0? <p className="mt-4 text-[#5A3E36]">Your cart is empty. <a href="#" className="text-[#FF8A65]">Shop now</a></p> : <div className="mt-4 grid gap-4">{items.map(it=>(<div key={it.id} className="flex items-center gap-4 border-b pb-4"><img src={it.image} alt={it.title} className="w-24 h-24 object-cover rounded" /><div className="flex-1"><h4 className="font-semibold">{it.title}</h4><p className="text-sm text-[#5A3E36]">{it.currency} {it.price.toFixed(2)}</p><div className="mt-2 flex items-center gap-2"><button onClick={()=>updateCartItem(it.id,{qty:it.qty-1})} className="px-2 py-1 border rounded">-</button><span>{it.qty}</span><button onClick={()=>updateCartItem(it.id,{qty:it.qty+1})} className="px-2 py-1 border rounded">+</button></div></div><div className="text-right"><p className="font-semibold">{it.currency} {(it.price*it.qty).toFixed(2)}</p><button onClick={()=>removeFromCart(it.id)} className="text-sm mt-2 text-red-600">Remove</button></div></div>))}<div className="text-right"><p className="text-lg font-semibold">Subtotal: USD {subtotal.toFixed(2)}</p><a href="#checkout" className="inline-block mt-3 px-4 py-2 btn-peach rounded">Proceed to checkout</a></div></div>}</div>)
}

function WishlistView(){ const {wishlist, products, addToCart, toggleWishlist} = useShop(); const list = wishlist.map(id=>products.find(p=>p.id===id)).filter(Boolean); return (<div className="bg-white p-6 rounded-xl shadow"><h2 className="text-2xl font-bold">Your Wishlist</h2>{list.length===0? <p className="mt-4 text-[#5A3E36]">No items yet — add things you love to your wishlist.</p> : <div className="mt-4 grid md:grid-cols-3 gap-4">{list.map(p=> (<div key={p.id} className="p-4 border rounded"><img src={p.image} alt={p.title} className="w-full h-40 object-cover rounded" /><h4 className="mt-2 font-semibold">{p.title}</h4><p className="text-sm">{p.currency} {p.price.toFixed(2)}</p><div className="mt-2 flex gap-2"><button onClick={()=>addToCart(p.id,{qty:1})} className="px-3 py-1 btn-peach text-white rounded">Add to cart</button><button onClick={()=>toggleWishlist(p.id)} className="px-3 py-1 border rounded">Remove</button></div></div>))}</div>}</div>) }

function CheckoutView(){
  const {cart, products, placeOrder} = useShop();
  const items = Object.entries(cart).map(([id,meta])=>({...products.find(p=>p.id===id), qty: meta.qty}));
  const subtotal = items.reduce((s,it)=>s + (it.price||0)*it.qty,0);
  const [shipping,setShipping] = useState({name:'',address:'',city:'',email:''});
  const [loading,setLoading] = useState(false);
  const [success,setSuccess] = useState(null);
  const place = ()=>{ if(!shipping.name||!shipping.address||!shipping.city||!shipping.email) return alert('Please fill shipping details'); setLoading(true); setTimeout(()=>{ const order = { id: `ORD-${Date.now()}`, date: new Date().toISOString(), items, total: subtotal, shipping }; placeOrder(order); setLoading(false); setSuccess(order); },800) }
  if(items.length===0 && !success) return <div className="bg-white p-6 rounded-xl shadow">Your cart is empty.</div>;
  if(success) return (<div className="bg-white p-6 rounded-xl shadow"><h2 className="text-2xl font-bold">Order placed</h2><p className="mt-2">Thank you — your order <strong>{success.id}</strong> has been placed.</p><p className="mt-2 text-sm">We sent a confirmation to {success.shipping.email}.</p></div>);
  return (<div className="bg-white p-6 rounded-xl shadow grid md:grid-cols-2 gap-6"><div><h3 className="font-semibold text-lg">Shipping details</h3><div className="mt-4 grid gap-3"><input value={shipping.name} onChange={e=>setShipping({...shipping,name:e.target.value})} placeholder="Full name" className="border rounded px-3 py-2" /><input value={shipping.email} onChange={e=>setShipping({...shipping,email:e.target.value})} placeholder="Email" className="border rounded px-3 py-2" /><input value={shipping.address} onChange={e=>setShipping({...shipping,address:e.target.value})} placeholder="Address" className="border rounded px-3 py-2" /><input value={shipping.city} onChange={e=>setShipping({...shipping,city:e.target.value})} placeholder="City" className="border rounded px-3 py-2" /></div><div className="mt-4"><button onClick={place} disabled={loading} className="px-4 py-2 btn-peach rounded">{loading? 'Placing order...' : `Place order — USD ${subtotal.toFixed(2)}`}</button></div></div><div><h3 className="font-semibold text-lg">Order summary</h3><div className="mt-4 grid gap-3">{items.map(it=>(<div key={it.id} className="flex justify-between"><div><div className="font-semibold">{it.title}</div><div className="text-sm text-[#5A3E36]">Qty {it.qty}</div></div><div className="font-semibold">USD {(it.price*it.qty).toFixed(2)}</div></div>))}<div className="border-t pt-3 text-right font-semibold">Total: USD {subtotal.toFixed(2)}</div></div></div></div>)
}
