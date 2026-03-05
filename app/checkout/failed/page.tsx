import Link from "next/link";

interface CheckoutFailedPageProps {
  searchParams: Promise<{
    order?: string;
  }>;
}

export default async function CheckoutFailedPage({
  searchParams,
}: CheckoutFailedPageProps) {
  const { order } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center md:px-8">
      <div className="editorial-panel w-full rounded-2xl p-8 md:p-10">
        <p className="font-ui text-xs tracking-[0.16em] text-ember">PAYMENT FAILED</p>
        <h1 className="mt-3 font-title text-5xl text-ivory">Payment Could Not Be Processed</h1>
        <p className="mt-4 font-body text-lg text-stone">
          Your payment was not completed. You can retry checkout or return to the catalog.
        </p>
        {order ? <p className="mt-3 font-mono text-xs text-stone">Order reference: {order}</p> : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/checkout"
            className="fx-button rounded-full border border-gold bg-gold px-6 py-3 font-ui text-xs tracking-[0.16em] text-void transition hover:bg-gold-dim"
          >
            RETRY CHECKOUT
          </Link>
          <Link
            href="/books"
            className="fx-button rounded-full border border-smoke bg-obsidian px-6 py-3 font-ui text-xs tracking-[0.16em] text-parchment transition hover:border-gold hover:text-gold"
          >
            BROWSE BOOKS
          </Link>
        </div>
      </div>
    </div>
  );
}
