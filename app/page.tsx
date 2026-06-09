import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { Hero } from "@/components/home/Hero";
import { RisingThisWeek } from "@/components/home/RisingThisWeek";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <RisingThisWeek />
    </>
  );
}
