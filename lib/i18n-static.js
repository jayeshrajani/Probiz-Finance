// Pages export these as getStaticProps. Only Hindi pages get a dictionary, so English pages ship none;
// service, legal and company text goes only to the pages that show it.
export function localePropsWith(...areas) {
  return async function getStaticProps({ locale }) {
    if (locale !== "hi") return { props: {} };
    const { common, extras } = await import("@/locales/hi");
    return { props: { messages: Object.assign({}, ...areas.map((a) => extras[a]), common) } };
  };
}

export const localeProps = localePropsWith();
