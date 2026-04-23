// ============================================================
//  File : BusinessLogic/EmailHelper.cs
//  Desc : Sends all emails for DTS GYM Management System
// ============================================================
using GymManagement.Models;
using System;
using System.Configuration;
using System.Net;
using System.Net.Mail;

namespace GymManagement.BusinessLayer
{
    public static class EmailHelper
    {
        private static string Host
            => ConfigurationManager.AppSettings["SmtpHost"];

        private static int Port
            => int.Parse(ConfigurationManager.AppSettings["SmtpPort"] ?? "587");

        private static string SmtpUser
            => ConfigurationManager.AppSettings["SmtpUser"];

        private static string Password
            => ConfigurationManager.AppSettings["SmtpPassword"];

        private static string From
            => ConfigurationManager.AppSettings["SmtpFrom"];

        private static string GymName
            => ConfigurationManager.AppSettings["GymName"] ?? "DTS GYM";

        private static string GymPhone
            => ConfigurationManager.AppSettings["GymPhone"] ?? "";

        private static string GymAddress
            => ConfigurationManager.AppSettings["GymAddress"] ?? "";

        // 1. OTP EMAIL
        public static Response SendOtpEmail(string toEmail, string otp)
        {
            string subject = $"{GymName} – Password Reset OTP";
            string body = $@"
            <!DOCTYPE html>
            <html>
            <body style='font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;'>
              <div style='max-width:500px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);'>
                <div style='background:#1abc9c;padding:25px;text-align:center;'>
                  <h1 style='color:#fff;margin:0;font-size:26px;'>{GymName}</h1>
                  <p style='color:#d5f5ee;margin:5px 0 0;font-size:13px;'>Password Reset Request</p>
                </div>
                <div style='padding:30px;'>
                  <p style='font-size:15px;color:#333;'>We received a request to reset your password. Use the OTP below to proceed:</p>
                  <div style='text-align:center;margin:25px 0;'>
                    <div style='display:inline-block;background:#f0fdf9;border:2px dashed #1abc9c;border-radius:10px;padding:15px 40px;'>
                      <p style='margin:0;font-size:13px;color:#999;letter-spacing:1px;'>YOUR OTP CODE</p>
                      <h1 style='margin:8px 0 0;font-size:42px;color:#1abc9c;letter-spacing:12px;font-weight:bold;'>{otp}</h1>
                    </div>
                  </div>
                  <p style='font-size:13px;color:#e74c3c;text-align:center;'>⏱ This OTP expires in <strong>10 minutes</strong>.</p>
                  <hr style='border:none;border-top:1px solid #eee;margin:20px 0;'/>
                  <p style='font-size:12px;color:#999;text-align:center;'>If you did not request a password reset, please ignore this email.</p>
                </div>
                <div style='background:#f9f9f9;padding:15px;text-align:center;border-top:1px solid #eee;'>
                  <p style='margin:0;font-size:11px;color:#aaa;'>{GymName} &nbsp;|&nbsp; {GymPhone} &nbsp;|&nbsp; {GymAddress}</p>
                </div>
              </div>
            </body>
            </html>";
            return Send(toEmail, subject, body);
        }

        // 2. WELCOME EMAIL
        public static Response SendWelcomeEmail(string toEmail)
        {
            string subject = $"Welcome to {GymName}!";
            string body = $@"
            <!DOCTYPE html>
            <html>
            <body style='font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;'>
              <div style='max-width:500px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);'>
                <div style='background:#1abc9c;padding:25px;text-align:center;'>
                  <h1 style='color:#fff;margin:0;font-size:26px;'>{GymName}</h1>
                  <p style='color:#d5f5ee;margin:5px 0 0;font-size:13px;'>Welcome to the Family!</p>
                </div>
                <div style='padding:30px;'>
                  <h2 style='color:#1abc9c;margin-top:0;'>Hi ! 👋</h2>
                  <p style='font-size:15px;color:#333;line-height:1.6;'>Thank you for registering at <strong>{GymName}</strong>. Your account has been created successfully.</p>
                  <div style='background:#fff8e1;border-left:4px solid #f39c12;padding:15px;border-radius:5px;margin:20px 0;'>
                    <p style='margin:0;font-size:14px;color:#856404;'>⏳ <strong>Pending Admin Approval</strong><br/>Your account is currently under review. You will receive another email once approved.</p>
                  </div>
                </div>
                <div style='background:#f9f9f9;padding:15px;text-align:center;border-top:1px solid #eee;'>
                  <p style='margin:0;font-size:11px;color:#aaa;'>{GymName} &nbsp;|&nbsp; {GymPhone} &nbsp;|&nbsp; {GymAddress}</p>
                </div>
              </div>
            </body>
            </html>";
            return Send(toEmail, subject, body);
        }

