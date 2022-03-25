//reactivate
//    -intitiatePayment
//    -on payment response updatePaymentStatus (pending/ref_num), driverLicenseStatus, nd redirect to u can now close this page
var ypco = require('yenepaysdk');

exports.CheckoutCart = function(req, res) {
    var sellerCode = "YOUR_USER_CODE_IN_YENEPAY";
    var useSandbox = true; //set this false on your production environment
    
    
    var successUrlReturn = "PAYMENT_SUCCESS_RETURN_URL";
    var ipnUrlReturn = "PAYMENT_COMPLETION_NOTIFICATION_URL",
    var cancelUrlReturn = "PAYMENT_CANCEL_RETURN_URL",
    var failureUrl = "PAYMENT_FAILURE_RETURN_URL";
    var expiresAfter = "NUMBER_OF_MINUTES_BEFORE_THE_ORDER_EXPIRES less than a day";
    // var orderId = "UNIQUE_ID_THAT_IDENTIFIES_THIS_ORDER_ON_YOUR_SYSTEM";
    
    var checkoutOptions = ypco.checkoutOptions(sellerCode, '', ypco.checkoutType.Cart, useSandbox, expiresAfter, successUrlReturn, cancelUrlReturn, ipnUrlReturn, failureUrl);
    var data = req.body;
    var checkoutItems = data.Items;
    var deliveryFee = 100;
    var discount = 50;
    var handlingFee = 30;
    var totalPrice = 0, totalTax1 = 0, totalTax2 = 0;
    checkoutItems.forEach(function(element) {
        totalPrice += element.UnitPrice * element.Quantity;
    });
    totalTax1 = 0.15*totalPrice; totalTax2 = 0.02*totalPrice;
    checkoutOptions.SetOrderFees(deliveryFee, discount, handlingFee, totalTax1, totalTax2);
    var url = ypco.checkout.GetCheckoutUrlForCart(checkoutOptions, checkoutItems);

    res.json({ "redirectUrl" : url });
    };
exports.IPNDestination = async(req, res, next) => {
var ipnModel = req.body;
var useSandbox = true; //set this false on your production environment
ypco.checkout.IsIPNAuthentic(ipnModel, useSandbox).then((data) => {
    //this means the ipn is verified and the status of the transaction is COMPLETED
    //mark the order as "Paid" or "Completed" here
})
.catch((err) => {
    //this means either the ipn verification failed or the ipn model is INVALIDs
});;
}
//destinations for others too

//enter payOptions
//on ip update db
//on success nd other responses redirect to simple pages 
//try online