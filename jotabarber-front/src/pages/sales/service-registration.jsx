import { Helmet } from "react-helmet-async";
import { CONFIG } from "src/config-global";
import { ServiceRegistrationView } from "src/sections/sales";

const metadata = { title: `Product shop - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <ServiceRegistrationView />
    </>
  );
}
