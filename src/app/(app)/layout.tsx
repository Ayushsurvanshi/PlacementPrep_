'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Briefcase, Menu, Twitter, Linkedin, Github } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Logo = () => {
    return (
        <Link
            href="/"
            className="flex items-center gap-2"
        >
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground text-lg">
                PlacementPrep
            </span>
        </Link>
    );
};

const Footer = () => {
    return (
        <footer className="border-t mt-auto bg-card/50">
            <div className="container mx-auto px-4 lg:px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Column 1: Logo and mission */}
                    <div className="flex flex-col gap-4">
                        <Logo />
                        <p className="text-muted-foreground text-sm">
                            Your ultimate toolkit to land a dream job in the tech industry.
                        </p>
                    </div>
                    {/* Column 2: Product Links */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Product</h3>
                        <ul className="space-y-2">
                            <li><Link href="/prep-hub" className="text-sm text-muted-foreground hover:text-primary transition-colors">Prep Hub</Link></li>
                            <li><Link href="/project-builder" className="text-sm text-muted-foreground hover:text-primary transition-colors">Project Builder</Link></li>
                            <li><Link href="/career-guide" className="text-sm text-muted-foreground hover:text-primary transition-colors">Career Guide</Link></li>
                        </ul>
                    </div>
                     {/* Column 3: Legal Links */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Legal</h3>
                        <ul className="space-y-2">
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="border-t">
                <div className="container mx-auto px-4 lg:px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} PlacementPrep. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
                            <Twitter className="h-5 w-5" />
                        </Link>
                        <Link href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
                            <Linkedin className="h-5 w-5" />
                        </Link>
                        <Link href="#" aria-label="GitHub" className="text-muted-foreground hover:text-primary transition-colors">
                            <Github className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (pathname.startsWith('/prep-hub/solve')) {
        return <main>{children}</main>;
    }
    
    const links = [
        { label: "Dashboard", href: "/" },
        { label: "Prep Hub", href: "/prep-hub" },
        { label: "Project Builder", href: "/project-builder" },
        { label: "Career Guide", href: "/career-guide" },
    ];

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <header className="px-4 lg:px-6 h-24 flex items-center">
                <Logo />
                {/* Desktop Navigation */}
                <nav className="ml-auto hidden items-center gap-4 sm:gap-6 sm:flex">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                pathname === link.href ? "text-primary font-semibold" : "text-muted-foreground"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
                 {/* Mobile Navigation */}
                <div className="ml-auto flex items-center sm:hidden">
                    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <div className="flex flex-col gap-6 p-6 pt-12">
                                <div className="absolute top-6 left-6">
                                    <Logo />
                                </div>
                                {links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "text-lg font-medium transition-colors hover:text-primary",
                                            pathname === link.href ? "text-primary font-semibold" : "text-muted-foreground"
                                        )}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </header>
            <main className="flex-1 p-4 lg:p-6 pt-0">
                {children}
            </main>
            {pathname === '/' && <Footer />}
        </div>
    );
}
