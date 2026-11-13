import Link from "next/link";
import BackgroundPaths from "@/components/kokonutui/background-paths";
import SiteLayout from "@/components/site/SiteLayout";

export default function AuthLayout({ title, description, path, heading, intro, children, footer }) {
  return (
    <SiteLayout title={title} description={description} path={path}>
      <BackgroundPaths className="block min-h-0 bg-secondary/60 text-brand-ink">
        <div className="container-page relative grid min-h-[calc(100dvh-4rem)] items-center gap-12 py-16 text-foreground lg:grid-cols-2">
          <div className="hidden lg:block">
            <p className="display-1 max-w-[12ch] text-balance">Your money, handled properly.</p>
            <p className="lede mt-6 max-w-md">Sign in to list a property on Probiz and reach buyers across India.</p>
          </div>
          <div className="mx-auto w-full max-w-md rounded-[2rem] border border-border bg-background p-8 shadow-[0_40px_100px_-60px_oklch(0.21_0.006_286/0.5)] sm:p-10">
            <h1 className="headline text-2xl">{heading}</h1>
            {intro && <p className="mt-2 text-sm text-muted-foreground">{intro}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>
      </BackgroundPaths>
    </SiteLayout>
  );
}

export function AuthLink({ href, children }) {
  return (
    <Link href={href} className="font-medium text-foreground underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}
