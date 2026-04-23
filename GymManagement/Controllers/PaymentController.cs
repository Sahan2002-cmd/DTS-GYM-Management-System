// ============================================================
//  File : Controllers/PaymentController.cs (Updated)
// ============================================================
using GymManagement.BusinessLayer;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class PaymentController : Controller
    {
        private readonly IPayment _payment;
        private readonly IUser _user;

        public PaymentController(IPayment payment, IUser user)
        {
            _payment = payment;
            _user = user;
        }

        // GET /payment/getall
        [HttpGet]
        public ActionResult GetAll()
            => Json(_payment.GetAll(), JsonRequestBehavior.AllowGet);

        // GET /payment/getbyid?id=1
        [HttpGet]
        public ActionResult GetById(int id)
            => Json(_payment.GetById(id), JsonRequestBehavior.AllowGet);

        // GET /payment/getbymember?memberId=2
        [HttpGet]
        public ActionResult GetByMember(int memberId)
            => Json(_payment.GetByMember(memberId), JsonRequestBehavior.AllowGet);

        // GET /payment/getbysubscription?subscriptionId=3
        [HttpGet]
        public ActionResult GetBySubscription(int subscriptionId)
            => Json(_payment.GetBySubscription(subscriptionId), JsonRequestBehavior.AllowGet);

        // ── CASH PAYMENT ──────────────────────────────────────────────
        // POST /payment/addcash
        // Admin manually records cash payment
        // Body : { p_subscription_id, p_amount, p_admin_id }



        //[HttpPost]
        //public ActionResult AddCash(PaymentRequestModel req, int adminId)
        //{
        //    if (!_user.IsAdmin(adminId))
        //        return Json(new { StatusCode = 403, Message = "Unauthorized." });
        //    return Json(_payment.AddCashPayment(req));
        //}


        // REPLACE AddCash action:
        [HttpPost]
        public ActionResult AddCash(PaymentRequestModel req, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized." });

            return Json(_payment.AddCashPayment(req));
        }

        // ── CARD PAYMENT Step 1 ───────────────────────────────────────
        // POST /payment/initiatecardpayment
        // Member initiates card payment
        // Body : { p_subscription_id, p_amount, p_customer_email }
        // Returns : { clientSecret, paymentIntentId, publishableKey }
        // Frontend uses clientSecret with Stripe.js to complete payment
        [HttpPost]
        public ActionResult InitiateCardPayment(PaymentRequestModel req)
        {
            return Json(_payment.InitiateCardPayment(req));
        }

        // ── CARD PAYMENT Step 2 ───────────────────────────────────────
        // POST /payment/confirmcardpayment
        // Called by frontend AFTER Stripe.js confirms payment
        // Body : { paymentIntentId }
        // Verifies with Stripe and updates DB status to 'completed'
        [HttpPost]
        public ActionResult ConfirmCardPayment(string paymentIntentId)
        {
            if (string.IsNullOrWhiteSpace(paymentIntentId))
                return Json(new { StatusCode = 400, Message = "PaymentIntentId is required." });

            return Json(_payment.ConfirmCardPayment(paymentIntentId));
        }

        // ── UPDATE PAYMENT STATUS (Admin) ─────────────────────────────
        // POST /payment/updatestatus
        // Body : { paymentId, status, adminId }
        // status: pending | completed | failed | refunded
        [HttpPost]
        public ActionResult UpdateStatus(int paymentId, string status, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized." });
            return Json(_payment.UpdatePaymentStatus(paymentId, status, adminId));
        }

        // ── REFUND CARD PAYMENT (Admin) ───────────────────────────────
        // POST /payment/refund?paymentId=1&adminId=1
        [HttpPost]
        public ActionResult Refund(int paymentId, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized." });
            return Json(_payment.RefundCardPayment(paymentId, adminId));
        }

        // ── PDF RECEIPT ───────────────────────────────────────────────
        // GET /payment/getreceipt?paymentId=1
        // Returns base64 PDF
        [HttpGet]
        public ActionResult GetReceipt(int paymentId)
            => Json(_payment.GenerateReceipt(paymentId), JsonRequestBehavior.AllowGet);
    }
}