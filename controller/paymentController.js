const { myLogger } = require('../app.js');
myLogger.info('hi')
//reactivate
//    -intitiatePayment
//    -on payment response updatePaymentStatus (pending/ref_num), driverLicenseStatus, nd redirect to u can now close this page
var ypco = require('yenepaysdk');
    exports.checkoutExpress = function(req, res) {
        var sellerCode = 'SB1447';//"YOUR_USER_CODE_IN_YENEPAY";
        var useSandbox = true; //set this false on your production environment
        
        
        var successUrlReturn = 'https://etmilestone.com/ts/pay/success'//"PAYMENT_SUCCESS_RETURN_URL";
        var ipnUrlReturn = 'https://etmilestone.com/ts/pay/ipn'//"PAYMENT_COMPLETION_NOTIFICATION_URL";
        var cancelUrlReturn = "PAYMENT_CANCEL_RETURN_URL";
        var failureUrl = "PAYMENT_FAILURE_RETURN_URL";
        var expiresAfter = 10//"NUMBER_OF_MINUTES_BEFORE_THE_ORDER_EXPIRES less than a day";
        var orderId = req.params.order//"UNIQUE_ID_THAT_IDENTIFIES_THIS_ORDER_ON_YOUR_SYSTEM";
        
        var checkoutOptions = ypco.checkoutOptions(sellerCode, orderId, ypco.checkoutType.Express, useSandbox, expiresAfter, successUrlReturn, cancelUrlReturn, ipnUrlReturn, failureUrl);
        var checkoutItem =  { 
            ItemName: 'Sample Item 1',
            UnitPrice: '5',
            DeliveryFee: '0',
            Discount: '0',
            Tax1: '0',
            Tax2: '0',
            HandlingFee: '0',
            Quantity: '1'
        }
        var url = ypco.checkout.GetCheckoutUrlForExpress(checkoutOptions, checkoutItem);
        res.redirect(url);
        };
exports.IPNDestination = async(req, res, next) => {
var ipnModel = req.body;
myLogger.info('ipnModel')

var useSandbox = true; //set this false on your production environment
ypco.checkout.IsIPNAuthentic(ipnModel, useSandbox).then((data) => {
    //this means the ipn is verified and the status of the transaction is COMPLETED
    //mark the order as "Paid" or "Completed" here
    myLogger.info('payment complete')
})
.catch((err) => {
    //this means either the ipn verification failed or the ipn model is INVALIDs
});;
}
exports.successDestination = async(req, res, next) => {
    res.send('payment complete u can close this page');
    }
//destinations for others too

//enter payOptions
//on ip update db
//on success nd other responses redirect to simple pages 
//try online