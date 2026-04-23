// ============================================================
//  File : BusinessLogic/StripePaymentHelper.cs
//  Desc : Stripe Card Payment Integration for DTS GYM
//
//  NuGet:
//  PM> Install-Package Stripe.net
//
//  Web.config <appSettings>:
//    <add key="StripeSecretKey"      value="sk_test_YOUR_KEY" />
//    <add key="StripePublishableKey" value="pk_test_YOUR_KEY" />
// ============================================================
using Stripe;
using System;
using System.Configuration;

namespace GymManagement.BusinessLayer
{
    public static class StripePaymentHelper
    {
        private static string SecretKey
            => ConfigurationManager.AppSettings["StripeSecretKey"];

        public static string PublishableKey
            => ConfigurationManager.AppSettings["StripePublishableKey"];

        // ============================================================
        //  CREATE PAYMENT INTENT
        //  Called when member chooses Card payment
        //  Returns clientSecret → sent to frontend → Stripe.js completes
        // ============================================================
        public static StripePaymentResult CreatePaymentIntent(
            decimal amount,
            string currency = "lkr",
            string description = "DTS GYM Subscription",
            string customerEmail = null)
        {
            var result = new StripePaymentResult();

            try
            {
                StripeConfiguration.ApiKey = SecretKey;

                var options = new PaymentIntentCreateOptions
                {
                    // Stripe uses smallest currency unit (cents/paise)
                    // LKR has no sub-unit so amount * 100 still required
                    Amount = (long)(amount * 100),
                    Currency = currency,
                    Description = description,
                    ReceiptEmail = customerEmail,

                    PaymentMethodTypes = new System.Collections.Generic.List<string>
                    {
                        "card"
                    },

                    Metadata = new System.Collections.Generic.Dictionary<string, string>
                    {
                        { "gym_name", "DTS GYM" },
                        { "description", description }
                    }
                };

                var service = new PaymentIntentService();
                var paymentIntent = service.Create(options);

                result.Success = true;
                result.PaymentIntentId = paymentIntent.Id;
                result.ClientSecret = paymentIntent.ClientSecret;
                result.Status = paymentIntent.Status;
                result.Amount = amount;
                result.Currency = currency.ToUpper();
            }
            catch (StripeException ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.StripeError?.Message ?? ex.Message;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
            }

            return result;
        }

        // ============================================================
        //  CONFIRM PAYMENT
        //  Called after frontend completes payment with Stripe.js
        //  Verifies the PaymentIntent status from Stripe
        // ============================================================
        public static StripePaymentResult ConfirmPayment(string paymentIntentId)
        {
            var result = new StripePaymentResult();

            try
            {
                StripeConfiguration.ApiKey = SecretKey;

                var service = new PaymentIntentService();
                var paymentIntent = service.Get(paymentIntentId);

                result.PaymentIntentId = paymentIntent.Id;
                result.Status = paymentIntent.Status;
                result.Amount = paymentIntent.Amount / 100m;
                result.Currency = paymentIntent.Currency.ToUpper();

                // "succeeded" means payment is confirmed
                result.Success = paymentIntent.Status == "succeeded";

                if (!result.Success)
                    result.ErrorMessage = $"Payment status: {paymentIntent.Status}";
            }
            catch (StripeException ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.StripeError?.Message ?? ex.Message;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
            }

            return result;
        }

        // ============================================================
        //  REFUND PAYMENT
        //  Admin can refund a card payment
        // ============================================================
        public static StripePaymentResult RefundPayment(
            string paymentIntentId,
            decimal? refundAmount = null)
        {
            var result = new StripePaymentResult();

            try
            {
                StripeConfiguration.ApiKey = SecretKey;

                var options = new RefundCreateOptions
                {
                    PaymentIntent = paymentIntentId,
                    Amount = refundAmount.HasValue
                                    ? (long?)(refundAmount.Value * 100)
                                    : null   // null = full refund
                };

                var service = new RefundService();
                var refund = service.Create(options);

                result.Success = refund.Status == "succeeded";
                result.Status = refund.Status;
                result.RefundId = refund.Id;
                result.Amount = refund.Amount / 100m;
                result.ErrorMessage = result.Success ? null : $"Refund status: {refund.Status}";
            }
            catch (StripeException ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.StripeError?.Message ?? ex.Message;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
            }

            return result;
        }
    }

    // ── Result Model ──────────────────────────────────────────────────
    public class StripePaymentResult
    {
        public bool Success { get; set; }
        public string PaymentIntentId { get; set; }
        public string ClientSecret { get; set; }
        public string Status { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string ErrorMessage { get; set; }
        public string RefundId { get; set; }
    }
}