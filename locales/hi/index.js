// English source text -> Hindi. Split by area so each file stays reviewable; keys must match the English exactly.
import assistant from "./assistant.json";
import catalogMore from "./catalog-more.json";
import catalog from "./catalog.json";
import company from "./company.json";
import forms from "./forms.json";
import legal from "./legal.json";
import services from "./services.json";
import uiPages from "./ui-pages.json";
import ui from "./ui.json";

// Sent with every Hindi page.
export const common = { ...forms, ...catalogMore, ...catalog, ...assistant, ...uiPages, ...ui };

// Only the pages that show them: service pages, legal pages, About and Careers.
export const extras = { services, legal, company };
