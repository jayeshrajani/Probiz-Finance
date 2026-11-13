import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Users from "./pages/user";
import HomeLoan from "./pages/homeloan";
import HomeloanDetail from "./pages/homeloanDetail";
import PlotLoan from "./pages/plotloan";
import FlateLoan from "./pages/flateloan";
import PlotloanDetail from "./pages/plotloanDetail";
import FlatloanDetail from "./pages/flatloanDetail";
import MortgageLoan from "./pages/mortgageloan";
import MortgageLoanDetail from "./pages/mortgageloanDetail";
import CommercialPropertyPurchaseLoanDetail from "./pages/commercialPropertyPurchaseDetail";
import CommercialPropertyPurchaseLoan from "./pages/commercialPropertyPurchase";
import HealthInsurance from "./pages/healthInsurance";
import AutomobileInsurance from "./pages/autoMobile";
import InvestmentPlan from "./pages/investmentPlan";
import Property from "./pages/poperty";
import PropertyDetail from "./pages/propertyDetail";
import PersonalLoan from "./pages/personalLoan";
import PersonalloanDetail from "./pages/personalLoanDetail";
import PlotConstructionLoan from "./pages/plotConsLoan";
import PlotConstructionLoanDetail from "./pages/plotConsLoanDetail";
import ConstructionLoan from "./pages/constructionLoan";
import ConstructionLoanDetail from "./pages/constructionLoanDetail";
import CommercialPropertyMortagePurchaseLoan from "./pages/commercialPropertyMortagePurchase";
import CommercialPropertyMortagePurchaseLoanDetail from "./pages/commercialPropertyMortagePurchaseDetail";
import PradhanMantriLoan from "./pages/pradhanMantri";
import PradhanMantriloanDetail from "./pages/pradhanMantriDetail";
import BusinessLoan from "./pages/businessLoan";
import BusinessLoanDetail from "./pages/businessLoanDetail";
import ProjectFundingLoan from "./pages/projectFunding";
import ProjectFundingLoanDetail from "./pages/projectFundingDetail";
import CreditCardLoan from "./pages/creditCard";
import CreditCardLoanDetail from "./pages/creditCardDetail";
import CarLoan from "./pages/carLoan";
import CarLoanDetail from "./pages/carLoanDetail";
import KisanCreditCard from "./pages/kisanCredit";
import KisanCreditCardDetail from "./pages/kisanCreditDetail";
import BalanceTransfer from "./pages/balanceTransfer";
import BalanceTransferDetail from "./pages/balanceTransferDetail";
import EducationLoan from "./pages/educationLoan";
import EducationLoanDetail from "./pages/educationLoanDetail";
import GoldLoan from "./pages/goldLoan";
import GoldLoanDetail from "./pages/goldLoanDetail";
import HomeRenovationLoan from "./pages/homerenovationLoan";
import HomeRenovationLoanDetail from "./pages/homerenovationLoanDetail";
import AddHomeLoan from "./pages/addHomeLoan";
import AddPlotPurchaseLoan from "./pages/addplotPurchaseLoan";
import AddPlotConstruction from "./pages/addPlotConstruction";
import AddFlatPurchaseLoan from "./pages/addFlatPurchaseLoan";
import AddLoanProperty from "./pages/addLoanProperty";
import AddCommercialPropertyLoan from "./pages/addCommercialPropertyLoan";
import AddHomeRenovationLoan from "./pages/addHomeRenovationLoan";
import AddConstructionLoan from "./pages/addConstructionLoan";
import AddCommercialPropertyMortrageLoan from "./pages/addCommercialPropertyMortrageLoan";
import AddBalanceTransferLoan from "./pages/addBalanceTransferLoan";
import AddPersonalLoan from "./pages/addPersonalLoan";
import AddPradhanMantriMudraYojna from "./pages/addPradhanMantriMudraYojna";
import AddBuisnessLoan from "./pages/addBuisnessLoan";
import AddProjectFundingLoan from "./pages/addProjectFundingLoan";
import AddCreaditCard from "./pages/addCreaditCard";
import AddCarLoan from "./pages/addCarLoan";
import AddKisanCreditCard from "./pages/addKisanCreditCard";
import AddEducationLoan from "./pages/addEducationLoan";
import AddGoldLoan from "./pages/addGoldLoan";
import CaServices from "./pages/caServices";
import RealEstateServices from "./pages/realEstateServices";
import DsaServices from "./pages/dsaServices";
import LegalDocumentation from "./pages/legalDocumentation";
import GovernmentBuisnessServices from "./pages/governmentbuisnessservces";
import DigitalMarketingServices from "./pages/digitalmarketingservices";
import CreditCardScore from "./pages/creditCardScore";
import EStamp from "./pages/eStamp";
import BuisnessConsultation from "./pages/buisnessConsultation";
import AddBalanceTransferTopUpLoan from "./pages/addBalanceTransferTopUpLoan";
import BalanceTopUpLoan from "./pages/balancetopuploan";
import BalanceTranferTopupDetail from "./pages/balancetranfertopupdetail";
import Contact from "./pages/contact";
import NewsLetter from "./pages/newsLetter";
import Employee from "./pages/employee";
import Rols from "./pages/rols";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/home-loan" element={<HomeLoan />} />
        <Route path="/add-home-loan" element={<AddHomeLoan />} />
        <Route
          path="/add-plotpurchase-loan"
          element={<AddPlotPurchaseLoan />}
        />
        <Route path="/plot-loan" element={<PlotLoan />} />
        <Route
          path="/add-plot-construction"
          element={<AddPlotConstruction />}
        />
        <Route
          path="/plot-construction-loan"
          element={<PlotConstructionLoan />}
        />
        <Route path="/flat-loan" element={<FlateLoan />} />
        <Route
          path="/add-flatpurchase-loan"
          element={<AddFlatPurchaseLoan />}
        />
        <Route path="/mortgage-loan" element={<MortgageLoan />} />
        <Route
          path="/mortgage-loan-detail/:id"
          element={<MortgageLoanDetail />}
        />
        <Route path="/home-loan-detail/:id" element={<HomeloanDetail />} />
        <Route path="/plot-loan-detail/:id" element={<PlotloanDetail />} />
        <Route
          path="/add-loan-against-property"
          element={<AddLoanProperty />}
        />
        <Route
          path="/plot-construction-loan-detail/:id"
          element={<PlotConstructionLoanDetail />}
        />
        <Route path="/flat-loan-detail/:id" element={<FlatloanDetail />} />
        <Route
          path="/add-commercialproperty-loan"
          element={<AddCommercialPropertyLoan />}
        />
        <Route
          path="/commercial-property-purchase-loan"
          element={<CommercialPropertyPurchaseLoan />}
        />
        <Route
          path="/commercial-property-purchase-loan/:id"
          element={<CommercialPropertyPurchaseLoanDetail />}
        />
        <Route path="/health-insurance" element={<HealthInsurance />} />
        <Route path="/automobile-insurance" element={<AutomobileInsurance />} />
        <Route path="/investment-plan" element={<InvestmentPlan />} />
        <Route path="/property" element={<Property />} />
        <Route path="/propertyDetail/:id" element={<PropertyDetail />} />
        <Route path="/personal-loan" element={<PersonalLoan />} />
        <Route
          path="/personal-loan-detail/:id"
          element={<PersonalloanDetail />}
        />
        <Route path="/construction-loan" element={<ConstructionLoan />} />
        <Route
          path="/construction-loan-detail/:id"
          element={<ConstructionLoanDetail />}
        />
        <Route path="/add-mortrage-loan" element={<AddLoanProperty />} />
        <Route
          path="/commercial-property-mortage-loan"
          element={<CommercialPropertyMortagePurchaseLoan />}
        />
        <Route
          path="/add-commercial-property-mortrage-loan"
          element={<AddCommercialPropertyMortrageLoan />}
        />
        <Route
          path="/commercial-property-mortage-loan/:id"
          element={<CommercialPropertyMortagePurchaseLoanDetail />}
        />
        <Route path="/pradhan-mantri-loan" element={<PradhanMantriLoan />} />
        <Route
          path="/pradhan-mantri-loan-detail/:id"
          element={<PradhanMantriloanDetail />}
        />
        <Route path="/business-loan" element={<BusinessLoan />} />
        <Route
          path="/business-loan-detail/:id"
          element={<BusinessLoanDetail />}
        />
        <Route path="/project-funding-loan" element={<ProjectFundingLoan />} />
        <Route
          path="/project-funding-loan-detail/:id"
          element={<ProjectFundingLoanDetail />}
        />
        <Route path="/credit-card" element={<CreditCardLoan />} />
        <Route
          path="/credit-card-detail/:id"
          element={<CreditCardLoanDetail />}
        />
        <Route path="/car-loan" element={<CarLoan />} />
        <Route path="/car-loan-detail/:id" element={<CarLoanDetail />} />
        <Route path="/kisan-credit-card" element={<KisanCreditCard />} />
        <Route
          path="/kisan-credit-card-detail/:id"
          element={<KisanCreditCardDetail />}
        />
        <Route path="/balance-transfer" element={<BalanceTransfer />} />
        <Route
          path="/balance-transfer-detail/:id"
          element={<BalanceTransferDetail />}
        />
        <Route
          path="/add-balancetransfer-loan"
          element={<AddBalanceTransferLoan />}
        />
        <Route path="/education-loan" element={<EducationLoan />} />
        <Route
          path="/education-loan-detail/:id"
          element={<EducationLoanDetail />}
        />
        <Route path="/gold-loan" element={<GoldLoan />} />
        <Route path="/gold-loan-detail/:id" element={<GoldLoanDetail />} />
        <Route path="/homerenovation-loan" element={<HomeRenovationLoan />} />
        <Route
          path="/homerenovation-loan-detail/:id"
          element={<HomeRenovationLoanDetail />}
        />
        <Route
          path="/add-home-renovation-loan"
          element={<AddHomeRenovationLoan />}
        />
        <Route
          path="/add-construction-loan"
          element={<AddConstructionLoan />}
        />
        <Route path="/add-personal-loan" element={<AddPersonalLoan />} />
        <Route
          path="/add-pradhan-mantri"
          element={<AddPradhanMantriMudraYojna />}
        />
        <Route path="/add-buisness-loan" element={<AddBuisnessLoan />} />
        <Route
          path="/add-project-fundingloan"
          element={<AddProjectFundingLoan />}
        />
        <Route path="/add-creditcard-loan" element={<AddCreaditCard />} />
        <Route path="/add-car-loan" element={<AddCarLoan />} />
        <Route path="/add-kisancreditcard" element={<AddKisanCreditCard />} />
        <Route path="/add-education-loan" element={<AddEducationLoan />} />
        <Route path="/add-GoldLoan" element={<AddGoldLoan />} />
        <Route path="/ca-services" element={<CaServices />} />
        <Route path="/real-estate-services" element={<RealEstateServices />} />
        <Route path="/dsa-services" element={<DsaServices />} />
        <Route path="/legal-documentation" element={<LegalDocumentation />} />
        <Route
          path="/governmentbuisness"
          element={<GovernmentBuisnessServices />}
        />
        <Route
          path="/digitalmarketing"
          element={<DigitalMarketingServices />}
        />
        <Route path="/creditcardscore" element={<CreditCardScore />} />
        <Route path="/estamp" element={<EStamp />} />
        <Route
          path="/buisnessconsultation"
          element={<BuisnessConsultation />}
        />
        <Route
          path="/addbalancetransfertopuploan"
          element={<AddBalanceTransferTopUpLoan />}
        />
        <Route path="/balancetopuploan" element={<BalanceTopUpLoan />} />
        <Route
          path="/balancetranfertopuploandetail/:id"
          element={<BalanceTranferTopupDetail />}
        />
        <Route path="/contacts" element={<Contact />} />
        <Route path="/newsletter" element={<NewsLetter />} />
        <Route path="/employees" element={<Employee />} />
        <Route path="/rols" element={<Rols />} />
      </Routes>
    </div>
  );
}

export default App;
