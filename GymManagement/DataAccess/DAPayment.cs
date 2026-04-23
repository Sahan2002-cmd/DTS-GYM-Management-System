// ============================================================
//  File : DataAccess/DAPayment.cs  (Updated with Card Payment)
//  Proc : GYM_PAYMENT_PROC
// ============================================================
using GymManagement.BusinessLayer;
using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Data;

namespace GymManagement.DataAccess
{
    public class DAPayment : IPayment
    {
        private readonly string ProcName = "GYM_PAYMENT_PROC";

        public Response GetAll()
            => Read(new PaymentRequestModel { p_action_type = "001" });

        public Response GetById(int id)
            => Read(new PaymentRequestModel { p_action_type = "002", p_payment_id = id });

        public Response GetByMember(int mid)
            => Read(new PaymentRequestModel { p_action_type = "003", p_subscription_id = mid });

        public Response GetBySubscription(int sid)
            => Read(new PaymentRequestModel { p_action_type = "004", p_subscription_id = sid });

        // ── CASH PAYMENT (Admin adds manually) ────────────────────────
        public Response AddCashPayment(PaymentRequestModel req)
        {
            req.p_action_type = "005";
            req.p_payment_type = "Cash";
            req.p_payment_status = "completed"; // Since Cash is immediate

            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1" && res.ResultDataTable.Rows.Count > 0)
                {
                    int newPaymentId = Convert.ToInt32(res.ResultDataTable.Rows[0]["paymentId"]);
                    result.StatusCode = 200;
                    result.Result = "Cash payment recorded successfully.";

                    // Now fetch the payment to generate receipt
                    var payRes = GetById(newPaymentId);
                    if (payRes.StatusCode == 200 && payRes.ResultSet != null)
                    {
                        var payment = (PaymentModel)payRes.ResultSet;

                        if (!string.IsNullOrEmpty(payment.email))
                        {
                            var pdfReceiptRes = GenerateReceipt(newPaymentId);
                            if (pdfReceiptRes.StatusCode == 200 && pdfReceiptRes.ResultSet != null)
                            {
                                string base64Pdf = (string)pdfReceiptRes.ResultSet;
                                EmailHelper.SendPaymentReceiptEmail(
                                     toEmail: payment.email,
                                     memberName: payment.memberName,
                                     planType: payment.planType,
                                     amount: payment.paymentAmount ?? 0,
                                     paymentType: payment.payment_type,
                                     paymentDate: payment.payment_date,
                                     paymentId: newPaymentId,
                                     base64Pdf: base64Pdf
                                );
                            }
                        }
                    }
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }

        // ── CARD PAYMENT Step 1 : Create Stripe PaymentIntent ─────────
        public Response InitiateCardPayment(PaymentRequestModel req)
        {
            var result = new Response();

            try
            {
                var stripeResult = StripePaymentHelper.CreatePaymentIntent(
                    amount: req.p_amount ?? 0,
                    currency: "lkr",
                    description: "DTS GYM Subscription Payment",
                    customerEmail: req.p_customer_email
                );

                if (!stripeResult.Success)
                {
                    result.StatusCode = 400;
                    result.Result = stripeResult.ErrorMessage;
                    return result;
                }

                req.p_action_type = "007";
                req.p_payment_type = "Card";
                req.p_payment_status = "pending";
                req.p_stripe_payment_intent_id = stripeResult.PaymentIntentId;

                using (var db = new DBconnect())
                {
                    var res = db.ProcedureExecute(req, ProcName);
                    if (res.ResultStatusCode != "1")
                    {
                        result.StatusCode = 500;
                        result.Result = res.ExceptionMessage;
                        return result;
                    }
                }

                result.StatusCode = 200;
                result.Result = "Payment intent created. Complete payment on frontend.";
                result.ResultSet = new
                {
                    clientSecret = stripeResult.ClientSecret,
                    paymentIntentId = stripeResult.PaymentIntentId,
                    amount = stripeResult.Amount,
                    currency = stripeResult.Currency,
                    publishableKey = StripePaymentHelper.PublishableKey
                };
            }
            catch (Exception ex)
            {
                result.StatusCode = 500;
                result.Result = ex.Message;
            }

            return result;
        }

        // ── CARD PAYMENT Step 2 : Confirm after Stripe.js completes ───
        public Response ConfirmCardPayment(string paymentIntentId)
        {
            var result = new Response();

            try
            {
                var stripeResult = StripePaymentHelper.ConfirmPayment(paymentIntentId);

                if (!stripeResult.Success)
                {
                    result.StatusCode = 400;
                    result.Result = stripeResult.ErrorMessage;
                    return result;
                }

                var req = new PaymentRequestModel
                {
                    p_action_type = "008",
                    p_stripe_payment_intent_id = paymentIntentId,
                    p_payment_status = "completed"
                };

                using (var db = new DBconnect())
                {
                    var res = db.ProcedureExecute(req, ProcName);
                    result.StatusCode = res.ResultStatusCode == "1" ? 200 : 500;
                    result.Result = res.ResultStatusCode == "1"
                                        ? "Card payment confirmed successfully."
                                        : res.ExceptionMessage;
                }
            }
            catch (Exception ex)
            {
                result.StatusCode = 500;
                result.Result = ex.Message;
            }

            return result;
        }

        // ── UPDATE PAYMENT STATUS (Admin) ─────────────────────────────
        public Response UpdatePaymentStatus(int paymentId, string status, int adminId)
        {
            return Exec(new PaymentRequestModel
            {
                p_action_type = "006",
                p_payment_id = paymentId,
                p_payment_status = status,
                p_admin_id = adminId
            }, "Payment status updated successfully.");
        }

        // ── REFUND CARD PAYMENT (Admin) ───────────────────────────────
        public Response RefundCardPayment(int paymentId, int adminId)
        {
            var result = new Response();

            var payRes = GetById(paymentId);
            if (payRes.StatusCode != 200 || payRes.ResultSet == null)
            {
                result.StatusCode = 404;
                result.Result = "Payment not found.";
                return result;
            }

            var payment = payRes.ResultSet as PaymentModel;
            if (payment?.payment_type != "Card" ||
                string.IsNullOrEmpty(payment.stripe_payment_intent_id))
            {
                result.StatusCode = 400;
                result.Result = "This payment is not a card payment or has no Stripe reference.";
                return result;
            }

            var stripeResult = StripePaymentHelper.RefundPayment(
                paymentIntentId: payment.stripe_payment_intent_id
            );

            if (!stripeResult.Success)
            {
                result.StatusCode = 400;
                result.Result = stripeResult.ErrorMessage;
                return result;
            }

            return Exec(new PaymentRequestModel
            {
                p_action_type = "006",
                p_payment_id = paymentId,
                p_payment_status = "refunded",
                p_admin_id = adminId
            }, "Card payment refunded successfully.");
        }

        // ── GENERATE PDF RECEIPT ──────────────────────────────────────
        public Response GenerateReceipt(int paymentId)
        {
            var result = new Response();
            var payRes = GetById(paymentId);

            if (payRes.StatusCode != 200 || payRes.ResultSet == null)
            {
                result.StatusCode = 404;
                result.Result = "Payment not found.";
                return result;
            }

            byte[] pdfBytes = PdfReportGenerator.GeneratePaymentReceipt(
                                (PaymentModel)payRes.ResultSet);

            result.StatusCode = 200;
            result.ResultSet = Convert.ToBase64String(pdfBytes);
            return result;
        }

        // ── Private Helpers ───────────────────────────────────────────
        private Response Read(PaymentRequestModel req)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<PaymentModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                        list.Add(MapRow(row));

                    result.ResultSet = list;
                    result.StatusCode = 200;
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }

