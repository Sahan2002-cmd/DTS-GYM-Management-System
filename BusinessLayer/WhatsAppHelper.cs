// ============================================================
// BusinessLogic/WhatsAppHelper.cs
// Generates WhatsApp click-to-chat links (wa.me) for notifications
// ============================================================
using GymManagement.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace GymManagement.BusinessLogic
{
    public static class WhatsAppHelper
    {
        private const string GymName = "DTS GYM";

        /// <summary>
        /// Builds a wa.me link with a pre‑filled message.
        /// </summary>
        public static string GenerateWaMeLink(string phoneNumber, string message)
        {
            if (string.IsNullOrWhiteSpace(phoneNumber))
                return null;

            // Clean phone number: keep only digits, ensure country code
            string clean = new string(phoneNumber.Where(char.IsDigit).ToArray());
            if (!clean.StartsWith("94"))  // Sri Lanka country code – adjust if needed
                clean = "94" + clean.TrimStart('0');

            return $"https://wa.me/{clean}?text={Uri.EscapeDataString(message)}";
        }

        // ========== OTP ==========
        public static Response SendOtpViaWhatsApp(string phone, string otp)
        {
            string message = $"Your DTS GYM OTP is: {otp}\n\nThis code expires in 10 minutes.";
            string link = GenerateWaMeLink(phone, message);
            return new Response
            {
                StatusCode = 200,
                Result = "WhatsApp link generated.",
                ResultSet = new { link }
            };
        }

        // ========== Check‑In ==========
        public static async Task<Response> SendCheckInNotificationAsync(string phone, string memberName)
        {
            string message = $"✅ *Check‑In Confirmed*\n\nWelcome {memberName}!\nYou have successfully checked in to {GymName} at {DateTime.Now:hh:mm tt}.\n\n💪 Keep crushing your goals!";
            string link = GenerateWaMeLink(phone, message);
            return new Response
            {
                StatusCode = 200,
                Result = "WhatsApp link generated.",
                ResultSet = new { link }
            };
        }

        // ========== Check‑Out ==========
        public static async Task<Response> SendCheckOutNotificationAsync(string phone, string memberName)
        {
            string message = $"👋 *Check‑Out Confirmed*\n\nThank you {memberName} for your workout at {GymName}.\nSee you again soon! 💪";
            string link = GenerateWaMeLink(phone, message);
            return new Response
            {
                StatusCode = 200,
                Result = "WhatsApp link generated.",
                ResultSet = new { link }
            };
        }

        // ========== Incomplete Schedule ==========
        public static async Task<Response> SendIncompleteScheduleNotificationAsync(
            string phone, string memberName, string scheduleDate,
            string trainerName, string startTime, string endTime)
        {
            string message = $"⚠️ *Schedule Reminder*\n\n" +
                             $"Hi {memberName},\n\n" +
                             $"You have a pending workout session that was not completed:\n" +
                             $"📅 Date: {scheduleDate}\n" +
                             $"⏰ Time: {startTime} - {endTime}\n" +
                             $"🏋️ Trainer: {trainerName}\n\n" +
                             $"Please contact your trainer or mark it as completed.";
            string link = GenerateWaMeLink(phone, message);
            return new Response
            {
                StatusCode = 200,
                Result = "WhatsApp link generated.",
                ResultSet = new { link }
            };
        }

        // ========== Subscription Expiry ==========
        public static async Task<Response> SendSubscriptionExpiryNotificationAsync(
            string phone, string memberName, string planType, string expiryDate, int daysLeft)
        {
            string message;
            if (daysLeft > 0)
            {
                string urgency = daysLeft <= 3 ? "⚠️ REMINDER" : "📅 REMINDER";
                message = $"{urgency}\n\nHi {memberName},\n\nYour *{planType}* subscription expires in *{daysLeft} day{(daysLeft == 1 ? "" : "s")}* on {expiryDate}.\n\nPlease renew your membership to continue uninterrupted access.\n\nThank you for choosing {GymName}! 💪";
            }
            else if (daysLeft < 0)
            {
                message = $"🔴 *EXPIRED*\n\nHi {memberName},\n\nYour *{planType}* subscription expired on {expiryDate}.\n\nPlease renew as soon as possible to reactivate your access.\n\nContact the gym for assistance.";
            }
            else
            {
                message = $"⚠️ *EXPIRES TODAY*\n\nHi {memberName},\n\nYour *{planType}* subscription expires *today* ({expiryDate}).\n\nPlease renew immediately to avoid interruption.\n\nThank you!";
            }
            string link = GenerateWaMeLink(phone, message);
            return new Response
            {
                StatusCode = 200,
                Result = "WhatsApp link generated.",
                ResultSet = new { link }
            };
        }

        // Generic notification method (C# 7.3 compatible – no switch expression)
        public static async Task<Response> SendNotificationAsync(string phone, string type, string name = null)
        {
            string message;
            if (type == "checkin")
            {
                message = $"✅ *Check‑In Confirmed*\n\nWelcome {name}!\nYou have successfully checked in to {GymName} at {DateTime.Now:hh:mm tt}.";
            }
            else if (type == "checkout")
            {
                message = $"👋 *Check‑Out Confirmed*\n\nThank you {name} for your workout at {GymName}.";
            }
            else
            {
                message = $"📢 {GymName} Notification\n\n{(string.IsNullOrEmpty(name) ? "" : $"Hi {name},\n\n")}{type}";
            }

            string link = GenerateWaMeLink(phone, message);
            return new Response
            {
                StatusCode = 200,
                Result = "WhatsApp link generated.",
                ResultSet = new { link }
            };
        }
    }
}