        // 3. APPROVAL EMAIL
        public static Response SendApprovalEmail(string toEmail, string role)
        {
            string subject = $"{GymName} – Account Approved as {role}";
            string roleColor = role == "Trainer" ? "#3498db" : "#1abc9c";
            string roleIcon = role == "Trainer" ? "🏋️" : "💪";
            string body = $@"
            <!DOCTYPE html>
            <html>
            <body style='font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;'>
              <div style='max-width:500px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);'>
                <div style='background:{roleColor};padding:25px;text-align:center;'>
                  <h1 style='color:#fff;margin:0;font-size:26px;'>{GymName}</h1>
                  <p style='color:rgba(255,255,255,0.8);margin:5px 0 0;font-size:13px;'>Account Approved</p>
                </div>
                <div style='padding:30px;'>
                  <h2 style='color:{roleColor};margin-top:0;'>Congratulations! {roleIcon}</h2>
                  <p style='font-size:15px;color:#333;line-height:1.6;'>Your account has been approved. You are now registered as a <strong style='color:{roleColor};'>{role}</strong> at <strong>{GymName}</strong>.</p>
                  <div style='text-align:center;margin:25px 0;'>
                    <span style='display:inline-block;background:{roleColor};color:#fff;padding:10px 30px;border-radius:25px;font-size:16px;font-weight:bold;letter-spacing:1px;'>{roleIcon} {role.ToUpper()}</span>
                  </div>
                </div>
                <div style='background:#f9f9f9;padding:15px;text-align:center;border-top:1px solid #eee;'>
                  <p style='margin:0;font-size:11px;color:#aaa;'>{GymName} &nbsp;|&nbsp; {GymPhone} &nbsp;|&nbsp; {GymAddress}</p>
                </div>
              </div>
            </body>
            </html>";
            return Send(toEmail, subject, body);
        }

        // 4. REJECTION EMAIL
        public static Response SendRejectionEmail(string toEmail)
        {
            string subject = $"{GymName} – Account Registration Update";
            string body = $@"
            <!DOCTYPE html>
            <html>
            <body style='font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;'>
              <div style='max-width:500px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);'>
                <div style='background:#e74c3c;padding:25px;text-align:center;'>
                  <h1 style='color:#fff;margin:0;font-size:26px;'>{GymName}</h1>
                  <p style='color:rgba(255,255,255,0.8);margin:5px 0 0;font-size:13px;'>Registration Update</p>
                </div>
                <div style='padding:30px;'>
                  <h2 style='color:#e74c3c;margin-top:0;'>Hi,</h2>
                  <p style='font-size:15px;color:#333;line-height:1.6;'>We regret to inform you that your registration request at <strong>{GymName}</strong> could not be approved at this time.</p>
                  <div style='background:#fdf2f2;border-left:4px solid #e74c3c;padding:15px;border-radius:5px;margin:20px 0;'>
                    <p style='margin:0;font-size:14px;color:#333;'>📞 <strong>{GymPhone}</strong><br/>📍 {GymAddress}</p>
                  </div>
                </div>
                <div style='background:#f9f9f9;padding:15px;text-align:center;border-top:1px solid #eee;'>
                  <p style='margin:0;font-size:11px;color:#aaa;'>{GymName} &nbsp;|&nbsp; {GymPhone} &nbsp;|&nbsp; {GymAddress}</p>
                </div>
              </div>
            </body>
            </html>";
            return Send(toEmail, subject, body);
        }

