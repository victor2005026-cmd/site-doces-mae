import CartPanel from './CartPanel';

export default function CartSidebar() {
  return (
    <aside className="sticky top-[88px] hidden h-fit max-h-[calc(100vh-104px)] flex-col overflow-hidden rounded-card border border-border-light bg-bg-main shadow-sm lg:flex">
      <CartPanel />
    </aside>
  );
}