        private Response Exec(PaymentRequestModel req, string successMsg)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(req, ProcName);
                result.StatusCode = res.ResultStatusCode == "1" ? 200 : 500;
                result.Result = res.ResultStatusCode == "1"
                                    ? successMsg
                                    : res.ExceptionMessage;
            }
            return result;
        }

        private PaymentModel MapRow(DataRow row) => new PaymentModel
        {
            paymentId = row["paymentId"] != DBNull.Value
                                         ? Convert.ToInt32(row["paymentId"]) : (int?)null,
            subscriptionId = row["subscriptionId"] != DBNull.Value
                                         ? Convert.ToInt32(row["subscriptionId"]) : (int?)null,
            paymentAmount = row["paymentAmount"] != DBNull.Value
                                         ? Convert.ToDecimal(row["paymentAmount"]) : (decimal?)null,
            payment_date = row["payment_date"]?.ToString(),
            payment_status = row["payment_status"]?.ToString(),
            payment_type = row["payment_type"]?.ToString(),
            memberName = row.Table.Columns.Contains("memberName")
                                         ? row["memberName"]?.ToString() : null,
            email = row.Table.Columns.Contains("email")
                                         ? row["email"]?.ToString() : null,
            phone = row.Table.Columns.Contains("phone")
                                         ? row["phone"]?.ToString() : null,
            planType = row.Table.Columns.Contains("planType")
                                         ? row["planType"]?.ToString() : null,
            stripe_payment_intent_id = row.Table.Columns.Contains("stripe_payment_intent_id")
                                         ? row["stripe_payment_intent_id"]?.ToString() : null
        };
    }
}