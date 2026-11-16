import HomePage from "@/components/templates/HomePage";
import { localeProps } from "@/lib/i18n-static";

export const getStaticProps = localeProps;

// Older links point to /home; it renders the homepage with "/" as canonical.
export default HomePage;