        // 5. PAYMENT RECEIPT EMAIL (with optional PDF attachment)
        public static Response SendPaymentReceiptEmail(
            string toEmail,
            string memberName,
            string planType,
            decimal amount,
            string paymentType,
            string paymentDate,
            int paymentId,
            string base64Pdf = null)
        {
            string subject = $"{GymName} – Payment Receipt #{paymentId}";
            string paymentColor = paymentType == "Card" ? "#3498db" : "#27ae60";
            string paymentIcon = paymentType == "Card" ? "💳" : "💵";
            string body = $@"
            <!DOCTYPE html>
            <html>
            <body style='font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;'>
              <div style='max-width:500px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);'>
                <div style='background:#1abc9c;padding:25px;text-align:center;'>
                  <h1 style='color:#fff;margin:0;font-size:26px;'>{GymName}</h1>
                  <p style='color:#d5f5ee;margin:5px 0 0;font-size:13px;'>Payment Receipt</p>
                </div>
                <div style='padding:30px;'>
                  <h2 style='color:#1abc9c;margin-top:0;'>Payment Confirmed ✅</h2>
                  <p style='font-size:14px;color:#555;'>Dear <strong>{memberName}</strong>,<br/>Your payment has been received. Details below:</p>
                  <table style='width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;'>
                    <tr style='background:#f0fdf9;'><td style='padding:10px 15px;color:#666;border-bottom:1px solid #eee;width:45%;'>Receipt No.</td><td style='padding:10px 15px;color:#333;font-weight:bold;border-bottom:1px solid #eee;'>#{paymentId}</td></tr>
                    <tr><td style='padding:10px 15px;color:#666;border-bottom:1px solid #eee;'>Member</td><td style='padding:10px 15px;color:#333;border-bottom:1px solid #eee;'>{memberName}</td></tr>
                    <tr style='background:#f0fdf9;'><td style='padding:10px 15px;color:#666;border-bottom:1px solid #eee;'>Plan</td><td style='padding:10px 15px;color:#333;border-bottom:1px solid #eee;'>{planType}</td></tr>
                    <tr><td style='padding:10px 15px;color:#666;border-bottom:1px solid #eee;'>Payment Type</td><td style='padding:10px 15px;color:{paymentColor};font-weight:bold;border-bottom:1px solid #eee;'>{paymentIcon} {paymentType}</td></tr>
                    <tr style='background:#f0fdf9;'><td style='padding:10px 15px;color:#666;border-bottom:1px solid #eee;'>Date</td><td style='padding:10px 15px;color:#333;border-bottom:1px solid #eee;'>{paymentDate}</td></tr>
                    <tr><td style='padding:15px;color:#333;font-weight:bold;font-size:15px;'>Total Amount</td><td style='padding:15px;color:#1abc9c;font-weight:bold;font-size:18px;'>Rs. {amount:F2}</td></tr>
                  </table>
                  <p style='font-size:13px;color:#888;text-align:center;font-style:italic;'>Thank you for choosing {GymName}! 💪</p>
                </div>
                <div style='background:#f9f9f9;padding:15px;text-align:center;border-top:1px solid #eee;'>
                  <p style='margin:0;font-size:11px;color:#aaa;'>{GymName} &nbsp;|&nbsp; {GymPhone} &nbsp;|&nbsp; {GymAddress}</p>
                </div>
              </div>
            </body>
            </html>";
            return Send(toEmail, subject, body, base64Pdf != null
                ? new Tuple<string, string, string>("Payment_Receipt_" + paymentId + ".pdf", base64Pdf, "application/pdf")
                : null);
        }

        // 6. SUBSCRIPTION EXPIRY EMAIL
        public static Response SendSubscriptionExpiryEmail(
            string toEmail, string memberName, string planType, string expiryDate, int daysLeft)
        {
            string subject = $"{GymName} – Subscription Expiring in {daysLeft} Days";
            string urgencyColor = daysLeft <= 3 ? "#e74c3c" : "#f39c12";
            string urgencyText = daysLeft <= 3 ? "⚠️ URGENT: Renew Now!" : "📅 Renewal Reminder";
            string body = $@"
            <!DOCTYPE html>
            <html>
            <body style='font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;'>
              <div style='max-width:500px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);'>
                <div style='background:{urgencyColor};padding:25px;text-align:center;'>
                  <h1 style='color:#fff;margin:0;font-size:26px;'>{GymName}</h1>
                  <p style='color:rgba(255,255,255,0.85);margin:5px 0 0;font-size:13px;'>{urgencyText}</p>
                </div>
                <div style='padding:30px;'>
                  <h2 style='color:{urgencyColor};margin-top:0;'>Hi {memberName},</h2>
                  <p style='font-size:15px;color:#333;line-height:1.6;'>Your <strong>{planType}</strong> subscription at <strong>{GymName}</strong> is expiring soon.</p>
                  <div style='text-align:center;background:{urgencyColor}15;border:2px solid {urgencyColor};border-radius:10px;padding:20px;margin:20px 0;'>
                    <p style='margin:0;font-size:13px;color:#999;'>EXPIRY DATE</p>
                    <h2 style='margin:8px 0 0;color:{urgencyColor};font-size:24px;'>{expiryDate}</h2>
                    <p style='margin:8px 0 0;font-size:14px;color:#555;'><strong>{daysLeft} day{(daysLeft == 1 ? "" : "s")}</strong> remaining</p>
                  </div>
                </div>
                <div style='background:#f9f9f9;padding:15px;text-align:center;border-top:1px solid #eee;'>
                  <p style='margin:0;font-size:11px;color:#aaa;'>{GymName} &nbsp;|&nbsp; {GymPhone} &nbsp;|&nbsp; {GymAddress}</p>
                </div>
              </div>
            </body>
            </html>";
            return Send(toEmail, subject, body);
        }

