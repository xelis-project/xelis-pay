# Payment Checker

This is a websocket server to handle XELIS transactions and send feedback to the web plugin.

## PaymentInterface

You only have to implement the PaymentInterface.
There is 3 functions.

- validatePayment
- paymentFailed
- paymentComplete
