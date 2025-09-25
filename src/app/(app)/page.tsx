
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Rocket, Target, Zap } from 'lucide-react';
import React from 'react';
import { Card } from '@/components/ui/card';
import { BackgroundGradient } from '@/components/ui/background-gradient';
import { TypewriterEffect } from '@/components/ui/typewriter-effect';

export default function Dashboard() {
  const features = [
    {
      title: "Placement Prep Hub",
      description: "Practice coding questions, take mock interviews with AI feedback, and access company-specific prep materials.",
      link: "/prep-hub",
      buttonText: "Start Prepping",
    },
    {
      title: "Real Project Builder",
      description: "Work on industry-relevant projects, get code reviews, and master the tech stacks top companies use.",
      link: "/project-builder",
      buttonText: "Build Projects",
    },
    {
      title: "Smart Career Guide",
      description: "Get AI-driven career recommendations, skill-building roadmaps, and salary predictions.",
      link: "/career-guide",
      buttonText: "Get Guided",
    },
  ];

  const whyChooseUs = [
    {
      icon: <Zap className="h-8 w-8 text-accent" />,
      title: "AI-Powered Practice",
      description: "Sharpen your skills with AI mock interviews, coding challenges, and personalized feedback that targets your weak spots."
    },
    {
      icon: <Rocket className="h-8 w-8 text-accent" />,
      title: "Real-World Projects",
      description: "Go beyond theory. Build a portfolio that stands out by working on projects using in-demand technologies."
    },
    {
      icon: <Target className="h-8 w-8 text-accent" />,
      title: "Personalized Guidance",
      description: "Receive a custom career roadmap with our AI Career Guide, including skill recommendations and salary predictions."
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-accent" />,
      title: "Comprehensive Toolkit",
      description: "From the first line of code to the final interview, get all the tools you need to succeed in one seamless platform."
    },
  ];

  const testimonials = [
    {
      title: "Sarah L. - Software Engineer @ Google",
      description: "PlacementPrep was a game-changer. The mock interviews gave me the confidence I needed to ace my technical rounds. I landed my dream job just a month after using it!",
      link: "#",
    },
    {
      title: "David C. - Incoming SDE @ Amazon",
      description: "The real-world project builder is what sets this platform apart. I finally had something impressive to talk about in my interviews besides class projects.",
      link: "#",
    },
    {
      title: "Priya K. - CS Student @ Georgia Tech",
      description: "As a student, the career guide was invaluable. It gave me a clear roadmap of what skills to learn and which companies to target. Highly recommend!",
      link: "#",
    }
  ];
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  return (
    <motion.div 
      className="flex flex-col gap-16 md:gap-24"
      initial="hidden"
      animate="show"
      variants={staggerContainer}
    >
      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden py-24 sm:py-28 md:py-32 flex flex-col items-center justify-center rounded-2xl"
        variants={staggerItem}
      >
        <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-[40rem] h-[40rem] bg-secondary/20 rounded-full filter blur-3xl opacity-5 animate-blob"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[40rem] h-[40rem] bg-accent/20 rounded-full filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <TypewriterEffect 
                words={[
                    { text: "Your" },
                    { text: "Ultimate" },
                    { text: "Placement" },
                    { text: "Prep" },
                    { text: "Toolkit" }
                ]}
                className="text-4xl sm:text-5xl md:text-5xl lg:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-b from-slate-100 to-slate-400 text-center"
                cursorClassName="bg-slate-400"
            />
            
            <p className="mt-4 max-w-2xl text-center text-base sm:text-lg leading-8 text-foreground/80">
              Everything you need to land your dream job in tech, from AI-powered interview prep to real-world project building.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-center mt-6 text-muted-foreground/80">
              - PlacementPrep -
            </h2>

            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/prep-hub">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/career-guide">
                <Button size="lg" variant="outline">
                  Explore Features <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
        </div>
      </motion.section>
      
      {/* Features Section */}
      <motion.section 
        className="py-16"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div className="text-center" variants={staggerItem}>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">All-in-One Placement Toolkit</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                From interview prep to project building, we've got you covered.
            </p>
        </motion.div>
        <div className="mt-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {features.map((feature) => (
                <BackgroundGradient
                  key={feature.title}
                  className="rounded-2xl p-6 bg-card h-full flex flex-col"
                  containerClassName="h-full"
                >
                    <h3 className="text-xl font-bold text-card-foreground">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground flex-grow">{feature.description}</p>
                    <Link href={feature.link} className="mt-6 inline-block">
                        <Button variant="outline" className="w-full">
                            {feature.buttonText || "Learn More"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </BackgroundGradient>
            ))}
        </div>
      </motion.section>

      {/* Why Choose Us Section */}
      <motion.section 
        className="py-16"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <motion.div className="text-center" variants={staggerItem}>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Why Choose PlacementPrep?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                We're not just another prep tool. We are a complete ecosystem designed for your success.
            </p>
        </motion.div>

        <motion.div 
            className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={staggerContainer}
        >
          {whyChooseUs.map((reason) => (
            <motion.div key={reason.title} variants={staggerItem}>
              <Card className="p-6 h-full bg-background/50">
                  <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                          {reason.icon}
                      </div>
                      <div>
                          <h3 className="text-xl font-semibold text-foreground">{reason.title}</h3>
                          <p className="mt-1 text-muted-foreground">{reason.description}</p>
                      </div>
                  </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
      
      {/* Testimonials Section */}
      <motion.section 
        className="py-16 bg-muted/40"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto">
          <motion.div className="text-center" variants={staggerItem}>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Trusted by Students Worldwide</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              See how PlacementPrep has helped students like you land their dream jobs.
            </p>
          </motion.div>

           <div className="mt-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
            {testimonials.map((testimonial) => (
                <BackgroundGradient key={testimonial.title} className="rounded-2xl p-6 bg-card h-full flex flex-col" containerClassName="h-full">
                    <h3 className="text-xl font-bold text-card-foreground">{testimonial.title}</h3>
                    <p className="mt-4 text-muted-foreground">{testimonial.description}</p>
                </BackgroundGradient>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <motion.section 
        className="relative overflow-hidden py-24 sm:py-28 rounded-2xl"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerItem}
      >
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[30rem] h-[30rem] bg-secondary/20 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-accent/10 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

        <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                Your Journey Starts Here.
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Stop waiting and start preparing. With PlacementPrep, you're not just practicing—you're building the future you want. All the tools, guidance, and support you need are right here.
            </p>
            <div className="mt-10">
                <Link href="/prep-hub">
                    <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20">
                        Launch Your Preparation
                        <Rocket className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
            </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