        // 7. SCHEDULE REMINDER EMAIL
        public static Response SendScheduleReminderEmail(
            string toEmail, string memberName, string trainerName,
            string scheduleDate, string startTime, string endTime)
        {
            string subject = $"{GymName} – Schedule Reminder for {scheduleDate}";
            string body = $@"
            <!DOCTYPE html>
            <html>
            <body style='font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;'>
              <div style='max-width:500px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);'>
                <div style='background:#9b59b6;padding:25px;text-align:center;'>
                  <h1 style='color:#fff;margin:0;font-size:26px;'>{GymName}</h1>
                  <p style='color:rgba(255,255,255,0.8);margin:5px 0 0;font-size:13px;'>Workout Schedule Reminder</p>
                </div>
                <div style='padding:30px;'>
                  <h2 style='color:#9b59b6;margin-top:0;'>Hi {memberName}! 🏃</h2>
                  <p style='font-size:15px;color:#333;line-height:1.6;'>You have a workout session scheduled for tomorrow. Get ready to crush it!</p>
                  <table style='width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;'>
                    <tr style='background:#f5eef8;'><td style='padding:12px 15px;color:#666;border-bottom:1px solid #eee;width:40%;'>📅 Date</td><td style='padding:12px 15px;color:#333;font-weight:bold;border-bottom:1px solid #eee;'>{scheduleDate}</td></tr>
                    <tr><td style='padding:12px 15px;color:#666;border-bottom:1px solid #eee;'>⏰ Time</td><td style='padding:12px 15px;color:#333;border-bottom:1px solid #eee;'>{startTime} – {endTime}</td></tr>
                    <tr style='background:#f5eef8;'><td style='padding:12px 15px;color:#666;'>🏋️ Trainer</td><td style='padding:12px 15px;color:#9b59b6;font-weight:bold;'>{trainerName}</td></tr>
                  </table>
                  <p style='font-size:13px;color:#888;text-align:center;'>Remember to bring your RFID card and stay hydrated! 💧</p>
                </div>
                <div style='background:#f9f9f9;padding:15px;text-align:center;border-top:1px solid #eee;'>
                  <p style='margin:0;font-size:11px;color:#aaa;'>{GymName} &nbsp;|&nbsp; {GymPhone} &nbsp;|&nbsp; {GymAddress}</p>
                </div>
              </div>
            </body>
            </html>";
            return Send(toEmail, subject, body);
        }

        // 8. TRAINER APPROVAL EMAIL
        public static Response SendTrainerApprovalEmail(string memberEmail, string trainerName, string memberName)
        {
            string subject = $"{GymName} – Trainer Request Approved";
            string body = $@"
            <!DOCTYPE html>
            <html>
            <body style='font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;'>
              <div style='max-width:500px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);'>
                <div style='background:#1abc9c;padding:25px;text-align:center;'>
                  <h1 style='color:#fff;margin:0;font-size:26px;'>{GymName}</h1>
                  <p style='color:#d5f5ee;margin:5px 0 0;font-size:13px;'>Trainer Assignment Update</p>
                </div>
                <div style='padding:30px;'>
                  <h2 style='color:#1abc9c;margin-top:0;'>Great News, {memberName}!</h2>
                  <p style='font-size:15px;color:#333;line-height:1.6;'>Your request for a personal trainer has been approved.</p>
                  <div style='background:#f0fdf9;padding:15px;border-radius:5px;margin:20px 0;'>
                    <p style='margin:0;font-size:14px;'>💪 Your Trainer: <strong>{trainerName}</strong></p>
                  </div>
                  <p style='font-size:14px;color:#555;'>Log in to your Member Dashboard to see your new workout routines and schedule.</p>
                </div>
                <div style='background:#f9f9f9;padding:15px;text-align:center;border-top:1px solid #eee;'>
                  <p style='margin:0;font-size:11px;color:#aaa;'>{GymName}</p>
                </div>
              </div>
            </body>
            </html>";
            return Send(memberEmail, subject, body);
        }

