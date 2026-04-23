// ============================================================
//  File : BusinessLogic/SmsHelper.cs
//  SMS OTP delivery via esystems.cdl.lk gateway
//
//  URL format: ?mobileNo={phone}&message=Your OTP is {otp}
// ============================================================
using GymManagement.Models;
using System;
using System.Configuration;
using System.Net.Http;

namespace GymManagement.BusinessLayer
{
    public static class SmsHelper
    {
        private static readonly string SmsGatewayBase =
            "https://esystems.cdl.lk/Backend/SMSGateway/api/SMS/DTSSendMessage";

        // Shared HttpClient — avoids socket exhaustion
        private static readonly HttpClient _http = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(15)
        };

        public static Response SendOtpSms(string toPhone, string otp)
        {
            var result = new Response();

            if (string.IsNullOrWhiteSpace(toPhone))
            {
                result.StatusCode = 400;
                result.Result = "Phone number is required.";
                return result;
            }

            try
            {
                // Exact format: ?mobileNo={phone}&message=Your OTP is {otp}
                string url = $"{SmsGatewayBase}" +
                             $"?mobileNo={Uri.EscapeDataString(toPhone)}" +
                             $"&message={Uri.EscapeDataString($"Your OTP is {otp}")}";

                var response = _http.GetAsync(url).GetAwaiter().GetResult();

                result.StatusCode = response.IsSuccessStatusCode ? 200 : 500;
                result.Result = response.IsSuccessStatusCode
                                        ? $"OTP sent to {toPhone}"
                                        : $"SMS gateway returned {(int)response.StatusCode}.";
            }
            catch (Exception ex)
            {
                result.StatusCode = 500;
                result.Result = $"SMS Error: {ex.Message}";
            }

            return result;
        }
    }
}