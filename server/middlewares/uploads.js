const { multipart } = require('../http');

const DOCUMENT_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'];

const documents = multipart(DOCUMENT_TYPES, { visibility: 'private' });

module.exports = {
    property: multipart([...DOCUMENT_TYPES, 'video/mp4'], { visibility: 'public' }),
    homeloan: documents,
    homeloanrenovation: documents,
    educationloan: documents,
    projectfundingLoan: documents,
    CommercialPropertyMortgage: documents,
    CommercialPropertyPurchase: documents,
    creditCard: documents,
    carLoan: documents,
    businessLoan: documents,
    constructionLoan: documents,
    kisanCreditLoan: documents,
    personalLoan: documents,
    PlotPurchaseloan: documents,
    PlotPurchaseConstructionloan: documents,
    FlatePurchaseloan: documents,
    LoanagainstProperty: documents,
    pradhanmantriLoan: documents,
    balancetransfer: documents,
    balancetransfertopup: documents,
};