        // 9. PAYMENT RECEIPT (overload - simple string amount version)
        public static Response SendPaymentReceiptEmail(
            string toEmail, string memberName, string amount,
            string receiptNo, string date, string subType)
        {
            string subject = $"{GymName} – Payment Receipt #{receiptNo}";
            string body = $@"
            <!DOCTYPE html>
            <html>
            <body style='font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;'>
              <div style='max-width:450px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);'>
                <div style='background:#2c3e50;padding:25px;text-align:center;color:#fff;'>
                  <h1 style='margin:0;font-size:24px;letter-spacing:2px;'>{GymName}</h1>
                  <p style='margin:5px 0 0;font-size:12px;opacity:0.8;'>PAYMENT SUCCESSFUL</p>
                </div>
                <div style='padding:30px;'>
                  <div style='text-align:center;margin-bottom:25px;'>
                    <div style='display:inline-block;background:#e8f8f5;color:#1abc9c;padding:10px 20px;border-radius:50px;font-weight:bold;font-size:18px;'>LKR {amount}</div>
                  </div>
                  <p style='font-size:14px;color:#333;'>Dear {memberName},</p>
                  <p style='font-size:14px;color:#555;line-height:1.5;'>Thank you for your payment. This email serves as your official receipt for the membership subscription.</p>
                  <table style='width:100%;font-size:13px;border-collapse:collapse;margin:20px 0;'>
                    <tr><td style='padding:8px 0;color:#888;'>Receipt No:</td><td style='padding:8px 0;text-align:right;font-weight:bold;'>{receiptNo}</td></tr>
                    <tr><td style='padding:8px 0;color:#888;'>Date:</td><td style='padding:8px 0;text-align:right;'>{date}</td></tr>
                    <tr><td style='padding:8px 0;color:#888;'>Subscription:</td><td style='padding:8px 0;text-align:right;'>{subType}</td></tr>
                    <tr><td style='padding:8px 0;color:#888;'>Status:</td><td style='padding:8px 0;text-align:right;color:#27ae60;'>Paid (Cash)</td></tr>
                  </table>
                </div>
                <div style='background:#f9f9f9;padding:20px;text-align:center;border-top:1px solid #eee;'>
                  <p style='margin:0;font-size:11px;color:#aaa;'>{GymName} — {GymAddress}</p>
                </div>
              </div>
            </body>
            </html>";
            return Send(toEmail, subject, body);
        }

        // ── CORE SEND METHOD ──────────────────────────────────────────
        private static Response Send(string toEmail, string subject, string htmlBody,
            Tuple<string, string, string> attachment = null)
        {
            var result = new Response();
            try
            {
                using (var client = new SmtpClient(Host, Port))
                {
                    client.Credentials = new NetworkCredential(SmtpUser, Password);
                    client.EnableSsl = true;

                    var message = new MailMessage
                    {
                        From = new MailAddress(From, GymName),
                        Subject = subject,
                        Body = htmlBody,
                        IsBodyHtml = true
                    };

                    if (attachment != null)
                    {
                        byte[] bytes = Convert.FromBase64String(attachment.Item2);
                        System.IO.MemoryStream ms = new System.IO.MemoryStream(bytes);
                        message.Attachments.Add(new Attachment(ms, attachment.Item1, attachment.Item3));
                    }

                    message.To.Add(toEmail);
                    client.Send(message);
                }

                result.StatusCode = 200;
                result.Result = $"Email sent successfully to {toEmail}";
            }
            catch (SmtpException smtpEx)
            {
                result.StatusCode = 500;
                result.Result = $"SMTP Error: {smtpEx.Message} | Status: {smtpEx.StatusCode}";
            }
            catch (Exception ex)
            {
                result.StatusCode = 500;
                result.Result = $"Email Error: {ex.Message} | {ex.InnerException?.Message}";
            }
            return result;
        }

        internal static void SendApprovalEmail(string email, string username, bool approved)
        {
            throw new NotImplementedException();
        }
    }
}