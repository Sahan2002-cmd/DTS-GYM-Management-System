using GymManagement.Models;


namespace GymManagement.Interfaces
{
    public interface IPayment
    {
        Response GetAll();
        Response GetById(int paymentId);
        Response GetByMember(int memberId);
        Response GetBySubscription(int subscriptionId);

        // Cash
        Response AddCashPayment(PaymentRequestModel req);

        // Card (Stripe)
        Response InitiateCardPayment(PaymentRequestModel req);
        Response ConfirmCardPayment(string paymentIntentId);
        Response RefundCardPayment(int paymentId, int adminId);

        // Common
        Response UpdatePaymentStatus(int paymentId, string status, int adminId);
        Response GenerateReceipt(int paymentId);
    }
}