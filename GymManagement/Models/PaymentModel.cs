// ============================================================
//  File : Models/PaymentModel.cs  (Updated with Card fields)
// ============================================================
namespace GymManagement.Models
{
    public class PaymentModel
    {
        public int? paymentId { get; set; }
        public int? subscriptionId { get; set; }
        public decimal? paymentAmount { get; set; }
        public string payment_date { get; set; }
        public string payment_status { get; set; }
        public string payment_type { get; set; }   // "Cash" or "Card"
        public string memberName { get; set; }
        public string email { get; set; }
        public string phone { get; set; }
        public string planType { get; set; }

        // ── Card Payment fields ───────────────────────────────
        public string stripe_payment_intent_id { get; set; }
        public string stripe_client_secret { get; set; }
    }

    public class PaymentRequestModel : BaseRequestModel
    {
        public int? p_payment_id { get; set; }
        public int? p_subscription_id { get; set; }
        public decimal? p_amount { get; set; }
        public string p_payment_status { get; set; }
        public string p_payment_type { get; set; }   // "Cash" or "Card"
        public int? p_admin_id { get; set; }
        public string p_date_from { get; set; }
        public string p_date_to { get; set; }

        // ── Card Payment fields ───────────────────────────────
        public string p_stripe_payment_intent_id { get; set; }
        public string p_customer_email { get; set; }
    }
}